const mongoose = require('mongoose')
const Schema = mongoose.Schema

const target_listSchema = new Schema({
    _id: mongoose.ObjectId,
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

const TargetListModel = mongoose.model('target_list', target_listSchema)

module.exports = TargetListModel