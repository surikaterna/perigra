import Entity from './Entity';
import Node from './Node';

type Path<T> = Entity<T & { nodes: Node<T>[] }>;

export default Path;
