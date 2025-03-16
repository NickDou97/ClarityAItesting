// Import the Netlify Blob client
const { getNetlifyBlob } = require('@netlify/blobs');

/**
 * Store data in Netlify Blobs
 * @param {Object} event - Netlify Function event
 * @returns {Promise<Object>} - Response object
 */
exports.handler = async (event, context) => {
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Parse the request body
    const { key, data } = JSON.parse(event.body);

    // Validate inputs
    if (!key || !data) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters: key and data' }),
      };
    }

    // Add a timestamp to the data
    const dataWithTimestamp = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    // Store the data in Netlify Blobs
    // The namespace 'user-data' is used to group related blobs
    const blob = getNetlifyBlob({
      namespace: 'user-data',
      context,
    });

    await blob.set(key, JSON.stringify(dataWithTimestamp));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        message: 'Data stored successfully',
        key,
      }),
    };
  } catch (error) {
    console.error('Error storing data:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to store data',
        details: error.message,
      }),
    };
  }
}; 