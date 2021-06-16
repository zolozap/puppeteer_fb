require('dotenv').config()
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const conn = mongoose.createConnection(process.env.MONGOCLIENT_CONNECT, { 
    dbName: 'aion',
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).catch(error => handleError(error));

const target_listSchema = new Schema({
    link_crawl: String,
    crawled: Boolean,
    insert_timestamp: Date,
    last_time: Date,
    latest: Date,
    link_original: String,
    source: String,
    target_type: String,
    type: String,
    uid: String,
    status: Number,
    crawling:Boolean,
    email: String,
    telnumber: String
})

const TargetListModel = conn.model('target_list',target_listSchema)

module.exports = TargetListModel