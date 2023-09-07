
import { LoadStrategy, Options, ReflectMetadataProvider } from '@mikro-orm/core'
import { BetterSqliteDriver, defineConfig } from '@mikro-orm/better-sqlite'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'
// import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { Migrator } from '@mikro-orm/migrations'
// import { EntityGenerator } from '@mikro-orm/entity-generator';
// import { SeedManager } from '@mikro-orm/seeder'

export const config: Options = {
  entities:   ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  metadataProvider: ReflectMetadataProvider,
  driver:           BetterSqliteDriver,
  dbName:           'data/dev.db',
  extensions:       [Migrator],
  highlighter:      new SqlHighlighter(),
  loadStrategy:     LoadStrategy.JOINED,
  debug: true,
  
  // metadataProvider: TsMorphMetadataProvider,
  migrations: {
    tableName:      'mikro_orm_migrations', // migrations table name
    path:           process.cwd() + '/src/migrations', // path to folder with migration files
    glob:           '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)
    transactional:  true, // run each migration inside transaction
    dropTables:     true, // allow to disable table dropping
    // disableForeignKeys: true, // try to disable foreign_key_checks (or equivalent)
    allOrNothing:   true, // run all migrations in current batch in master transaction
    emit:           'ts', // migration generation mode
  },
}

export default config
