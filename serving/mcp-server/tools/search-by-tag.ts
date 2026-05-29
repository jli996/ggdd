import { z } from 'zod';
import { searchByTag } from '../../lib/search.ts';

export const SearchByTagInputSchema = z.object({
  tag: z.string().min(1).describe('Exact tag name from the ggdd taxonomy (e.g. "moba", "tier-progression").'),
});

export const SearchByTagTool = {
  name: 'ggdd_search_by_tag',
  description: 'Filter guides by exact tag match. Returns all guides that carry the given tag. Use ggdd_tags to discover available tags.',
  inputSchema: SearchByTagInputSchema,
  handler: async (input: z.infer<typeof SearchByTagInputSchema>) => {
    const results = searchByTag(input.tag);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(results, null, 2) }],
    };
  },
};
