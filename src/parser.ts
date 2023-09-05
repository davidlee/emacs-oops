
enum TokenKind {
  Command  = 'command',
  Filter   = 'filters',
  Modifier = 'modifiers',
  Ids      = 'filters.ids',
}

import { CommandName } from './commandHandler.js'

export type CommandConfig = {
  name:          CommandName
  aliases:       string[]
  expect:        TokenKind[]
  subcommands:   CommandConfig[] 
  confirmation?: boolean 
}

const CommandConfigs: CommandConfig[] = [
  {
    name: CommandName.add,
    aliases: [],
    expect: [TokenKind.Modifier],
    subcommands: [],
  },
  {
    name: CommandName.modify,
    aliases: [],
    expect: [TokenKind.Filter, TokenKind.Modifier],
    subcommands: [],
  },
  {
    name: CommandName.remove,
    aliases: ['rm'],
    expect: [TokenKind.Filter],
    subcommands: [],
  },
  {
    name: CommandName.list,
    aliases: ['ls'],
    expect: [TokenKind.Filter],
    subcommands: [],
  },
  {
    name: CommandName.context,
    aliases: ['@'],
    expect: [TokenKind.Modifier],
    subcommands: [],
  },
  {
    name: CommandName.done,
    aliases: ['x'],
    expect: [TokenKind.Filter],
    subcommands: [],
  },
  {
    name: CommandName.undo,
    aliases: [],
    expect: [TokenKind.Filter],
    subcommands: [],
  },
  {
    name: CommandName.config,
    aliases: ['cfg'],
    expect: [TokenKind.Modifier],
    subcommands: [], // ...
  },
]
// no reason it should change
Object.freeze(CommandConfigs)

export type CommandConfigList = {
  [key: string]: CommandConfig
}

// {tags: [ ... ], groupName: [ ... ]}
export type TagSet = {
  [key: string]: string[]
}

export type FilterArgs = {
    ids: number[]
} & ModifierArgs

export type ModifierArgs = {
  tags:  TagSet
  words: string[]
}

export type ParsedCommandArgs = {
  filters: FilterArgs,
  modifiers: ModifierArgs
}

export type Command = {
  command: CommandName[]
}

export type ParsedCommand = Command & ParsedCommandArgs 

type ParsingState = {
  tokens: string[]
  processedIndices: TokenKind[]
  firstCommandIndex: number 
}

type ParserState = {
  parser: {
    tokens: string[]
    processedIndices: TokenKind[]
    firstCommandIndex: number 
    expect: TokenKind[]
  }
}

type State = ParserState & ParsedCommand

function buildState(tokens: string[]): State {
  return {
    parser: {
      tokens: tokens,
      processedIndices: [],
      firstCommandIndex: -1,
      expect: []
    },
    command: [],
    filters: {
      ids:   [],
      tags:  {},
      words: [],
    },
    modifiers: {
      tags:  {},
      words: [],
    },
  } as State
}

function extractCommand(state: State): ParsedCommand {
  const { parser, ...rest} = state
  return rest
}


// https://taskwarrior.org/docs/syntax/
// task <filter> <command> <modifications> <miscellaneous>
//
// first, find the first thing that looks like a command
// everything before it is a filter (ids, etc)
// everything after it is a modification
export function parse(tokens: string[]): ParsedCommand {
  let state = buildState(tokens)
      state = parseCommands(state) 
  
  // how we interpret remaining tokens depends on whether they're 
  // before or after a command
  
  const p = state.parser

  p.tokens.forEach((word, i) => {
    if(p.processedIndices[i] === undefined) {
      // todo match IDs, tags, etc ... otherwise
      // just treat as a word
      if (i < p.firstCommandIndex || p.firstCommandIndex < 0) {
        p.processedIndices[i] = TokenKind.Filter
        state.filters.words.push(word)
      } else {
        p.processedIndices[i] = TokenKind.Modifier
        state.modifiers.words.push(word)
      }
    }
  })
  
  return extractCommand(state)
}

function parseCommands(state: State): State {
  let validCommands = CommandConfigs
  const p = state.parser

  // find the command [and any subcommands]
  for (let i = 0; i < p.tokens.length; i++) {
    const word = p.tokens[i]
    const command: CommandConfig | null = recogniseCommand(word, validCommands)

    if (command) {
      p.processedIndices[i] = TokenKind.Command
      state.command.push(command.name)
      validCommands = command.subcommands
      // there are no valid subcommands: we're done 
      if (validCommands.length === 0) 
        break
    } else if(p.processedIndices.some( e => { 
      e === TokenKind.Command 
    })) 
    // we've previously found a command, but matched no valid subcommand
    break 
  }

  if (state.command.length === 0)  
    state.command.push(CommandName.list) 
  
  p.firstCommandIndex = p.processedIndices.indexOf(TokenKind.Command)

  return state 
}

export function parseArgs(argv: string[]): ParsedCommand {
  return parse(argsFromArgv(argv))
}

function commandAliases(cmds: CommandConfig[]=CommandConfigs): CommandConfigList {
  const o: CommandConfigList = {}
  cmds.map((c) =>
    c.aliases.forEach((alias) => {
      o[alias] = c
    }),
  )
  return o
}
//
// matchers
//

export function recogniseCommand(word: string, candidates=CommandConfigs): CommandConfig | null {
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

// [3,5] -> [3,4,5]
function unrollIntRange(range: number[]): number[] {
  return Array.from({ length: range[0] - range[1] + 1 }, (_, i) => range[0] + i)
}

// parse a comma-separated list of ints, or ranges of ints, eg:
// 8,9-11,16,3 -> [8,9,10,11,16,3]
function recogniseIds(word: string): number[] | null {
  if (!word) return null

  const chunks = word.split(',').map((chunk) => {
    if (chunk.match(/^[0-9]+-[0-9]+$/)) {
      // we have a range - unroll it
      return unrollIntRange(chunk.split('-').map((c) => parseInt(c)))
    } else if (chunk.match(/^\d+$/)) {
      // just a number
      return parseInt(chunk)
    } else return null
  })
  return chunks.flat().filter((c) => typeof c === 'number') as number[]
}

// function recogniseTags()
// function recognisePriority()
// function recogniseParent()

// utility functions

export function argsFromArgv(argv: string[]): string[] {
  return argv.slice(2) // .filter((arg) => !(arg === '--'))
}
