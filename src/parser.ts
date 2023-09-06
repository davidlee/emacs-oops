import { CommandConfigs, TokenKind, CommandConfig} from './commandTypes.js'
import { } from './commandHandler.js'

import deepmerge from 'deepmerge'

export type ModifierArgs = {
  tags:  TagSet
  words: string[]
}

export type FilterArgs = {
    ids:  number[]
    uids: string[]
} &  ModifierArgs

export type ParsedCommand = HasCommand & HasArgs
export type CommandArgs   = HasArgs

const DefaultCommand = CommandConfigs[0]

type CommandConfigList = {
  [key: string]: CommandConfig
}

interface TagSet {
  [key: string]: string[]
}

interface HasCommand {
  command: string
} 

interface HasArgs {
  filters?: FilterArgs 
  modifiers?: ModifierArgs 
}

interface ParserState  {
  parser: {
    tokens:            string[]
    tokenKind:         TokenKind[]
    firstCommandIndex: number 
  }
}

type ParserStateWithCommand = ParserState & ParsedCommand 

//
// Exported Functions
//

export function argsFromArgv(argv: string[]): string[] {
  return argv.slice(2)
}

export function parseArgs(argv: string[]): ParsedCommand {
  return parse(argsFromArgv(argv))
}

// based on
// https://taskwarrior.org/docs/syntax/
//
// task <filters> <commands> <modifications> 
//
// first, find the first thing that looks like a command
// everything before it is a filter (ids, etc)
// everything after it is a modification
const rxIds  = /^\d+(\-\d+)?(,\d+(\-\d+)?)*$/g
const rxUIDs = /^\:[a-zA-Z0-9]{4,10}$/g
const rxTags = /^([-+])(?:(?<g>[_a-zA-Z0-9]+):)?(?<t>[\.,_a-zA-Z0-9]+)*$/

export function parse(tokens: string[]): ParsedCommand  {
  let x = buildParserState(tokens)
  let state = parseCommands(x) 
  const p = state.parser

  tokens.forEach((token, i) => {
    if(p.tokenKind[i] === undefined) {
      const f = state.parser.firstCommandIndex
      // FIXME check what the command supports
      const t = (i < f || f === -1 ) ? TokenKind.Filter : TokenKind.Modifier
      p.tokenKind[i] = t 
        
      match(token, rxIds, () => {
        const x = recogniseIds(token)
        if(x?.length && state.filters!.ids.length === 0) {
          state.filters!.ids = [...state.filters!.ids, ...x ] 
          return true
        } else return false 
      }) || match(token, rxUIDs, () => {
          return !!state.filters!.uids.push(token.slice(1,10))
      }) || match(token, rxTags, () => {
        const tags = recogniseTags(token)
        if(tags) {
          state[t]!.tags = deepmerge(state[t]!.tags, tags)
          return true 
        } else return false
      }) || match(token, /./, () => { // default
        state[t]?.words.push(token)      
          return true
      })
    }
  })
  const { parser, ...parsedCommand } = state
  return parsedCommand
}
export default parse

//
// Helper Functions
//

function match(word: string, rx: RegExp, fn:(() => boolean)): boolean {
  if(word.match(rx)) {
    return fn()
  } else {
    return false
  }
}

function buildParserState(tokens: string[]): ParserState {
  return {
    parser: {
      tokens:            tokens,
      tokenKind:         [],
      firstCommandIndex: -1,
    },
  } as ParserState
}

// find the first command
// and any valid contiguous subcommands
// mark them in tokenKind
// and store the [sub]command in state
function parseCommands(state: ParserState): ParserStateWithCommand {
  const p                           = state.parser
  let validCommands                 = CommandConfigs
  let command: CommandConfig | null = null

  for (let i = 0; i < p.tokens.length; i++) {
    if (command = recogniseCommand(p.tokens[i], validCommands)) {
      p.tokenKind[i] = TokenKind.Command
      if (command.subcommands?.length) {
        validCommands = command.subcommands
      } else break          // we're done
    } else {
      if(p.tokenKind.some((t) => { t === TokenKind.Command})) 
        break // subcommands must be contiguous, streak broken
    }
  }
  command = command || DefaultCommand
  p.firstCommandIndex = p.tokenKind.indexOf(TokenKind.Command)
  return appendCommandToState(command, state)
}

function appendCommandToState(command: CommandConfig, state: ParserState): ParserStateWithCommand {
  let o = { command: command.name, parser: state.parser }
  let f = { filters: { ids: [], uids: [], tags: {}, words: [] }}
  let m = { modifiers: { tags: {}, words: [] }}
  
  if(command.expect.includes(TokenKind.Filter))
    o = { ...o, ...f }

  if(command.expect.includes(TokenKind.Modifier))
    o = { ...o, ...m }

  return o 
}

function commandAliases(cmds: CommandConfig[]=CommandConfigs): CommandConfigList {
  const o: CommandConfigList = {}
  cmds.map((c) => c.aliases.forEach((alias) => { o[alias] = c }))
  return o
}

function recogniseCommand(word: string, candidates=CommandConfigs): CommandConfig | null {
  // check for exact matches of any aliases
  const aliases = commandAliases(candidates)
  if (Object.keys(aliases).includes(word)) return aliases[word]

  // otherwise, check for a partial unique match of any command
  const rx = new RegExp('^' + word)
  const matches = candidates.filter((el) => el.name.match(rx))

  if (matches.length === 1)
    // *unique* match
    return matches[0]
  else return null
}

const defaultTagGroupName = 'tags'
function recogniseTags(token: string): TagSet | null {
  const md = token.match(rxTags)
  if(md){
    let g, o: TagSet = {}
    if (!(g = md.groups?.g)) { g = defaultTagGroupName }
    if (o[g] === undefined) o[g] = []
    o[g] = [ ...o[g], ...md.groups!.t.split(',')]
    return o
  } else return null
} 

type IntRange = [number, number]
// [3,5] -> [3,4,5]
function unroll(range: IntRange): number[] {
  return Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i)
}
// parse a comma-separated list of ints, or ranges of ints, eg:
// 8,9-11,16,3 -> [8,9,10,11,16,3]
function recogniseIds(word: string): number[] | null {
  if (!word) return null

  const chunks = word.split(',').map((chunk) => {
    if (chunk.match(/^[0-9]+\-[0-9]+$/)) {
      // we have a range - unroll it
      const r = chunk.split('-').map((c) => parseInt(c)) as IntRange
      return unroll(r)
    } else if (chunk.match(/^\d+$/)) {
      // just a number
      return parseInt(chunk)
    } else return null
  })
  return chunks.flat().filter((c) => typeof c === 'number') as number[]
}

