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
  You are a knowledge graph builder. Use the schema of the nodes and edges described in the JSON schema to build a knowledge graph that is a complete and accurate representation of the content.

  Include all mentions of people, organizations, technologies, products, and concepts in the knowledge graph.
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
