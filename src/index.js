// @flow
import toposort from 'toposort'

type Chunk = {
  id: number,
  parents: (number | Chunk)[],
}

type ChunkMap = {
  [number]: Chunk,
}

type Compilation = {
  chunkGroups: {},
}

const sortWithChunks = (chunks: Chunk[], chunkMap: ChunkMap): Chunk[] => {
  const edges = []

  chunks.forEach((chunk) => {
    if (chunk.parents) {
      // Add an edge for each parent (parent -> child)
      chunk.parents.forEach((parentId) => {
        // webpack2 chunk.parents are chunks instead of string id(s)
        const parentChunk = typeof parentId === 'object' ? parentId : chunkMap[parentId]

        // If the parent chunk does not exist (e.g.  because of an excluded chunk)
        // we ignore that parent
        if (parentChunk) {
          edges.push([parentChunk, chunk])
        }
      })
    }
  })

  // We now perform a topological sorting on the input chunks and built edges
  return toposort.array(chunks, edges)
}

const sortWithChunkGroups = (chunkGroups: any, chunkMap: ChunkMap) => {
  // Add an edge for each parent (parent -> child)
  const edges = chunkGroups.reduce((result, chunkGroup) => result.concat(
    Array.from(chunkGroup.parentsIterable, parentGroup => [parentGroup, chunkGroup])
  ), [])

  // We now perform a topological sorting on chunkGroups and built edges
  const sortedGroups = toposort.array(chunkGroups, edges)

  // Flatten chunkGroup into chunks
  const sortedChunks = sortedGroups
    .reduce((result, chunkGroup) => result.concat(chunkGroup.chunks), [])
    .map(chunk => chunkMap[chunk.id])
    .filter((chunk, index, self) => {
      // Make sure exists (ie excluded chunks not in nodeMap)
      const exists = !!chunk
      // Make sure we have a unique list
      const unique = self.indexOf(chunk) === index

      return exists && unique
    })

  return sortedChunks
}

const sortChunks = (chunks: Chunk[], compilation?: Compilation): Chunk[] => {
  // We build a map (chunk-id -> chunk) for faster access during graph building
  const chunkMap = {}

  chunks.forEach((chunk) => {
    chunkMap[chunk.id] = chunk
  })

  // Before webpack 4 there was no chunkGroups
  const chunkGroups = compilation && compilation.chunkGroups

  if (!chunkGroups) {
    return sortWithChunks(chunks, chunkMap)
  }

  // If there is chunkGroups, we use them because it's faster
  return sortWithChunkGroups(chunkGroups, chunkMap)
}

export default sortChunks
