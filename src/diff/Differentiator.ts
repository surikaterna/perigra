import EntityId from "../EntityId";
import Entity from "../Entity";
import Graph from "../Graph";

enum ActionType {
    Added,
    Removed,
    Replaced
}

type GraphAction<T> = {
    type: ActionType,
    base: Entity<T> | undefined,
    head: Entity<T> | undefined,
}

/** 
 * Resolves the difference between two graphs
*/
export default class Differentiator<T> {
    difference(base: Graph<T>, head: Graph<T>): readonly GraphAction<T>[] {
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

    private checkEntityDifference(base: Graph<T>, head: Graph<T>, id: EntityId): GraphAction<T> | undefined {
        const b = base.getEntityUnsafe(id);
        const h = head.getEntityUnsafe(id);
        // No change
        if (h === b) {
            return undefined;
            // Removed
        } else if (!h && b) {
            return { type: ActionType.Removed, base: b, head: h }
            // Added
        } else if (h && !b) {
            return { type: ActionType.Added, base: b, head: h }
            //Replaced
        } else if (h && b) {
            return { type: ActionType.Replaced, base: b, head: h }
        }

        throw new Error('Unable to process change: ' + h + ' || ' + b);
    }
}