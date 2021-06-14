let SITE = process.env.OSSSBOX_SITE;      // short name (e.g. 'osssbox')
let NAME = process.env.OSSSBOX_NAME;      // long name (e.g. 'OSSSBox Server')
let ISSUER = process.env.OSSSBOX_ISSUER;  // for the token produced
let SECRET = process.env.OSSSBOX_SECRET;  // for JWT signing
let ADMIN = process.env.OSSSBOX_ADMIN;    // e.g. 'admin' or the administrator's UUID
let REGISTRATION = process.env.OSSSBOX_REGISTRATION;  // true or yes, otherwise interpreted as false.

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

module.exports = { SITE, NAME, ISSUER, SECRET, ADMIN, REGISTRATION };