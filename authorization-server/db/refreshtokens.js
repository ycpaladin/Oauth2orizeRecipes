'use strict';

const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

// The refresh tokens.
// You will use these to get access tokens to access your end point data through the means outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)

/**
 * Tokens in-memory data structure which stores all of the refresh tokens
 */
// let tokens = Object.create(null);

/**
 * Returns a refresh token if it finds one, otherwise returns null if one is not found.
 * @param   {String}  token - The token to decode to get the id of the refresh token to find.
 * @returns {Promise} resolved with the token
 */
// exports.find = (token) => {
//   try {
//     const id = jwt.decode(token).jti;
//     return Promise.resolve(tokens[id]);
//   } catch (error) {
//     return Promise.resolve(undefined);
//   }
// };

exports.find = (token) => {
  const id = jwt.decode(token).jti;
  return RefreshToken.findOne({ id }).exec().then(doc => {
    if (!doc) throw new Error('RefreshToken not exists ');
    return doc;
  }).catch(() => Promise.resolve(undefined));
};

/**
 * Saves a refresh token, user id, client id, and scope. Note: The actual full refresh token is
 * never saved.  Instead just the ID of the token is saved.  In case of a database breach this
 * prevents anyone from stealing the live tokens.
 * @param   {Object}  token    - The refresh token (required)
 * @param   {String}  userID   - The user ID (required)
 * @param   {String}  clientID - The client ID (required)
 * @param   {String}  scope    - The scope (optional)
 * @returns {Promise} resolved with the saved token
 */

exports.save = (token, userID, clientID, scope) => {
  const id = jwt.decode(token).jti;
  const refreshToken = new RefreshToken({ id, userID, clientID, scope });
  return refreshToken.save();
};


// exports.save = (token, userID, clientID, scope) => {
//   const id = jwt.decode(token).jti;
//   tokens[id] = { userID, clientID, scope };
//   return Promise.resolve(tokens[id]);
// };


/**
 * Deletes a refresh token
 * @param   {String}  token - The token to decode to get the id of the refresh token to delete.
 * @returns {Promise} resolved with the deleted token
 */
exports.delete = (token) => {
  const id = jwt.decode(token).jti;
  return RefreshToken.findOneAndRemove({ id }).exec().catch(error => Promise.resolve(null));
};
// exports.delete = (token) => {
//   try {
//     const id = jwt.decode(token).jti;
//     const deletedToken = tokens[id];
//     delete tokens[id];
//     return Promise.resolve(deletedToken);
//   } catch (error) {
//     return Promise.resolve(undefined);
//   }
// };

/**
 * Removes all refresh tokens.
 * @returns {Promise} resolved with all removed tokens returned
 */

exports.removeAll = () => RefreshToken.find().exec().then((tokens) => {
  RefreshToken.collection.drop();
  return Promise.resolve(tokens);
}).catch(error => Promise.reject(error));


// exports.removeAll = () => {
//   const deletedTokens = tokens;
//   tokens = Object.create(null);
//   return Promise.resolve(deletedTokens);
// };
