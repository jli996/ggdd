import { z } from 'zod';
import { searchUseCases } from '../../lib/search.ts';

export const SearchInputSchema = z.object({
  query: z.string().min(1).describe('Natural-language query describing what you want guidance on'),
});

export const SearchTool = {
  name: 'ggdd_search',
  description: 'Semantic search over the ggdd guide catalog. Returns top matches with similarity scores. Follow up with ggdd_retrieve for the full guide.',
  inputSchema: SearchInputSchema,
  handler: async (input: z.infer<typeof SearchInputSchema>) => {
    const results = await searchUseCases(input.query);
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(results, null, 2),
      }],
    };
  },
};
