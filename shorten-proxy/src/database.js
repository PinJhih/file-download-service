const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./data/short_urls.db");

db.run(`CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT,
    short_code TEXT UNIQUE,
    long_url TEXT,
    expires_at TIMESTAMP
)`);

function runQuery(query, params) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(query, params) {
  return new Promise((resolve, reject) => {
    db.get(query, params, function (err, row) {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function getAll(query, params) {
  return new Promise((resolve, reject) => {
    db.all(query, params, function (err, rows) {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = { runQuery, get, getAll };
