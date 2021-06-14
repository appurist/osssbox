const s3api = require('../lib/s3api');

// config.json format is:
const DEFAULT_CONFIG = {
  "site": "osssbox",
  "name": "OSSSBox Server",
  "admin": "admin",
  "registration": false
}

let config = null;

async function getConfig(force) {
  if (force || !config) {
    let doc = await s3api.docGet('config.json').catch(err => console.error('Reading config.json:',err.message));
    if (!doc) {
      console.warn("No config.json found for site, assuming defaults.");
      doc = Object.assign({}, DEFAULT_CONFIG);
      await s3api.docPut('config.json', doc).catch(err => console.error('Writing default config.json:',err.message));
    } else {
      // console.log("config:", JSON.stringify(config, null, 2));
      config = JSON.parse(doc);
      console.log("config.json loaded from bucket.");
    }
  }
  return config;
}

async function putConfig(newConfig) {
  config = Object.assign({}, newConfig);
  await s3api.docPut('config.json', config).catch(err => console.error('Writing default config.json:',err.message));
  return config;
}

module.exports = { getConfig, putConfig };