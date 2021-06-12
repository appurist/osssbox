const jwt = require('jsonwebtoken');

console.log('Initializing auth.');
console.log('OSSSBOX_SECRET is', process.env.OSSSBOX_SECRET);

function NoSuchUser() {
  return Object.assign({}, { authenticated: false });
}

function verifyToken(token, secret) {
  let user = NoSuchUser();
  if (!token)
    return user;

  if (!secret) {
    secret = process.env.OSSSBOX_SECRET || process.env.AUTH_SECRET;
  }

  if (!secret) {
    console.error("You must specify either OSSSBOX_SECRET or AUTH_SECRET environment variables.")
    return user;
  }

  let result = jwt.verify(token, secret, function(err, decoded) {
    if (err)
      return user;

    // log.info("Storing user for token:", decoded);
    user = decoded;
    user.token = token;
    user.authenticated = true;
    return user;
  });
  return result;
}

function getAuth(authorization, secret) {
  if (!authorization)
    return NoSuchUser();

  let words = authorization.split(' ');
  if (words[0] !== 'Bearer')
    return NoSuchUser();

  return verifyToken(words[1], secret);
}
  
function isAdmin(request) {
  let user = getAuth(request);
  return user && user.administrator;
}

module.exports = { verifyToken, getAuth, isAdmin };
