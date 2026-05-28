import { z } from 'zod';
import { retrieveUseCase, RetrieveError } from '../../lib/retrieve.ts';

export const RetrieveInputSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).describe('Guide IDs to retrieve'),
});

export const RetrieveTool = {
  name: 'ggdd_retrieve',
  description: 'Retrieve full guide markdown for one or more guide IDs. Use after ggdd_search.',
  inputSchema: RetrieveInputSchema,
  handler: async (input: z.infer<typeof RetrieveInputSchema>) => {
    const parts: string[] = [];
    const errors: string[] = [];
    for (const id of input.ids) {
      try {
        const md = await retrieveUseCase(id);
        parts.push(`--- Guide for ${id} ---\n${md}`);
      } catch (err) {
        if (err instanceof RetrieveError) errors.push(`Retrieve failed for ${id}: ${err.message}`);
        else errors.push(`Retrieve failed for ${id}: ${String(err)}`);
      }
    }
    return {
      content: [{ type: 'text' as const, text: parts.join('\n\n') + (errors.length ? `\n\nErrors:\n${errors.join('\n')}` : '') }],
      isError: errors.length > 0 && parts.length === 0,
    };
  },
};
