import sortChunks from '../src'

describe('sortChunks', () => {
  it('returns sorted chunks in webpack 1', () => {
    const chunks = [{
      id: 0,
      parents: [1],
    }, {
      id: 1,
      parents: [3],
    }, {
      id: 2,
    }]
    expect(sortChunks(chunks)).toEqual([chunks[1], chunks[0], chunks[2]])
  })

  it('returns sorted chunks in webpack 2', () => {
    const parent = { id: 1, parents: [undefined] }
    const child = { id: 0, parents: [parent] }
    const chunks = [child, parent]
    expect(sortChunks(chunks)).toEqual([parent, child])
  })
})
