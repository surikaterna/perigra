import Entity from './Entity';
import Node from './Node';

export default interface Path extends Entity {
    readonly nodes: Node[];
}