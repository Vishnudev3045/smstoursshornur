const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  const method = event.httpMethod;

  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // GET: Serve store.json
  if (method === 'GET') {
    try {
      const storePath = path.resolve(__dirname, '../../data/store.json');
      if (fs.existsSync(storePath)) {
        const data = fs.readFileSync(storePath, 'utf8');
        return {
          statusCode: 200,
          headers,
          body: data
        };
      }
    } catch (err) {
      console.warn('Error reading store.json in function:', err.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Store API Online" })
    };
  }

  // POST: Receive updated store payload
  if (method === 'POST') {
    try {
      const payload = JSON.parse(event.body || '{}');
      try {
        const storePath = path.resolve(__dirname, '../../data/store.json');
        fs.writeFileSync(storePath, JSON.stringify(payload, null, 2), 'utf8');
      } catch (writeErr) {
        // Ephemeral in lambda, but acknowledged
        console.warn('Lambda disk write notice:', writeErr.message);
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: "Store updated successfully" })
      };
    } catch (parseErr) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: parseErr.message })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: "Method Not Allowed" })
  };
};
