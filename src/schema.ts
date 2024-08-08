import { z } from 'zod';

const edgeTypes = [
  'HAS_EPISODE',
  'HAS_HOST',
  'HAS_GUEST',
  'INTERVIEWS',
  'MENTIONS',
  'KNOWS',
  'WORKS_AT',
  'USES',
  'RELATED_TO',
  'CHILD_OF',
];

const BaseNodeSchema = z.object({
  id: z.string().describe('The id of the node as a number without a leading zero.'),
  label: z.string(),
  type: z.string().describe('The type of node'),
});

const PodcastNodeSchema = BaseNodeSchema.extend({
  type: z.literal('Podcast'),
}).describe('A podcast');

const EpisodeNodeSchema = BaseNodeSchema.extend({
  type: z.literal('Episode'),
}).describe('An episode of a podcast');

const OrganizationNodeSchema = BaseNodeSchema.extend({
  type: z.literal('Organization'),
}).describe('An organization like a company or university');

const PersonNodeSchema = BaseNodeSchema.extend({
  type: z.literal('Person'),
}).describe('A person');

const TechnologyNodeSchema = BaseNodeSchema.extend({
  type: z.literal('Technology'),
}).describe('A technology like a programming language or framework');

const ProductNodeSchema = BaseNodeSchema.extend({
  type: z.literal('Product'),
}).describe('A product like a software or hardware product');

const ConceptNodeSchema = BaseNodeSchema.extend({
  type: z.literal('Concept'),
}).describe('A concept like a domain, idea, topic, or abstract thought');

const OtherNodeSchema = BaseNodeSchema.extend({
  type: z.string().describe('The type of node'),
}).describe('A node of an unknown type');

export const NodeSchema = z.union([
  PodcastNodeSchema,
  EpisodeNodeSchema,
  OrganizationNodeSchema,
  PersonNodeSchema,
  TechnologyNodeSchema,
  ProductNodeSchema,
  ConceptNodeSchema,
  OtherNodeSchema,
]);

export const EdgeSchema = z.object({
  source: z.string().describe('The id of the source node. Do not include leading zeros if using numbers.'),
  target: z.string().describe('The id of the target node. Do not include leading zeros if using numbers.'),
  label: z.string().describe(`The label of the edge. Allowed values: ${edgeTypes.join(', ')}`),
});

export const KnowledgeGraphSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type KnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>;
