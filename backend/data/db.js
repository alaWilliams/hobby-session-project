const Database = require('better-sqlite3');

const db = new Database('hobbies.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    maxParticipants INTEGER NOT NULL,
    isPublic BOOLEAN NOT NULL DEFAULT 0,
    managementCode TEXT NOT NULL,
    privateCode TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId INTEGER NOT NULL,
    name TEXT NOT NULL,
    isEditor BOOLEAN NOT NULL DEFAULT 0,
    attendanceCode TEXT NOT NULL,
    FOREIGN KEY(sessionId) REFERENCES sessions(id)
  );
`);

module.exports = db;