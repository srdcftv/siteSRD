const fs = require('fs');
const { Database: RawDB } = require('node-sqlite3-wasm');
const path = require('path');

const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbFile = path.join(dbDir, 'srd.db');
const lockPath = dbFile + '.lock';
try { if (fs.existsSync(lockPath)) fs.rmSync(lockPath, { recursive: true, force: true }); } catch (_) {}

const raw = new RawDB(dbFile);
raw.exec('PRAGMA foreign_keys = ON');

function wrapStmt(stmt) {
  function normalizeParams(params) {
    const clean = params.map(v => (v === undefined ? null : v));
    if (clean.length === 0) return undefined;
    if (clean.length === 1) return clean[0];
    return clean;
  }
  return {
    run(...params) { return stmt.run(normalizeParams(params)); },
    get(...params) {
      const r = stmt.get(normalizeParams(params));
      return r === null ? undefined : r;
    },
    all(...params) { return stmt.all(normalizeParams(params)) || []; },
    finalize() { try { stmt.finalize(); } catch (_) {} },
  };
}

const db = {
  _raw: raw,
  exec(sql) { return raw.exec(sql); },
  prepare(sql) { return wrapStmt(raw.prepare(sql)); },
  transaction(fn) {
    return function (...args) {
      raw.exec('BEGIN');
      try {
        const result = fn(...args);
        raw.exec('COMMIT');
        return result;
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    };
  },
};

db.exec(`
  CREATE TABLE IF NOT EXISTS orcamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT,
    cidade TEXT,
    servico TEXT NOT NULL,
    detalhes TEXT,
    mensagem TEXT,
    status TEXT DEFAULT 'novo',
    criado_em TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS contatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    mensagem TEXT NOT NULL,
    criado_em TEXT DEFAULT (datetime('now','localtime'))
  );
`);

module.exports = db;
