#!/usr/bin/env node

import { orm, close } from './db.js'
import { parse } from './parser.js'
import { dispatch } from './dispatcher.js'
import { CommandHandler } from "./commandHandler.js"
// can we conditionally import these? 
import Screen from './main.js'
import { render } from 'ink'

import { parseArgs, ParseArgsConfig } from 'node:util'

const _handler = new CommandHandler(orm); _handler // listen ...

const options: ParseArgsConfig = {
  options: {
    'benchmark-init': {
      type: 'boolean',
      short: 'b',
    },
    'interactive': {
      type: 'boolean',
      short: 'i',
    }
  },
  tokens: true,
  strict: false, // allow -tagnames, etc
  allowPositionals: true,
}

const { values, positionals, tokens } = parseArgs(options)
  
const command = parse(positionals)

if(values.interactive === true) {
  interactive()
} else {
  cli()
}


async function cli() {
  dispatch(command).then((_result) => {
    close()
  }).catch((reason) => {
    console.log('error:', reason)
    close()
  })
}

async function interactive() {
  render(Screen({log: '!!!'}))
  dispatch(command).then((_result) => {
    // close()
  }).catch((reason) => {
    console.log('error:', reason)
    close()
  })
}

