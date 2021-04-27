const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.log(err.message);
    console.log('Connected to the database.');
});

async function dbgetall() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM messages;`, (err, rows) => {
            if (err) return console.log(err.message);
            resolve(rows)
        })
    })
}

async function dbgetrandom() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM messages ORDER BY RANDOM() LIMIT 1;`, (err, rows) => {
            if (err) return console.log(err.message);
            resolve(rows)
        })
    })
}

async function dbdeleteall() {
    return new Promise((resolve, reject) => {
        db.all(`DELETE FROM messages;`, (err, rows) => {
            if (err) return console.log(err.message);
            resolve(rows)
        })
    })
}

async function dbset(message, attachment) {
    return new Promise((resolve, reject) => {
        db.all(`INSERT INTO messages VALUES ("${message}", "${attachment}");`, (err, rows) => {
            if (err) return console.log(err.message);
            resolve(rows)
        })
    })
}

module.exports = { dbgetall, dbgetrandom, dbset, dbdeleteall };