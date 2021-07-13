const { S3Client, ListObjectsCommand, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { fromIni } = require("@aws-sdk/credential-provider-ini");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");

const chalk = require("chalk");

// Part size for blob uploads
const PARTSIZE = (5*1024*1024)

// Set the AWS context
let accessKeyId = process.env.S3_ACCESS_KEY_ID;
let secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
let region = process.env.S3_REGION_ID;
let endpoint = process.env.S3_ENDPOINT;
let bucket = process.env.S3_BUCKET;
let profile = process.env.S3_PROFILE_ID;

let Delimiter = '/';
let s3Client;

function connect() {
  if (s3Client) delete s3Client;

  let credentials;
  if (accessKeyId && secretAccessKey) {
    credentials = { accessKeyId, secretAccessKey };
  } else
  if (profile) {
    credentials = fromIni({profile});
  }

  if (!(region || endpoint)) throw new Error('Neither AWS region nor endpoint was specified, e.g. "us-east-1" or "ewr1.vultrobjects.com"');

  s3Client = new S3Client({ region, credentials, endpoint });

}

function setAccessKey(_key) {
  accessKeyId = _key;
  if (s3Client) connect();
}
function setSecretAccessKey(_key) {
  secretAccessKey = _key;
  if (s3Client) connect();
}
function setRegion(_region) {
  region = _region;
  if (s3Client) connect();
}
function setEndpoint(_endpoint) {
  endpoint = _endpoint;
  if (s3Client) connect();
}
function setProfile(_profile) {
  profile = _profile;
  if (s3Client) connect();
}
function setBucket(_bucket) {
  bucket = _bucket;
  // no need to connect for a bucket name change
}

function normalizePrefix(Prefix) {
  if ((Prefix === '/') || (Prefix === '~') || (Prefix === '~/')) {
    Prefix = '';
  } else if (Prefix && !Prefix.endsWith('/')) {
    Prefix += '/';
  }

  if (Prefix && Prefix.startsWith('~/')) {
    Prefix = Prefix.slice(2);
  } else
  if (Prefix && Prefix.startsWith('/')) {
    Prefix = Prefix.slice(1);
  }

  return Prefix;
}

async function getAcl(key) {
  let cmd = new s3Client.GetBucketAclCommand()
}

// pass a collection name for 'where'
async function docList(_prefix, _bucket) {
  let list = [ ];
  let Bucket = _bucket || bucket;
  try {
    let Prefix = normalizePrefix(_prefix);
    let results = await s3Client.send(new ListObjectsCommand({ Delimiter, Bucket, Prefix }));
    if (results.CommonPrefixes) { // any folders?
      for (let folder of results.CommonPrefixes) {
        let name = folder.Prefix.slice(Prefix.length);
        list.push({ name, size: 0, type: 'folder', modified: 0 });
      }
    }
    if (results.Contents) { // any files?
      for (let doc of results.Contents) {
        let name = doc.Key.slice(Prefix.length);
        if (name.length>0) {  // skip the current (parent) folder itself, specifed in Prefix
          list.push({ name, size: doc.Size, type: 'file', modified: doc.LastModified });
        }
      }
    }
  }
  catch (err) {
    // console.error("List error:", err.stack || chalk.red(err.message));
    console.error("List error:", chalk.red(err.message));
    list = [ ];
  }
  return list; // For unit tests.
}

// Retrieve the document 'Key' from '_bucket'.
// Unlike docPut, if it is JSON, it is NOT automatically converted to an object.
async function docGet(Key, _bucket) {
  let Bucket = _bucket || bucket;
  try {
    // Create a helper function to convert a ReadableStream to a string.
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });

    // Get the object} from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(new GetObjectCommand({ Bucket, Key }));
    // return data; // For unit tests.
    // Convert the ReadableStream to a string.
    const bodyContents = await streamToString(data.Body);
    // console.log(bodyContents);
    return bodyContents;
  } catch (err) {
    if (err.message !== 'NoSuchKey') {
      console.error(`Read error '${chalk.red(err.message)}' on:`, Key);
    }
    return undefined;
  }
}

// Store the document 'Key' in '_bucket'.
async function docPut(Key, _doc, _bucket) {
  let Bucket = _bucket || bucket;
  let doc = _doc || { };
  // S3 API can't directly serialize with a simple PutObjectCommand.
  let Body = (typeof doc === 'object') ? JSON.stringify(doc, null, 2) : doc;
  let result;

  try {
    result = await s3Client.send(new PutObjectCommand({ Bucket, Key, Body }));
  } catch (err) {
    // console.error("Read error:", err.message);
    console.error("Read error:", chalk.red(err.message));
    return undefined;
  }
  return result;
}

// keyPrefix should be the full key, like `users/${userId}/assets/${assetId}.blob`
const URL_EXPIRATION_SECONDS = 600  //Seconds before the presigned post expires. 3600 by default.
async function getUploadURL(prefix, fn, _bucket) {
  let Bucket = _bucket || bucket;
  let Key = prefix + fn;
  const Conditions = [{ acl: "private" }, { bucket: Bucket }, ["starts-with", "$key", prefix]];
  const Fields = {
    acl: "private",
  };
  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket,
    Key,
    Conditions,
    Fields,
    Expires: URL_EXPIRATION_SECONDS,
  });
  return { url, fields };
}

module.exports = { 
  setAccessKey, setSecretAccessKey, setProfile,
  setRegion, setEndpoint, setBucket,
  connect, normalizePrefix, getUploadURL,
  docList, docGet, docPut
}
