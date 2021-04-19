# PER-I-GRA

Persistent & Immutable Graphs. 

## API
### Graph
Graph is an object which is read only and do not provide any possibility for in-place updates.

### GraphUpdater
graph.beginUpdate() return a GraphUpdater. GraphUpdater can be used to:
```javascript
/** 
 * Add a new entity to the graph
 */
addEntity(entity:Entity)
/** 
 * Remove a entity to the graph
 */
removeEntity(entityId:EntityId)
/** 
 * Replace an entity and all links to this entity
 */
replaceEntity(entity:Entity)

/** 
 * Apply all changes and return a new Graph
 */
commit()
```

### Differentiator
Takes two graphs and returns all Actions that is required to transform `base` graph to `head`

### GraphMerger
Takes a `base` graph and a set of actions and will return a new `head` graph