import { z } from 'zod';

export const TagsInputSchema = z.object({});

export const TagsTool = {
  name: 'ggdd_tags',
  description: 'List all tags in the ggdd taxonomy. Use to discover what tag-based filters are available.',
  inputSchema: TagsInputSchema,
  handler: async (_input: z.infer<typeof TagsInputSchema>) => {
    const { TAGS } = await import('../../lib/tag-index.gen.ts');
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(TAGS, null, 2) }],
    };
  },
};
