import { parse, ParsedCommand } from '../src/parser.js'
import { CommandName } from '../src/commandTypes.js'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

describe('parser', () => {

  describe('parse', () => {
    function testWith(text: string, cn: CommandName, fn: ((p: ParsedCommand) => void)): void {
      let result = parse(text.split(' ')) as ParsedCommand
      assert.equal(result.command, cn)
      fn(result)
    }
  
    test('add', (t) => {
      testWith('add', CommandName.add, (c) => {
        assert.deepEqual(c.modifiers!.words, [])
      })
    })

    test('ad -> add', (t) => {
      testWith('ad a list', CommandName.add, (c) => {
        assert.deepEqual(c.modifiers!.words, ['a','list'])
      })
    })

    test('addd -> ', (t) => {
      testWith('addd', CommandName.list, (c) => {
        assert.deepEqual(c.filters!.words, ['addd'])
      })
    })
    
    test('add a note', (t) => {
      testWith('add a note', CommandName.add, (c) => {
        assert.deepEqual(c.modifiers!.words, ['a', 'note'])
      })
    })

    test('con -> null', (t) => {
      testWith('con', CommandName.list, (c) => {
        assert.deepEqual(c.filters!.words, ['con'  ])
      })
    })

    test('conf -> config', (t) => {
      testWith('conf', CommandName.config, (c) => {
        assert.deepEqual(c.modifiers!.words, [])
      })
    })

    test('cont -> context', (t) => {
      testWith('cont', CommandName.context, (c) => {
        assert.deepEqual(c.modifiers!.words, [])
      })
    })

    test('default to list', (t) => {
      testWith('what dis', CommandName.list, (c) => {
        assert.deepEqual(c.filters!.words, ['what', 'dis'])
      })
    })
    
    test('list has filters but not modifiers', (t) => {
      testWith('1 list', CommandName.list, (c) => {
        assert.deepEqual(c.filters!.ids, [1])
        assert.deepEqual(c.modifiers, undefined)
      })
    })

    test('list accepts ids on the RHS', (t) => {
      testWith('list 1', CommandName.list, (c) => {
        assert.deepEqual(c.filters!.ids, [1])
        assert.equal(c.modifiers, undefined)
      })
    })
    
    test('list expands ranges', (t) => {
      testWith('2-4 list', CommandName.list, (c) => {
        assert.deepEqual(c.filters!.ids, [2,3,4])
        assert.equal(c.modifiers, undefined)
      })
      testWith('1-4,7-9 list', CommandName.list, (c) => {
        assert.deepEqual(c.filters!.ids, [1,2,3,4,7,8,9])
        assert.equal(c.modifiers, undefined)
      })
    })
    
    test('list interprets additional set of ids as words', (t) => {
      testWith('11,12 13 15 list', CommandName.list, (c) => {
        assert.deepEqual(c.filters!.ids, [11,12])
        assert.deepEqual(c.filters!.words, ['13','15'])
        assert.equal(c.modifiers, undefined)
      })
    })

    test('list recognises a uid', (t) => {
      testWith(':1iu46AE list', CommandName.list, (c) => {
        assert.deepEqual(c.filters!.uids, ['1iu46AE'])
        assert.equal(c.modifiers, undefined)
      })
    })
    
    test('list recognises any number of uids', (t) => {
      testWith(':1iu46AE :1iu68x9 list :1ip658ih', CommandName.list, (c) => {
        assert.deepEqual(c.filters!.uids, ['1iu46AE', '1iu68x9', '1ip658ih'])
        assert.equal(c.modifiers, undefined)
      })
    })

    test('a tag', (t) => {
      testWith('add +tag', CommandName.add, (c) => {
        assert.deepEqual(c.modifiers!.tags, { yes: { default: ['tag'] }})
      })
    })

    test('tags', (t) => {
      testWith('add +tag,other.tag', CommandName.add, (c) => {
        assert.deepEqual(c.modifiers!.tags, { yes: { default: ['tag', 'other.tag'] }})
      })
    })

    test('tags separated by spaces', (t) => {
      testWith('add +grp:tag,other.tag -cool +grp:another +right', CommandName.add, (c) => {
        assert.deepEqual(c.modifiers!.tags, { yes: { grp: ['tag', 'other.tag', 'another'], default: ['right'] }, no: { default: ['cool']}}) 
      })
    })
    
    test('rm (alias: remove)', (t) => {
      testWith('rm', CommandName.remove, (c) => {
        assert.deepEqual(c.filters!.ids, [])
      })
    })

    test('@ (alias: context)', (t) => {
      testWith('@ home', CommandName.context, (c) => {
        assert.deepEqual(c.modifiers!.words, ['home'])
      })
    })
  })

})
