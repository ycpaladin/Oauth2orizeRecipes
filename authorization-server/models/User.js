'use strict';

const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    name: String,
});

/**
 * Password hash middleware.
 */
userSchema.pre('save', (next) => {
    const user = this;
    if (!user.isModified('password')) { return next(); }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(user.password, salt, null, (error, hash) => {
            if (error) { return next(error); }
            user.password = hash;
            next();
        });
    });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    // bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    //     cb(err, isMatch);
    // });

    return bcrypt.compareSync(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);
