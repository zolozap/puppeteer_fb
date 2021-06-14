const mongoose = require('mongoose')
const Schema = mongoose.Schema

const usersSchema = new Schema({
    _id: mongoose.ObjectId,
    email: String,
    username: String,
    disabled: Boolean,
    full_name: String,
    hashed_password: String
})

const TargetListModel = mongoose.model('users',usersSchema)

module.exports = TargetListModel