// These are REQUIRED for the server to function correctly.
let SITE = process.env.OSSSBOX_SITE;      // short name (e.g. 'osssbox')
let NAME = process.env.OSSSBOX_NAME;      // long name (e.g. 'OSSSBox Server')
let ISSUER = process.env.OSSSBOX_ISSUER;  // for the token produced
let SECRET = process.env.OSSSBOX_SECRET;  // for JWT signing
let ADMIN = process.env.OSSSBOX_ADMIN;    // e.g. 'admin' or the administrator's UUID
let REGISTRATION = process.env.OSSSBOX_REGISTRATION;  // true or yes, otherwise interpreted as false.
// These are OPTIONAL and have defaults.
let API_PREFIX = process.env.OSSSBOX_API_PREFIX || '/api';
// WARNING: Changing the API_PREFIX requires corresponding Netlify/Lambda updates 
// for the incoming routes (e.g. edits to netlify.toml). This environment variable
// just allows it to be configurable there, yet inform clients of the new path.

if (!SITE) {
  console.error("You must specify an OSSSBOX_SITE environment variables.")
}
if (!NAME) {
  console.error("You must specify an OSSSBOX_NAME environment variables.")
}
if (!ISSUER) {
  console.error("You must specify an OSSSBOX_ISSUER environment variables.")
}
if (!SECRET) {
  console.error("You must specify an OSSSBOX_SECRET environment variables.")
}
if (!ADMIN) {
  console.error("You must specify an OSSSBOX_ADMIN environment variables.")
}
if (REGISTRATION) {
  let value = REGISTRATION.toLowerCase();
  REGISTRATION = (value === 'true') || (value === 'yes') ? true : false;
} else {
  console.error("You must specify an OSSSBOX_REGISTRATION environment variables (e.g. TRUE).")
}

module.exports = { SITE, NAME, ISSUER, SECRET, ADMIN, REGISTRATION, API_PREFIX };