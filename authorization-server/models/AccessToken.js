'use strict';
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const accesTokenSchema = new mongoose.Schema({
    id: String,
    userID: String,
    expirationDate: Date,
    clientID: String,
    scope: Array
});


module.exports = mongoose.model('AccessToken', accesTokenSchema)