import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
});

const env = envSchema.parse(process.env);

export default env;
