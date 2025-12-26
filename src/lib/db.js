const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

let db

function getDb() {
  if (!db) {
    throw new Error('DB not initialized. Call initDb() first.')
  }
  return db
}

function initDb({ sqlitePath, schemaPath } = {}) {
  const resolvedSqlitePath = sqlitePath || process.env.SQLITE_PATH || './data/app.db'
  const resolvedSchemaPath = schemaPath || process.env.SQLITE_SCHEMA_PATH || './schema.sql'

  const absSqlitePath = path.isAbsolute(resolvedSqlitePath)
    ? resolvedSqlitePath
    : path.join(process.cwd(), resolvedSqlitePath)

  const dataDir = path.dirname(absSqlitePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  db = new Database(absSqlitePath)
  db.pragma('foreign_keys = ON')
  db.pragma('journal_mode = WAL')

  const absSchemaPath = path.isAbsolute(resolvedSchemaPath)
    ? resolvedSchemaPath
    : path.join(process.cwd(), resolvedSchemaPath)

  const schemaSql = fs.readFileSync(absSchemaPath, 'utf-8')
  db.exec(schemaSql)

  return db
}

module.exports = {
  getDb,
  initDb,
}
