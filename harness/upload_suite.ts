import { resolveSuiteConfig } from './config.ts';

export async function uploadSuite(): Promise<void> {
  const cfg = await resolveSuiteConfig();
  if (!process.env.GGDD_GCS_BUCKET) {
    console.log('GGDD_GCS_BUCKET not set; skipping upload (Plan 5+ wires real GCS upload).');
    return;
  }
  console.log(`[TODO Plan 5] Upload ${cfg.outputDir} to gs://${process.env.GGDD_GCS_BUCKET}/`);
}
