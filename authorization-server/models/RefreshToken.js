'use strict';

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    userID: String,
    clientID: String,
    scope: String,
});


module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
