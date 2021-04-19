import Entity from './Entity';
import Node from './Node';

type Path<PathType, NodeType> = Entity<PathType & { nodes: Readonly<Node<NodeType>[]> }>;

export default Path;
