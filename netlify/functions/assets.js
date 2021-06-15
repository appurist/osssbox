const uuid = require('uuid-random');

const auth = require('../lib/auth');
const s3api = require('../lib/s3api');
const chopURL = require('../lib/chopURL');

async function GetList(userId) {
  s3api.connect();

  let list = await s3api.docList(`users/${userId}/assets`);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list, null, 2)
  };
}

async function ReadOne(userId, projId) {
  s3api.connect();

  let doc = await s3api.docGet(`users/${userId}/assets/${projId}.json`);
  return {
    statusCode: doc ? 200 : 404,
    headers: { 'Content-Type': doc ? 'application/json' : 'text/html'},
    body: doc || `User '${userId}' has no such project '${projId}'.`
  };
}

async function CreateOne(userId, json) {
  s3api.connect();

  let projId = uuid();
  let doc;
  try {
    doc = JSON.parse(json);
  } catch (err) {
    return {
      statusCode: 400,
      body: 'Bad JSON body: '+err.message
    };
  }
  let newDoc = Object.assign({ }, doc, {uid: projId});
  let result = await s3api.docPut(`users/${userId}/assets/${projId}.json`, newDoc);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(newDoc, null, 2)
  };
}

exports.handler = async (event, /* context */ ) => {
  try {
    console.log(`${event.path} [${event.httpMethod}] from ${event.headers["client-ip"]}`);

    // First let's check the user context prerequisites (e.g. to see if registration is even allowed).
    let authorization = event.headers['authorization'];
    let user = auth.getAuth(authorization)
    if (!user?.authenticated) {
      return { statusCode: 401, body: "Not authorized." };
    }

    let parts = chopURL(event.path, 'assets');
    let projId = '';
    if (parts[1]) {
      projId = parts[1].trim();
    }

    // Here we implement a simple CRUD interface, plus GET for list.
    switch (event.httpMethod) {
    case 'GET':
      return projId ? await ReadOne(user.uid, projId) : await GetList(user.uid);
    case 'POST':
      return projId ? { statusCode: 400 } : await CreateOne(user.uid, event.body);
    case 'PUT':
      return projId ? await UpdateOne(user.uid, projId, event.body) : { statusCode: 400 };
    case 'DELETE':
      return projId ? await DeleteOne(user.uid, projId) : { statusCode: 400 };
    default:
      return { statusCode: 405, body: `Unsupported method '${event.httpMethod}'.`};
    }
  } catch (err) {
    console.error("Exception:", err.message);
    if (err.stack) {
      console.log(err.stack);
    }
    return { statusCode: 500 };
  }
};