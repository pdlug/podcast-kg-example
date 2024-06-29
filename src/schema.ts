import { z } from 'zod';

const edgeTypes = ['HAS_EPISODE', 'HAS_HOST', 'HAS_GUEST', 'MENTIONS', 'KNOWS', 'WORKS_AT', 'USES'];

const BaseNodeSchema = z.object({
  id: z.string().describe('The id of the node as a number'),
  label: z.string(),
  type: z.string().describe('The type of node'),
});

const PodcastSchema = BaseNodeSchema.extend({
  type: z.literal('Podcast'),
  name: z.string().describe('The name of the podcast'),
}).describe('A podcast');

const EpisodeSchema = BaseNodeSchema.extend({
  type: z.literal('Episode'),
  title: z.string().describe('The title of the episode'),
}).describe('An episode of a podcast');

const OrganizationSchema = BaseNodeSchema.extend({
  type: z.literal('Organization'),
  name: z.string().describe('The name of the organization'),
}).describe('An organization like a company or university');

const PersonSchema = BaseNodeSchema.extend({
  type: z.literal('Person'),
  name: z.string().describe('The name of the person'),
}).describe('A person');

const TechnologySchema = BaseNodeSchema.extend({
  type: z.literal('Technology'),
  name: z.string().describe('The name of the technology'),
}).describe('A technology like a programming language or framework');

const ProductSchema = BaseNodeSchema.extend({
  type: z.literal('Product'),
  name: z.string().describe('The name of the product'),
}).describe('A product like a software or hardware product');

const ConceptSchema = BaseNodeSchema.extend({
  type: z.literal('Concept'),
  name: z.string().describe('The name of the concept'),
}).describe('A concept like a domain, idea, topic, or abstract thought');

const NodeSchema = z.discriminatedUnion('type', [
  PodcastSchema,
  EpisodeSchema,
  OrganizationSchema,
  PersonSchema,
  TechnologySchema,
  ProductSchema,
  ConceptSchema,
]);

const EdgeSchema = z.object({
  source: z.string().describe('The id of the source node'),
  target: z.string().describe('The id of the target node'),
  label: z.string().describe(`The label of the edge. Allowed values: ${edgeTypes.join(', ')}`),
});

export const KnowledgeGraphSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type KnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>;
