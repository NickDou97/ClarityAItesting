// Import the Netlify Blob client
const { getNetlifyBlob } = require('@netlify/blobs');

/**
 * Retrieve data from Netlify Blobs
 * @param {Object} event - Netlify Function event
 * @returns {Promise<Object>} - Response object
 */
exports.handler = async (event, context) => {
  try {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Parse query parameters
    const params = new URL(event.rawUrl).searchParams;
    const key = params.get('key');

    // Validate inputs
    if (!key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameter: key' }),
      };
    }

    // Retrieve the data from Netlify Blobs
    const blob = getNetlifyBlob({
      namespace: 'user-data',
      context,
    });

    // Get the data
    const storedData = await blob.get(key);

    // Check if data exists
    if (!storedData) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Data not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        data: JSON.parse(storedData),
      }),
    };
  } catch (error) {
    console.error('Error retrieving data:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to retrieve data',
        details: error.message,
      }),
    };
  }
}; 