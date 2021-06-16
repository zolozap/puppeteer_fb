require('dotenv').config()
const mongoose = require('mongoose')
const Schema = mongoose.Schema

var db = mongoose.connect(process.env.MONGOCLIENT_CONNECT, { 
    dbName: 'aion',
    useNewUrlParser: true, 
    useUnifiedTopology: true
})

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

const rawFacebookModel = db.model('facebook',facebookSchema)

module.exports = rawFacebookModel