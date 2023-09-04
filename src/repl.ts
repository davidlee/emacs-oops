import * as repl from 'node:repl'
// 
import { Entry } from './entities/Entry.js'
import * as E from './entities/Entry.js'
import { CommandHandler } from './commandHandler.js'
import { parse } from './parser.js'
import { dispatch} from './dispatcher.js'
import { getOrm, close } from './db.js'
// import eventChannel from './eventChannel.js'
// 

const replServer = repl.start('> ')
const C = replServer.context 
// const repo = ch.orm.em.fork().getRepository<Entry>('Entry')


C.E        = E
C.Entry    = Entry
C.parse    = parse
C.orm      = getOrm()
C.ch       = new CommandHandler(replServer.context.orm)
C.dispatch = dispatch
C.close    = close 
C.em       = C.ch.orm.em.fork()
C.repo     = C.em.fork().getRepository('Entry')
C.cmd      = function(text: string){
  const c = parse(text.split(' '))
  return replServer.context.dispatch(c)
}

