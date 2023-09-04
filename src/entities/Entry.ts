import CustomBaseEntity from "./CustomBaseEntity.js"
import Tag from "./Tag.js"

import {
  EntitySchema,
  Collection,
  JsonType,
} from "@mikro-orm/core"

export enum StatusNames {
  Capture  = 'Capture',
  Draft    = 'Draft',
  Rework   = 'Rework',
  Clarify  = 'Clarify',
  Incubate = 'Incubate',
  Backlog  = 'Backlog',
  Icebox   = 'Icebox',

  Ready    = 'Ready',
  Next     = 'Next',
  Started  = 'Started',
  Check    = 'Check',
  Done     = 'Done',
  Reflect  = 'Reflect',

  Stalled  = 'Stalled',
  Aborted  = 'Aborted',
  Archive  = 'Archive',
  Deleted  = 'Deleted',
}

export enum EntryTypes {
  Transient = 'Transient',
  Note      = 'Note',
  Area      = 'Area',
  Objective = 'Objective',
  Project   = 'Project',
  Task      = 'Task',
}

export enum Priority {
  NONE = 0,
  LOW  = 1,
  MED  = 2, 
  HIGH = 3,
  VERY = 4,
  MAX  = 5
}

export class  Entry extends CustomBaseEntity {
  type:       EntryTypes
  status:     StatusNames
  position?:  number
  priority?:  number
  urgency:    number

  text:       string
  uri?:       string

  tags?:      Collection<Tag>
  meta:       JsonType

  // depends?:  Ref<Entry>[]
  parent?:    Collection<Entry>

  // updates:
  // reviews:
  
  recur?:     JsonType
  repeat?:    JsonType
  review?:    JsonType
  
  cron?:      Date
  due?:       Date
  end?:       Date
  scheduled?: Date
  until?:     Date
  wait?:      Date
  start?:     Date
  reviewed?:  Date

  constructor(text: string, rest: object={}) {
    super()
    this.text = text
    this.type = EntryTypes.Transient
    this.status = StatusNames.Capture
    this.meta   = new JsonType()
    this.urgency = 1.0
    this.tags = new Collection<Tag>(this)
  }
}

export const EntrySchema = new EntitySchema<Entry, CustomBaseEntity>({
  name:      'Entry',
  extends:   'CustomBaseEntity',
  properties: {
    type:      { enum: true, items: () => EntryTypes,  default: EntryTypes.Transient },
    status:    { enum: true, items: () => StatusNames, default: StatusNames.Capture },

    position:  { type: 'int',  default: 1 },
    priority:  { type: 'float', default: 1.0 },
    urgency:   { type: 'string', nullable: true},

    text:      { type: 'text' },
    uri:       { type: 'string', nullable: true }, 

    meta:      { type: JsonType },

    parent:    { reference: '1:m', entity: () => 'Entry' },
    tags:      { entity: () => 'Tag', inversedBy: 'entries' },

    // updates:
    // reviews:
  
    recur:     { type: JsonType, nullable: true },
    repeat:    { type: JsonType, nullable: true },
    review:    { type: JsonType, nullable: true },
  
    cron:      { type: Date, nullable: true },
    due:       { type: Date, nullable: true },
    end:       { type: Date, nullable: true },
    scheduled: { type: Date, nullable: true },
    until:     { type: Date, nullable: true },
    wait:      { type: Date, nullable: true },
    start:     { type: Date, nullable: true },
    reviewed:  { type: Date, nullable: true },
  }
})

export default Entry
