import { createLLMClient } from 'llm-polyglot';

import Instructor from '@instructor-ai/instructor';
import OpenAI from 'openai';

import env from './env';

import { KnowledgeGraphSchema } from './schema';

const anthropicClient = createLLMClient({
  provider: 'anthropic',
  apiKey: env.ANTHROPIC_API_KEY,
});

const oai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const modelProviders = {
  anthropic: {
    instructor: () =>
      Instructor<typeof anthropicClient>({
        client: anthropicClient,
        mode: 'TOOLS',
      }),
  },
  openai: {
    instructor: () =>
      Instructor({
        client: oai,
        mode: 'TOOLS',
      }),
  },
};

const systemPrompt = `
  You are a knowledge graph builder, use the supplied JSON schema to build a knowledge graph that is a complete and accurate representation of the content. You must only use the node types and edge types defined in the schema.

  Be comprehensive and include all mentions of people, organizations, technologies, products, concepts, etc. in the knowledge graph. Use as fine grained a granularity as possible and link to parents where applicable. For example, if a technology like "React" is mentioned, link it to the "JavaScript" technology and also the "Frontend" concept.
`;

export async function buildGraph(provider: keyof typeof modelProviders, model: string, input: string) {
  const instructor = modelProviders[provider].instructor();

  const user = await instructor.chat.completions.create({
    model,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `${systemPrompt}\n\n${input}`,
      },
    ],
    response_model: {
      name: 'KnowledgeGraph',
      schema: KnowledgeGraphSchema,
    },
  });

  return user;
}
