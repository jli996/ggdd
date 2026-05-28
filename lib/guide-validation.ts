import matter from 'gray-matter';
import { z } from 'zod';

export const GuideFrontmatterSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, 'id must be lowercase letters, digits, hyphens'),
  category: z.enum([
    'unity-engine',
    'unity-performance',
    'game-design-action',
    'game-design-deckbuilder',
  ]),
  title: z.string().min(1),
  description: z.string().min(1),
  useCases: z.array(z.string().min(1)).min(1),
  relatedGuides: z.array(z.string()).optional(),
  appliesTo: z.array(z.string()).optional(),
  gradeMode: z.enum(['static', 'unity', 'static+unity']),
  unityVersion: z.string().min(1),
  baseApp: z.string().min(1),
});

export type GuideFrontmatter = z.infer<typeof GuideFrontmatterSchema>;

export interface ParsedGuide {
  frontmatter: Record<string, unknown>;
  body: string;
}

export class GuideValidationError extends Error {
  readonly issues?: unknown;

  constructor(message: string, issues?: unknown) {
    super(message);
    this.name = 'GuideValidationError';
    this.issues = issues;
  }
}

export function parseGuide(source: string): ParsedGuide {
  const { data, content } = matter(source);
  return { frontmatter: data, body: content };
}

export function validateFrontmatter(raw: Record<string, unknown>): GuideFrontmatter {
  const result = GuideFrontmatterSchema.safeParse(raw);
  if (!result.success) {
    throw new GuideValidationError(
      `Invalid guide frontmatter: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}
