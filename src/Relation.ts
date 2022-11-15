/*
  Idea: https://wiki.openstreetmap.org/wiki/Relation
*/

import Entity from './Entity';
import Node from './Node';
import Path from './Path';

export type RelationMember<PathType, NodeType> = Entity<(Node<NodeType> | Path<PathType, NodeType> | Relation<NodeType, PathType>) & { role?: string }>;

type Relation<PathType, NodeType> = Entity<{
  relationType: string;
  members: RelationMember<PathType, NodeType>[];
}>;

export default Relation;
