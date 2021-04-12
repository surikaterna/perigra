import EntityId from "../EntityId";
import Graph from "../Graph";
import GraphAction, { ActionType } from "../update/GraphAction";

/** 
 * Resolves the difference between two graphs
*/
export default class Differentiator<N, P> {
    difference(base: Graph<N, P>, head: Graph<N, P>): readonly GraphAction<N | P>[] {
        //Unique "set" of id's from both graphs (head and base)
        const ids = Array.from(new Set(Array.from(base.entityIds()).concat(Array.from(head.entityIds()))));
        const changes = [];
        for (let i = 0; i < ids.length; i++) {
            const change = this.checkEntityDifference(base, head, ids[i]);
            if (change) {
                changes.push(change);
            }
        }
        return changes;
    }

    private checkEntityDifference(base: Graph<N, P>, head: Graph<N, P>, id: EntityId): GraphAction<N | P> | undefined {
        const b = base.getEntityUnsafe(id);
        const h = head.getEntityUnsafe(id);
        // No change
        if (h === b) {
            return undefined;
        } else if (!h && b) {
            // Removed
            return { type: ActionType.Removed, base: b, head: h }
        } else if (h && !b) {
            // Added
            return { type: ActionType.Added, base: b, head: h }
        } else if (h && b) {
            //Replaced
            return { type: ActionType.Replaced, base: b, head: h }
        }

        throw new Error('Unable to process change: ' + h + ' || ' + b);
    }
}