import type { Airport, AirportNode, AirportEdge } from './schemas'

export type { AirportNode, AirportEdge }

export type NodePath = string[]

/**
 * Returns all edges adjacent to a given node (bidirectional — edges are
 * treated as undirected regardless of their from/to direction in the JSON).
 */
export function adjacentEdges(airport: Airport, nodeId: string): AirportEdge[] {
  return airport.edges.filter(
    (e) => e.from === nodeId || e.to === nodeId,
  )
}

/**
 * Returns the IDs of all nodes directly connected to the given node.
 */
export function neighbors(airport: Airport, nodeId: string): string[] {
  return adjacentEdges(airport, nodeId).map((e) =>
    e.from === nodeId ? e.to : e.from,
  )
}

/**
 * BFS shortest path between two nodes.
 * Returns an array of node IDs (including start and end), or null if
 * the destination is unreachable.
 */
export function shortestPath(
  airport: Airport,
  startId: string,
  endId: string,
): NodePath | null {
  if (startId === endId) return [startId]

  const visited = new Set<string>([startId])
  // Queue stores partial paths
  const queue: string[][] = [[startId]]

  while (queue.length > 0) {
    const path = queue.shift()!
    const current = path[path.length - 1]

    for (const next of neighbors(airport, current)) {
      if (visited.has(next)) continue
      const newPath = [...path, next]
      if (next === endId) return newPath
      visited.add(next)
      queue.push(newPath)
    }
  }

  return null
}

/**
 * Returns the runway IDs crossed by traversing the given path.
 * A runway crossing is counted for each consecutive pair of nodes in the
 * path where the edge between them has kind === 'runway'.
 * Result is deduplicated.
 */
export function runwaysCrossed(airport: Airport, path: NodePath): string[] {
  const crossed = new Set<string>()

  for (let i = 0; i < path.length - 1; i++) {
    const edge = edgeBetween(airport, path[i], path[i + 1])
    if (edge && edge.kind === 'runway' && edge.runwayId !== undefined) {
      crossed.add(edge.runwayId)
    }
  }

  return Array.from(crossed)
}

/**
 * Returns the runway IDs that were crossed WITHOUT authorization.
 * Any runway in runwaysCrossed that is NOT in authorizedRunwayIds is returned.
 */
export function unauthorizedCrossings(
  airport: Airport,
  path: NodePath,
  authorizedRunwayIds: string[],
): string[] {
  const crossed = runwaysCrossed(airport, path)
  const authorized = new Set(authorizedRunwayIds)
  return crossed.filter((id) => !authorized.has(id))
}

/**
 * Returns true if the given nodeId is a hold-short node for the given runwayId.
 */
export function isHoldShortFor(
  airport: Airport,
  nodeId: string,
  runwayId: string,
): boolean {
  const node = airport.nodes.find((n) => n.id === nodeId)
  return node?.kind === 'holdShort' && node.holdShortFor === runwayId
}

/**
 * Returns all hold-short node IDs for a given runway.
 */
export function holdShortNodes(airport: Airport, runwayId: string): string[] {
  return airport.nodes
    .filter((n) => n.kind === 'holdShort' && n.holdShortFor === runwayId)
    .map((n) => n.id)
}

/**
 * Returns the edge between two adjacent nodes (undirected), or undefined if
 * the nodes are not directly connected.
 */
export function edgeBetween(
  airport: Airport,
  fromId: string,
  toId: string,
): AirportEdge | undefined {
  return airport.edges.find(
    (e) =>
      (e.from === fromId && e.to === toId) ||
      (e.from === toId && e.to === fromId),
  )
}
