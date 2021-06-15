const jwt = require('jsonwebtoken');
const bcrypt = require ('bcrypt');
const config = require('../lib/config');

const saltRounds = 12;

function NoSuchUser() {
  return Object.assign({}, { authenticated: false });
}

function makeCredentials(password) {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  return Object.assign ({}, { salt, hash });
}

function checkPassword(password, hash, salt) {
  // bcrypt stores the original salt right in the hash so it is not needed
  return bcrypt.compareSync(password, hash);
}

function makeToken(user, issuer) {
  return jwt.sign(user, config.SECRET, { issuer })
}

function makeUserResponse(user) {
  let response = Object.assign({ }, user)
  response.authenticated = !!response.uid;
  response.administrator = (response.login === config.ADMIN) || (response.uid === config.ADMIN);
  return response;
}

function verifyToken(token) {
  let user = NoSuchUser();
  if (!token)
    return user;

  let result = jwt.verify(token, config.SECRET, function(err, decoded) {
    if (err)
      return user;

    // log.info("Storing user for token:", decoded);
    user = makeUserResponse(decoded);
    user.token = token;
    return user;
  });
  return result;
}

function getAuth(authorization) {
  if (!authorization)
    return NoSuchUser();

  let words = authorization.split(' ');
  if (words[0] !== 'Bearer')
    return NoSuchUser();

  return verifyToken(words[1]);
}
  
function isAdmin(request) {
  let user = getAuth(request);
  return user && user.administrator;
}

module.exports = { checkPassword, makeCredentials, makeUserResponse, makeToken, verifyToken, getAuth, isAdmin };
