import { DataStoreAdapter } from './dataStoreAdapter'

export class FileStoreAdapter implements DataStoreAdapter {
  path: string

  constructor(path: string) {
    this.path = path
  }
}
