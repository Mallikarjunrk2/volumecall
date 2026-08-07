import { z } from "zod";

export const NewsDataArticleSchema = z.object({
  article_id: z.string().optional().or(z.null()),
  title: z.string(),
  link: z.string().url().or(z.string().optional().or(z.null())),
  description: z.string().nullable().optional(),
  pubDate: z.string().optional().or(z.null()),
  source_id: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  category: z.array(z.string()).nullable().optional(),
  keywords: z.array(z.string()).nullable().optional(),
});

export const NewsDataResponseSchema = z.object({
  status: z.string(),
  totalResults: z.number().optional(),
  results: z.array(NewsDataArticleSchema).optional().default([]),
  nextPage: z.string().optional().or(z.null()),
});

export type NewsDataArticle = z.infer<typeof NewsDataArticleSchema>;
export type NewsDataResponse = z.infer<typeof NewsDataResponseSchema>;
