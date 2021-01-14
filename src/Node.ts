import Entity from './Entity';
type Position = [number, number];
export default interface Node extends Entity {
    position: Position
}