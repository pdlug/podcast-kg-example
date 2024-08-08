import kuzu from 'kuzu';

import { EdgeSchema, NodeSchema, type KnowledgeGraph } from './schema';
import type { ZodTypeAny } from 'zod';

const zodToKuzuTypeMap: Record<string, string> = {
  ZodString: 'STRING',
  ZodNumber: 'INT64',
  ZodBigInt: 'INT64',
  ZodBoolean: 'BOOLEAN',
  ZodDate: 'DATE',
  ZodNull: 'NULL',
  ZodLiteral: 'STRING',
} as const;

/**
 * Mape a Zod schema type to a Kuzu (Cypher) type.
 *
 * @param zodType
 * @returns
 */
function zodToKuzuType(zodType: Readonly<ZodTypeAny>) {
  const kuzuType = zodToKuzuTypeMap[zodType._def.typeName];
  if (!kuzuType) {
    throw new Error(`Can't handle Zod type ${zodType._def.typeName}`);
  }

  return kuzuType;
}

/**
 * Generate Kuzu CREATE NODE TABLE statements for each node type. If there is a specific
 * type defined in the schema for the node, those properties will be used, otherwise
 * the default node type will be used.
 *
 * @param nodes
 * @returns
 */
function generateKuzuNodeTables(nodes: Readonly<KnowledgeGraph['nodes']>) {
  const nodeTypes = new Set(nodes.map((node) => node.type));

  const defaultNodeSchema = NodeSchema.options.find((node) => node.shape.type._def.typeName === 'ZodString');
  if (!defaultNodeSchema) {
    throw new Error('Could not find default node schema');
  }

  const statements = [...nodeTypes].map((nodeType) => {
    const nodeSchema =
      NodeSchema.options.find(
        (node) => node.shape.type._def.typeName === 'ZodLiteral' && node.shape.type._def.value === nodeType,
      ) ?? defaultNodeSchema;

    const nodeProperties = Object.entries(nodeSchema.shape)
      .filter(([key]) => key !== 'type')
      .map(([key, value]) => `${key} ${zodToKuzuType(value)}`);

    return `CREATE NODE TABLE IF NOT EXISTS ${nodeType} (${nodeProperties.join(', ')}, PRIMARY KEY (id));`;
  });

  return statements;
}

/**
 * Generate Kuzu CREATE REL TABLE statements for each edge type, we enumerate all possible node types and
 * allow any relationship between them.
 *
 * @param edges
 * @returns
 */
function generateKuzuEdgeTables(kg: Readonly<KnowledgeGraph>) {
  const nodeTypes = new Set(kg.nodes.map((node) => node.type));
  const edgeTypes = new Set(kg.edges.map((edge) => edge.label));

  // enumerate all possible node pairs
  const nodePairings = [...nodeTypes].map((nodeType) =>
    [...nodeTypes].map((nodeType2) => `FROM ${nodeType} TO ${nodeType2}`).join(', '),
  );

  const edgeProperties = Object.entries(EdgeSchema.shape)
    .filter(([key]) => ['source', 'target'].includes(key))
    .map(([key, value]) => `${key} ${zodToKuzuType(value)}`)
    .join(', ');

  const statements = [...edgeTypes].map((edgeType) => {
    return `CREATE REL TABLE GROUP IF NOT EXISTS ${edgeType} (${nodePairings}, ${edgeProperties});`;
  });

  return statements;
}

/**
 * Walk through the graph and generate Kuzu CREATE TABLE statements for each node type and edge type.
 *
 * @param graph
 * @returns
 */
function generateKuzuTables(graph: Readonly<KnowledgeGraph>) {
  return [...generateKuzuNodeTables(graph.nodes), ...generateKuzuEdgeTables(graph)];
}

/**
 * Create the database structure.
 *
 * @param conn
 * @param kg
 */
export async function createDB(conn: Readonly<kuzu.Connection>, kg: Readonly<KnowledgeGraph>) {
  for (const statement of generateKuzuTables(kg)) {
    await conn.query(statement);
  }
}

/**
 * Insert the nodes into the database.
 *
 * @param conn
 * @param kg
 */
async function insertNodes(conn: Readonly<kuzu.Connection>, kg: Readonly<KnowledgeGraph>) {
  for (const node of kg.nodes) {
    const nodeStmt = await conn.prepare(`CREATE (n:${node.type} {id: $id, label: $label})`);
    await conn.execute(nodeStmt, { id: node.id, label: node.label });
  }
}

/**
 * Insert the edges into the database. Kuzu requires the node type in the create
 * relationship statements, e.g.: we must do
 * `MATCH (n1:Concept), (n2:Concept) WHERE ... MERGE (n1)-[:RELATED]->(n2)`
 *
 * Rather than:
 * `MATCH (n1), (n2) WHERE ... MERGE (n1)-[:RELATED]->(n2)`
 *
 * Which is why we need to generate a mapping of node ID to node type.
 *
 * @param conn
 * @param kg
 */
async function insertEdges(conn: Readonly<kuzu.Connection>, kg: Readonly<KnowledgeGraph>) {
  const nodeIdToType = new Map(kg.nodes.map((node) => [node.id, node.type]));

  for (const edge of kg.edges) {
    const edgeStmt = await conn.prepare(`
      MATCH (n1:${nodeIdToType.get(edge.source)}), (n2:${nodeIdToType.get(edge.target)})
      WHERE n1.id = $source AND n2.id = $target
      MERGE (n1)-[:${edge.label}]->(n2)
    `);

    await conn.execute(edgeStmt, {
      source: edge.source,
      target: edge.target,
    });
  }
}

/**
 * Load the knowledge graph into the database.
 *
 * @param conn
 * @param kg
 */
export async function loadKnowledgeGraph(conn: Readonly<kuzu.Connection>, kg: Readonly<KnowledgeGraph>) {
  await insertNodes(conn, kg);
  await insertEdges(conn, kg);
}
