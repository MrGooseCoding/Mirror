const sqlite3 = require('sqlite3').verbose()
const { dbPath } = require('./../config')

const format = (value) => `${(typeof value === "string")?`"${value}"`:value}`

const clausify = (data) => Object.entries(data)
    .map(([key, value]) => `${key} = ${format(value)}`)

const getWhereClause = (data) => clausify(data).join(' AND ')

const getSetClause = (data) => clausify(data).join(', ')

function open() {
    return new sqlite3.Database(dbPath);
}

function close(db) {
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
    });
}

function get(db, table, identifierAttr) {
    const whereClause = getWhereClause(identifierAttr)

    const query = `SELECT * FROM ${table} ${whereClause ? 'WHERE ' + whereClause : ''}`
    
    return new Promise(function(resolve,reject){
        db.all(query, (err,rows) => {
            if(err) {return reject(err);}
            resolve(rows);
        });
    });
}

function search(db, table, identifierAttr, limit) {
    const attrName = Object.keys(identifierAttr)[0]
    const attrValue = identifierAttr[attrName]

    const query = `SELECT * FROM ${table} WHERE ${attrName} LIKE '%${attrValue}%' LIMIT ${limit}`
    
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) {return reject(err)} 
            resolve(rows)
        })
    })
}

function insert(db, table, data) {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?');
    const values = keys.map(key => data[key]);

    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`
    return new Promise((resolve, reject) => {
        db.run(query, ...values, (err) => {
            if (err) {reject(err)}
            resolve()
        })
    })
}

function write(db, table, data, identifierAttr) {
    const whereClause = getWhereClause(identifierAttr)
    const setClause = getSetClause(data)

    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    return new Promise((resolve, reject) => {
        db.run(query, (err) => {
            if (err) {reject(err)}
            resolve()
        })
    })
}

function deleteAll(db, table) {
    const query = `DELETE FROM ${table}`

    return new Promise((resolve, reject) => {
        db.run(query, (err) => {
            if (err) {reject(err)}
            resolve()
        })
    })
}

function deleteItem(db, table, identifierAttr) {
    const whereClause = getWhereClause(identifierAttr)
  
    const query = `DELETE FROM ${table} WHERE ${whereClause}`
  
    return new Promise((resolve, reject) => {
        db.run(query, (err) => {
            if (err) {
            return reject(err)
            }
            resolve()
        })
    })
}  

function getDataTypes(db, table) {
    const query = `PRAGMA table_info(${table})`

    return new Promise((resolve, reject) => {
        db.all(query, (err,rows) => {
            if(err) {return reject(err);}
            resolve(rows);
        });
    })
}


module.exports = {open, close, get, getDataTypes, search, insert, write, deleteAll, deleteItem}