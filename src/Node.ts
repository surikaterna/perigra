import Entity from './Entity';
type Position = [number, number];

type Node<T> = Entity<T & { 
    position: Position
}>;

export default Node;
