const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let database;
async function connect() {
    // const client = await MongoClient.connect('mongodb://localhost:27017');
    const client = await MongoClient.connect('mongodb://localhost:27017');
    database = client.db('note_app');
}
function getDb() {
    if (!database) {
        throw { message: 'database cnonection not establish' }
    }
    return database;
}
module.exports = {
    connectToDb: connect,
    getDb: getDb
}
