const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
require('dotenv').config();
const database_name = process.env.DATABASE;

let database;
async function connect() {
    // const client = await MongoClient.connect('mongodb://localhost:27017');
    const client = await MongoClient.connect('mongodb://localhost:27017');
    database = client.db(database_name);
}
function getDb() {
    if (!database) {
        throw { message: 'database cnonection not establish' }
    }
    return database;
}
module.exports = {
    connectToDb: connect,
    "database_name": database_name,
    getDb: getDb
}
