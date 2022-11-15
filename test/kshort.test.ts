import { kshort } from '@surikat/kshort';
import EntityType from '../src/EntityType';
import Graph from '../src/Graph';
import Node from '../src/Node';

type GraphGetters = {
  getVertices: () => string[];
  getEdges: () => { from: string; to: string; cost: number }[];
  getNeighbors: (u: string) => string[];
  getCost: (u: string, v: string) => number;
};

type Edge = { from: string; to: string; cost: number };

const uniqNodes = (items: Node<any>[]) =>
  items.filter((value, index, self) => {
    return self.findIndex((x) => x.id === value.id) === index;
  });

describe('should be able to use kshort with Perigra structure', () => {
  it.only('should be able to retreive shortest path', (done) => {
    const position: [number, number] = [0, 0];
    const g3 = { id: 'g3', type: EntityType.Node, tags: {}, position };
    const g4 = { id: 'g4', type: EntityType.Node, tags: {}, position };

    const r3 = { id: 'r3', type: EntityType.Node, tags: {}, position };
    const r4 = { id: 'r4', type: EntityType.Node, tags: {}, position };

    const l15 = { id: 'l15', type: EntityType.Node, tags: {}, position };
    const l16 = { id: 'l16', type: EntityType.Node, tags: {}, position };
    const l17 = { id: 'l17', type: EntityType.Node, tags: {}, position };
    const l18 = { id: 'l18', type: EntityType.Node, tags: {}, position };
    const l19 = { id: 'l19', type: EntityType.Node, tags: {}, position };

    const x1 = { id: 'x1', type: EntityType.Node, tags: {}, position };

    const g3r3 = { id: 'g3r3', type: EntityType.Path, tags: { cost: 1 }, nodes: [g3, r3] };
    const g4r4 = { id: 'g4r4', type: EntityType.Path, tags: { cost: 1 }, nodes: [g4, r4] };

    const road = { id: 'road', type: EntityType.Path, tags: { featureType: 'road' }, nodes: [r4, r3] };

    const r4l19 = { id: 'r4l19', type: EntityType.Path, tags: { featureType: 'edge', cost: 10 }, nodes: [r4, l19] };
    const r4l18 = { id: 'r4l18', type: EntityType.Path, tags: { featureType: 'edge', cost: 7 }, nodes: [r4, l18] };
    const r4l17 = { id: 'r4l17', type: EntityType.Path, tags: { featureType: 'edge', cost: 5 }, nodes: [r4, l17] };
    const r4l16 = { id: 'r4l16', type: EntityType.Path, tags: { featureType: 'edge', cost: 4 }, nodes: [r4, l16] };
    const r3l17 = { id: 'r3l17', type: EntityType.Path, tags: { featureType: 'edge', cost: 7 }, nodes: [r3, l17] };
    const r3l16 = { id: 'r3l16', type: EntityType.Path, tags: { featureType: 'edge', cost: 7 }, nodes: [r3, l16] };
    const r3l15 = { id: 'r3l15', type: EntityType.Path, tags: { featureType: 'edge', cost: 4 }, nodes: [r3, l15] };

    const l15x1 = { id: 'l15x1', type: EntityType.Path, tags: { featureType: 'edge', cost: 20 }, nodes: [l15, x1] };
    const l16x1 = { id: 'l16x1', type: EntityType.Path, tags: { featureType: 'edge', cost: 5 }, nodes: [l16, x1] };
    const l17x1 = { id: 'l17x1', type: EntityType.Path, tags: { featureType: 'edge', cost: 6 }, nodes: [l17, x1] };
    const l18x1 = { id: 'l18x1', type: EntityType.Path, tags: { featureType: 'edge', cost: 7 }, nodes: [l18, x1] };
    const l19x1 = { id: 'l19x1', type: EntityType.Path, tags: { featureType: 'edge', cost: 8 }, nodes: [l19, x1] };

    let graph = new Graph<{}, {}>([]);
    const updater = graph.beginUpdate();

    updater.addNode(g3);
    updater.addNode(g4);
    updater.addNode(r3);
    updater.addNode(r4);
    updater.addNode(l15);
    updater.addNode(l16);
    updater.addNode(l17);
    updater.addNode(l18);
    updater.addNode(l19);
    updater.addNode(x1);

    updater.addPath(road);

    updater.addPath(g3r3);
    updater.addPath(g4r4);
    updater.addPath(r3l15);
    updater.addPath(r3l16);
    updater.addPath(r3l17);
    updater.addPath(r4l16);
    updater.addPath(r4l17);
    updater.addPath(r4l18);
    updater.addPath(r4l19);

    updater.addPath(l15x1);
    updater.addPath(l16x1);
    updater.addPath(l17x1);
    updater.addPath(l18x1);
    updater.addPath(l19x1);

    graph = updater.commit();

    // simplify perigra??
    // cost function
    const getCost = (u: string, v: string) => {
      const uPaths = graph.getEntityPaths(u).filter((p) => p.nodes.map((n) => n.id).includes(u) && p.nodes.map((n) => n.id).includes(v));
      const vPaths = []; // graph.getEntityPaths(v).filter((p) => !(p.nodes.map((n) => n.id).includes(u) && p.nodes.map((n) => n.id).includes(v)));
      const vNode = graph.getNode(v);
      const cost = [...uPaths, ...vPaths].reduce((result, path) => {
        return result + Number(path.tags?.cost ?? '0') + Number(vNode.tags?.cost ?? '0');
      }, 0);
      return cost;
    };

    const getVertices = () => Array.from(graph.entityIds());
    const getNeighbors = (u: string) => {
      const paths = graph.getEntityPaths(u);
      const nodes = paths
        .flatMap((p) => {
          const uniqueNodes = uniqNodes(p.nodes as Node<{}>[]);
          // return uniqueNodes.map((n) => n.id).filter((n) => n !== u);
          const index = uniqueNodes.findIndex((n) => n.id === u);

          let nextNodes;
          if (index > -1) {
            nextNodes = [uniqueNodes[index + 1]?.id];

            // nextNodes.push(uniqueNodes[index - 1]?.id);
            // TODO: need to revise this...
            if (['edge'].includes(p.tags?.featureType)) {
              nextNodes.push(uniqueNodes[index - 1]?.id);
            }
          } else {
            nextNodes = [uniqueNodes[0]?.id];
          }

          return nextNodes.filter(Boolean).filter((n) => n !== u);
        })
        .filter(Boolean);
      return nodes;
    };

    const graphGetters: GraphGetters = {
      getVertices,
      getNeighbors,
      getEdges: () => {
        const nodes = getVertices();
        let edges: Edge[] = [];
        nodes.forEach((node) => {
          const vertexNeighbours = getNeighbors(node);
          edges = edges.concat(
            vertexNeighbours.map((vn) => {
              return { from: node, to: vn, cost: getCost(node, vn) };
            })
          );
        });
        return edges;
      },
      getCost
    };

    const result = kshort(graphGetters, 'g4', 'x1', 5);

    const bestPath = result[0];
    expect(result.length).toBe(5);
    expect(bestPath).toStrictEqual([10, 'g4', 'r4', 'l16', 'x1']);

    done();
  });
});
