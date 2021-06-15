// chop a URL into an array of /-separated parts starting from the one after the specified 'func'. e.g. chopURL(url, 'users')
function chopURL(url, func) {
  let parts = url.split('/');
  if (func) {
    let x = parts.findIndex(el => el === func);
    if (x < 0) return [ ];
    parts = parts.splice(x);
  }
  return parts;
}

module.exports = chopURL;