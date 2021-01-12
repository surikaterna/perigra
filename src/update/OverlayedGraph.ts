import Graph from '../Graph';
import GraphUpdater from './GraphUpdater';

/**
 * Represents a in-transit graph which is a mix between a immutable Graph and in-progress changes from GraphUpdater
 */
export default class OverlayedGraph {
    constructor(graph: Graph, graphUpdater: GraphUpdater) {

    }
}