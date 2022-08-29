import Graph from '../Graph';
import GraphUpdater from './GraphUpdater';

/**
 * Represents a in-transit graph which is a mix between a immutable Graph and in-progress changes from GraphUpdater
 */
export default class OverlayedGraph<N, P> {
  private graph: Graph<N, P>;
  private graphUpdater: GraphUpdater<N, P>;

  constructor(graph: Graph<N, P>, graphUpdater: GraphUpdater<N, P>) {
    this.graph = graph;
    this.graphUpdater = graphUpdater;
  }
}
