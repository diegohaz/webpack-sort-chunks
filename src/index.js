// @flow
import toposort from 'toposort'

type Chunk = {
  id: number,
  parents: (number | Chunk)[],
}

/**
 * Sort chunks by dependency
 */
const sortChunks = (chunks: Chunk[]): Chunk[] => {
  const chunkMap = chunks.reduce((result, chunk) => ({ ...result, [chunk.id]: chunk }), {})
  const edges = []

  chunks.forEach((chunk) => {
    if (chunk.parents) {
      chunk.parents.forEach((parentId) => {
        const parentChunk = typeof parentId === 'object' ? parentId : chunkMap[parentId]

        if (parentChunk) {
          edges.push([parentChunk, chunk])
        }
      })
    }
  })

  return toposort.array(chunks, edges)
}

export default sortChunks
