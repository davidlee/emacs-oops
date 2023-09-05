import assert from 'node:assert/strict'
import { after, describe, test } from 'node:test'
import { parse, recogniseCommand, ParsedCommand } from '../src/parser.js'
import { CommandName } from '../src/commandHandler.js'

describe('parser', () => {
  describe('recogniseCommand', () => {
    test('recognise: add', (t) => {
      assert.equal(recogniseCommand('add')?.name, 'add')
    })

    test('recognise: ad -> add', (t) => {
      assert.equal(recogniseCommand('ad')?.name, 'add')
    })

    test('null: addd', (t) => {
      assert.equal(recogniseCommand('addd'), null)
    })

    test('recognise alias: rm -> remove', (t) => {
      assert.equal(recogniseCommand('rm')?.name, 'remove')
    })

    test('recognise alias: @ -> context', (t) => {
      assert.equal(recogniseCommand('@')?.name, 'context')
    })

    test('null: co', (t) => {
      assert.equal(recogniseCommand('co'), null)
    })

    test('null: con', (t) => {
      assert.equal(recogniseCommand('con'), null)
    })

    test('null: conz', (t) => {
      assert.equal(recogniseCommand('conz'), null)
    })

    test('recognise: cont -> context', (t) => {
      assert.equal(recogniseCommand('cont')?.name, 'context')
    })

    test('recognise: conf -> config', (t) => {
      assert.equal(recogniseCommand('conf')?.name, 'config')
    })
  })

  describe('parse', () => {
    // beforeAll(async () => orm = await initORMSqlite3());
    // beforeEach(async () => orm.schema.clearDatabase());

    test('add a note -> !add "a note"', (t) => {
      let input = 'add a note'.split(' ')
      let result = parse(input) as ParsedCommand
      assert.deepEqual(result.command, CommandName.add)
      assert.deepEqual(result.modifiers!.words, ['a', 'note'])
    })

    test('default to list', (t) => {
      let input = 'what dis'.split(' ')
      let result = parse(input) as ParsedCommand
      assert.deepEqual(result.command, CommandName.list)
      assert.deepEqual(result.filters!.words, ['what', 'dis'])
    })

    after(() => {
    
    })
  })

})
