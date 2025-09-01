import { z } from 'zod';

export const createShortUrlSchema = z.object({
  url: z.string().url(),
  validity: z.number().int().positive().max(60*24).optional(), 
  shortcode: z.string().regex(/^[a-zA-Z0-9_-]{3,30}$/).optional()
});
