import { setBackend, tensor2d, type Tensor } from '@tensorflow/tfjs-core';
import { loadGraphModel, type GraphModel } from '@tensorflow/tfjs-converter';
import { AutoTokenizer, type PreTrainedTokenizer } from '@huggingface/transformers';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import './tfjs-kernels.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_DIR = path.join(__dirname, 'tfjs_model_minilm');
const MODEL_JSON = path.join(MODEL_DIR, 'model.json');

function createNodeFileSystemIOHandler(modelJsonPath: string) {
  return {
    load: async () => {
      const dir = path.dirname(modelJsonPath);
      const modelJson = JSON.parse(await fs.promises.readFile(modelJsonPath, 'utf-8'));
      const modelTopology = modelJson.modelTopology;
      const weightsManifest = modelJson.weightsManifest;
      const weightSpecs: any[] = [];

      // MiniLM weights are a single shard.
      const manifest = weightsManifest[0];
      weightSpecs.push(...manifest.weights);
      const shardPath = manifest.paths[0];
      const fullPath = path.resolve(dir, shardPath);
      const weightData = (await fs.promises.readFile(fullPath)).buffer;

      return { modelTopology, weightSpecs, weightData };
    },
  };
}

export class TfjsEmbedder {
  private model: GraphModel | null = null;
  private tokenizer: PreTrainedTokenizer | null = null;
  private initPromise: Promise<void> | null = null;

  private async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      await setBackend('cpu');
      this.model = await loadGraphModel(createNodeFileSystemIOHandler(MODEL_JSON) as any);
      this.tokenizer = await AutoTokenizer.from_pretrained('Xenova/all-MiniLM-L6-v2');
    })();
    return this.initPromise;
  }

  async embed(text: string): Promise<Float32Array> {
    await this.init();
    if (!this.model || !this.tokenizer) throw new Error('embedder not initialized');

    const encoded = await this.tokenizer(text, { padding: true, truncation: true });
    const inputIds = encoded.input_ids;
    const attentionMask = encoded.attention_mask;

    // Extract numeric data (handles BigInt64Array from transformers)
    const extractData = (tensor: any): number[] =>
      Array.from(tensor.data ?? tensor, (x: any) => Number(x));

    const inputIdsData = extractData(inputIds);
    const attentionMaskData = extractData(attentionMask);
    const seqLen = inputIdsData.length;
    const tokenTypeIdsData = new Array(seqLen).fill(0);

    const inputIdsTensor = tensor2d([inputIdsData], undefined, 'int32');
    const attentionTensor = tensor2d([attentionMaskData], undefined, 'int32');
    const tokenTypeTensor = tensor2d([tokenTypeIdsData], undefined, 'int32');

    try {
      // The model already performs mean-pooling + L2-normalization internally.
      // Output shape: [1, 384]
      const output = this.model.execute(
        {
          input_ids: inputIdsTensor,
          attention_mask: attentionTensor,
          token_type_ids: tokenTypeTensor,
        },
      ) as Tensor;

      const data = await output.data() as Float32Array;
      output.dispose();
      return new Float32Array(data);
    } finally {
      inputIdsTensor.dispose();
      attentionTensor.dispose();
      tokenTypeTensor.dispose();
    }
  }
}
