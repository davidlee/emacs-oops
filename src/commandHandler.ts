import { Entry} from './entities/Entry.js'
import { FilterArgs, ModifierArgs, CommandArgs} from './parser.js'
import { Tag } from './entities/Tag.js'
import eventChannel from './eventChannel.js'

import { 
  EntityManager,
  EntityRepository,
  MikroORM,
  UseRequestContext,
} from '@mikro-orm/core'

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
 
  // add 
  @UseRequestContext()
  async add(args: Args): Promise<void> {
    const m = args.modifiers!
    const newTags = m.tags?.yes
    const text    = m.words.join(' ') 
    const entry:  Entry = new Entry(text)
    
    console.log(newTags)
    
    if(newTags && Object.keys(newTags).length) {
      for(const [group, tags] of Object.entries(newTags)) {
        console.log('tags', tags)
        console.log('group',group)
        // console.log('REF', entry)
        
        for(const tag of tags) {
          const t = new Tag(tag, group)
          entry.tags.add(t)
        }
      }
    }

    const record: Entry = this.repo.create(entry) 
    await this.em.persistAndFlush(record)
    eventChannel.emit('created', { status: 'OK', id: record.id, record: record})
  }

  // list
  @UseRequestContext()
  async list(args: Args) {
    // console.log("== LIST ==")
    const q = this.buildQueryFromFilters(args.filters!)
    const entries = await this.repo.find(q) 
    // TODO we probably want to return a response object
    eventChannel.emit('entries', entries, { populate: ['tags'] })
    this.entries = entries
  }

  // modify
  async modify(args: Args) {
    console.log('modify', args)
    const q = this.buildQueryFromFilters(args.filters!)
    const entries = await this.repo.find(q)

    switch(entries.length) {
      case 0:
        eventChannel.emit( 'error', { status: 'NOT_FOUND', message: 'No entries found' })
        break
      case 1: 
        const entry = this.applyModifiersToInstance(args.modifiers!, entries[0])
        break
      default:
        // send a command in progress
    }

    // FIRST: apply filters, find how many records will be affected
    // if only one, then apply modifiers to that record
    // if multiple, instead send a command in progress object
    // with the entries to be affected and confirmation message attached
    
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

  protected buildQueryFromFilters(f: FilterArgs, q = {}) {
    
    if(f.ids.length > 0) {
      const x = {ids: f.ids }
      q = { ...q, ...{ ids: f.ids }}
    }
    
    if(f.words.length > 1) {
      q = { ...q, ...{ text: {$like: `%${f.words.join(' ')}%` }} }
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

