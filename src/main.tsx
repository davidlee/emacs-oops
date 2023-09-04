import eventChannel from './eventChannel.js'
import { Entry } from  './entities/Entry.js'
// import * as E from './entry.js'
// import { parse } from './parser.js'
import React, {useState, useEffect, ReactElement} from 'react'
import {
  useInput,
  Text,
  Box,
  render,
} from 'ink'
// import { Image } from 'ink-image'  

// import Table from 'ink-table'

// const UserInput = () => {
// 	useInput((input, key) => {
// 		if (input === 'q') {
// 			// Exit program
// 		}

// 		if (key.leftArrow) {
// 			// Left arrow key pressed
// 		}
// 	})
// 	return 
// }

// type Props = {
// 	// log: string | undefined
// }

function LogText({}) {
  const [log, setLog] = useState('...')

  eventChannel.on('entries',(entries: Entry[]) => {
    setLog(entries.map((e) => `${e.id} : ${e.uid} | ${e.text} | ${e.urgency}` ).join("\n"))
  })

  eventChannel.on('created',(entry: Entry) => {
    setLog(`Entry created: ${entry}`)
  })
  
  return(<Text>{log}</Text>)
}

export function Screen({} ) {
  // let chunks = ""
  
	// React.useEffect(() => {
 //    setLog(chunks)
 //  }, [])

  return (
  <Box width="100%" borderColor="grey" borderStyle="bold">
    <Box width="30%" borderColor="red" borderStyle="single">
      <Text>Hello from React, bitches!</Text>
    </Box>
    <Box width="70%" borderColor="green" borderStyle="single">
      <LogText />
    </Box>
  </Box>)
}

export default Screen