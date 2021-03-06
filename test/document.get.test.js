// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

const Nano = require('..')
const COUCH_URL = 'http://localhost:5984'
const nano = Nano(COUCH_URL)
const nock = require('nock')

afterEach(() => {
  nock.cleanAll()
})

test('should be able to get a document - GET /db/id - db.get', async () => {
  // mocks
  const response = { _id: 'id', rev: '1-123', a: 1, b: 'two', c: true }
  const scope = nock(COUCH_URL)
    .get('/db/id')
    .reply(200, response)

  // test GET /db/id
  const db = nano.db.use('db')
  const p = await db.get('id')
  expect(p).toStrictEqual(response)
  expect(scope.isDone()).toBe(true)
})

test('should be able to get a document from a partition - GET /db/pkey:id - db.get', async () => {
  // mocks
  const response = { _id: 'partkey:id', rev: '1-123', a: 1, b: 'two', c: true }
  const scope = nock(COUCH_URL)
    .get('/db/partkey%3Aid')
    .reply(200, response)

  // test GET /db/pkey:id
  const db = nano.db.use('db')
  const p = await db.get('partkey:id')
  expect(p).toStrictEqual(response)
  expect(scope.isDone()).toBe(true)
})

test('should be able to get a document with options - GET /db/id?conflicts=true - db.get', async () => {
  // mocks
  const response = { _id: 'id', rev: '1-123', a: 1, b: 'two', c: true }
  const scope = nock(COUCH_URL)
    .get('/db/id?conflicts=true')
    .reply(200, response)

  // test GET /db/id?x=y
  const db = nano.db.use('db')
  const p = await db.get('id', { conflicts: true })
  expect(p).toStrictEqual(response)
  expect(scope.isDone()).toBe(true)
})

test('should be able to handle 404 - GET /db/id - db.get', async () => {
  // mocks
  const response = {
    error: 'not_found',
    reason: 'missing'
  }
  const scope = nock(COUCH_URL)
    .get('/db/id')
    .reply(404, response)

  // test GET /db/id
  const db = nano.db.use('db')
  await expect(db.get('id')).rejects.toThrow('missing')
  expect(scope.isDone()).toBe(true)
})

test('should detect missing doc id - db.get', async () => {
  const db = nano.db.use('db')
  await expect(db.get()).rejects.toThrow('Invalid parameters')
})

test('should detect missing parameters (callback) - db.get', () => {
  return new Promise((resolve, reject) => {
    const db = nano.db.use('db')
    db.get(undefined, undefined, (err, data) => {
      expect(err).not.toBeNull()
      resolve()
    })
  })
})

test('check request can fetch local documents - db.get', async () => {
  // mocks
  const response = { _id: '_local/id', _rev: '1-123', a: 1 }
  const scope = nock(COUCH_URL)
    .get('/db/_local/id')
    .reply(200, response)

  // test GET /db/_local/id
  const db = nano.db.use('db')
  const p = await db.get('_local/id')
  expect(p).toStrictEqual(response)
  expect(scope.isDone()).toBe(true)
})
