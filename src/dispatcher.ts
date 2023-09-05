import { ParsedCommand, CommandArgs } from './parser.js'
import eventChannel from './eventChannel.js'

export async function dispatch(cmd: ParsedCommand) {
  const { command, ...args } = cmd
  sinkCommand(command, args)
}

function sinkCommand(command: string, args: CommandArgs) {
  eventChannel.once('reply', (event: string, result: object) => {
    if(event === 'reply') {
      console.log("%o", result)
    }
  })

  const event = `command:${command}` 
  eventChannel.emit(event, args)
}
