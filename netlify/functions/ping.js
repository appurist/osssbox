exports.handler = async (event, /* context */ ) => {
  console.log(`${event.path} [${event.httpMethod}] from ${event.headers["client-ip"]}`);
  if (event.httpMethod !== 'GET') return { statusCode: 405 };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'osssbox', apiVersion: 1 })
  };
};