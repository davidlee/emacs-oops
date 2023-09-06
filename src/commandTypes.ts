export enum CommandName {
  add     = 'add',
  modify  = 'modify',
  list    = 'list',
  remove  = 'remove',
  append  = 'append',
  context = 'context',
  done    = 'done',
  config  = 'config',
  undo    = 'undo',
}

export enum TokenKind {
  Command  = 'command',
  Filter   = 'filters',
  Modifier = 'modifiers',
  Ids      = 'filters.ids',
}

export type CommandConfig = {
  name:         CommandName
  aliases:      string[]
  expect:       TokenKind[]
  subcommands?: CommandConfig[] 
}
// strictly speaking this is a value, but ...
export const CommandConfigs: CommandConfig[] = [
  {
    name: CommandName.list,
    aliases: ['ls'],
    expect: [TokenKind.Filter],
    subcommands: [],
  },
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
    name: CommandName.append,
    aliases: [],
    expect: [TokenKind.Filter, TokenKind.Modifier],
    subcommands: [],
  },
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
Object.freeze(CommandConfigs)
type Args = CommandArgs
