export type NodeID = string;
export type EdgeID = string;
export type AnyNode = { id: NodeID };
export type AnyEdge = { id: EdgeID; parentID: NodeID; childID: NodeID };

export type AppState = {
  nodes: Map<NodeID, AnyNode>;
  positions: Map<NodeID, { x: number; y: number }>;
  selectedNodeIDs: Set<NodeID>;
  edges: Map<NodeID, AnyEdge>;
};

export type GraphState = Omit<AppState, "positions">;
