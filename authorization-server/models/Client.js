'use strict';
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    clientId: String,
    clientSecret: String
});


module.exports = mongoose.model('Client', clientSchema)