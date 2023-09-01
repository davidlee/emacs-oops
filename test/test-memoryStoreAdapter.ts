import assert from 'node:assert/strict'
import { beforeEach, describe, test } from 'node:test'
import { MemoryStoreAdapter } from '../src/memoryStoreAdapter.js'
import * as E from '../src/entry.js'
import { Value } from '@sinclair/typebox/value'

// https://taskwarrior.org/docs/syntax/
let mem: MemoryStoreAdapter | null = null
let e = {} //Value.Create(E.Entry)

describe('memoryStoreAdapter', () => {
  beforeEach(() => {mem = new MemoryStoreAdapter()})
  
  // test('persistEntry: returns true ', (t) => {
  //   let x = new Date().toISOString()
  //   e.created = x
  //   const promise = mem!.persistEntry(e)
  //   promise.then((str) => console.log(str))
  // })

  // test('read', (t) => {
  //   const promise = mem!.read(e)
  //   promise.then((e:object) => {
  //     assert.deepEqual(e, Value.Decode(E.Entry, e))
  //   })
  // })

})