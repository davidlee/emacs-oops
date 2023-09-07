import CustomBaseEntity from "./CustomBaseEntity.js"
import Entry from './Entry.js'

import {
  EntitySchema,
  Collection,
  JsonType,
  ReferenceType,
} from "@mikro-orm/core"

export class Tag extends CustomBaseEntity {
  static defaultGroup = 'default'
  
  name: string
  group: string
  entries?: Collection<Entry>  
  coefficient: number

  constructor(name: string, group = Tag.defaultGroup){
    super()
    this.name = name
    this.group = group
    this.coefficient = 1.0
    this.entries = new Collection<Entry>(this)
  }
}

export const TagSchema = new EntitySchema<Tag, CustomBaseEntity>({
  name:      'Tag',
  extends:   'CustomBaseEntity',
  properties: {
    name:  { type: 'string', unique: true },
    group: { type: 'string' },

    coefficient: { type: 'float', default: 1.0 },
    entries: { reference: ReferenceType.MANY_TO_MANY, entity: () => 'Entry', mappedBy: 'tags' }
  }
})

export default Tag