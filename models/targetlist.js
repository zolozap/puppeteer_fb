const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
},{strict:false})

const TargetListModel = mongoose.model('target_list',target_listSchema,'target_list')

module.exports = TargetListModel