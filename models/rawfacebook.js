require('dotenv').config()
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const aion = mongoose.createConnection(process.env.MONGOCLIENT_CONNECT.concat('aion'));

const facebookSchema = new Schema({
    id: String,
    postid: String,
    display_name: String,
    fb_id: String,
    title: String,
    timestamp: String,
    comment: { type: Array, default: null },
    processed: Boolean,
    reaction: { type: Schema.Types.Mixed, default: null },
    share: Number,
    comment_count: Number,
    photos: Array,
    snapshot: String,
    link_original: String,
    timestamp_transaction: { type: Date, default: Date.now }
},{strict:false})  

const rawFacebookModel = aion.model('facebook',facebookSchema)

module.exports = rawFacebookModel