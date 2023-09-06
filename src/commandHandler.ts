import { Entry} from './entities/Entry.js'
import { FilterArgs, ModifierArgs, TokenKind, CommandArgs} from './parser.js'

import eventChannel from './eventChannel.js'

import { 
  EntityManager,
  EntityRepository,
  MikroORM,
  UseRequestContext,
} from '@mikro-orm/core'

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

export type CommandConfig = {
  name:         CommandName
  aliases:      string[]
  expect:       TokenKind[]
  subcommands?: CommandConfig[] 
}

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
Object.freeze(CommandConfigs)

type Args = CommandArgs

export class CommandHandler {
  orm:  MikroORM
  em:   EntityManager
  repo: EntityRepository<Entry>
  entries: Entry[]

  constructor(orm: MikroORM) {
    this.orm  = orm
    this.em   = orm.em 
    this.repo = this.em.getRepository<Entry>('Entry')
    this.entries = []

    eventChannel.on('command:add', (args: Args) => {
      this.add(args)
    })

    eventChannel.on('command:list', (args: Args) => {
     this.list(args)
    })

    eventChannel.on('command:modify', (args: Args) => {
     this.modify(args)
    })
  }

  @UseRequestContext()
  async add(args: Args): Promise<void> {
    const text =  args.modifiers!.words.join(' ') 
    const entry:  Entry = new Entry(text)
    const record: Entry = this.repo.create(entry) 
    
    await this.em.persistAndFlush(record)
    eventChannel.emit('created', { status: 'OK', id: record.id, record: record})
  }

  @UseRequestContext()
  async list(args: Args) {
    console.log("== LIST ==")
    const q = this.buildQueryFromFilters(args.filters!)
    const entries = await this.repo.find(q) 
    eventChannel.emit('entries', entries)
    this.entries = entries
  }

  async modify(args: Args) {
    console.log('modify', args)
    
  }

  remove(args: Args) {
    args
  }
  
  context(args: Args) {
    args
  }

  done(args: Args) {
    args    
   }

  config(args: Args) {
    args    
  }

  undo(args: Args) {
    args    
  }

  async exit(ms:number = 250){
    setTimeout(async () => await this.orm.close(true), ms)
  }

  protected processArgs(args: Args) {
    const fs: object = {}
    const ms = args.modifiers!
    
    if(ms.words.length !== 0 ) { Object.assign(fs, {text: ms.words.join(' ')} ) }  
    return fs
  }

  protected applyFilters(){
    
  }

  protected applyModifiers(){
    
  }

  protected buildQueryFromFilters(f: FilterArgs, q = {}) {
    
    if(f.ids.length > 0) {
      const x = {ids: f.ids }
      q = { ...q, ...{ ids: f.ids }}
    }
    
    if(f.words.length > 1) {
      q = { ...q, ...{ words: {$like: `%${f.words.join(' ')}%` }} }
    }
    
    return q
  }

  protected applyModifiersToInstance(args: ModifierArgs, e: Entry) {
    //
    return e
  } 
  
  protected applyModifiersToCollection(args: Args, es: Iterable<Entry>): Iterable<Entry> {
    //
    return es
  }
}

