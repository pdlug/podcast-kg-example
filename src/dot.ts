import type { KnowledgeGraph } from './schema';

/**
 * Convert a knowledge graph to DOT format for visualization with Graphviz.
 *
 * @param graph
 * @returns
 */
export function kgToDOT(graph: Readonly<KnowledgeGraph>) {
  const nodes = graph.nodes.map((node) => `"${node.id}" [label="${node.label}"]`).join('\n');
  const edges = graph.edges.map((edge) => `"${edge.source}" -> "${edge.target}" [label="${edge.label}"]`).join('\n');

  return `digraph G {
  ${nodes}
  ${edges}
}`;
}
