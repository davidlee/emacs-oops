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
