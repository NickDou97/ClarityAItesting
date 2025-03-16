/**
 * Netlify Integration Module
 * 
 * This module provides helper functions to utilize Netlify's Platform Primitives:
 * - Image CDN for optimized images
 * - Blobs for storing form data or assessment results
 */

// Image CDN integration
const NetlifyImageCDN = {
  /**
   * Generate an optimized image URL using Netlify Image CDN
   * @param {string} imagePath - Path to original image (e.g., '/img/profile.jpg')
   * @param {Object} options - Transformation options
   * @param {number} options.width - Width of the image
   * @param {number} options.height - Height of the image (optional)
   * @param {string} options.fit - Fit method (cover, contain, fill, inside, outside)
   * @param {string} options.format - Output format (auto, webp, avif, png, jpeg)
   * @param {number} options.quality - Image quality (1-100)
   * @returns {string} Optimized image URL
   */
  getOptimizedUrl(imagePath, options = {}) {
    const baseUrl = '/.netlify/images';
    const params = new URLSearchParams();
    
    // Always include the source image URL
    params.append('url', imagePath);
    
    // Add transformation parameters if provided
    if (options.width) params.append('w', options.width);
    if (options.height) params.append('h', options.height);
    if (options.fit) params.append('fit', options.fit);
    if (options.format) params.append('format', options.format);
    if (options.quality) params.append('q', options.quality);
    
    return `${baseUrl}?${params.toString()}`;
  },
  
  /**
   * Create a responsive image srcset using Netlify Image CDN
   * @param {string} imagePath - Path to original image
   * @param {Array<number>} widths - Array of image widths to generate
   * @param {Object} options - Additional transformation options
   * @returns {string} srcset attribute string
   */
  createSrcSet(imagePath, widths = [320, 640, 960, 1280], options = {}) {
    return widths
      .map(width => {
        const url = this.getOptimizedUrl(imagePath, { ...options, width });
        return `${url} ${width}w`;
      })
      .join(', ');
  },
  
  /**
   * Apply optimized images to all img elements with data-optimize attribute
   */
  optimizeImages() {
    document.querySelectorAll('img[data-optimize]').forEach(img => {
      const src = img.getAttribute('src');
      const width = img.getAttribute('width') || 800;
      
      try {
        const optimizedSrc = this.getOptimizedUrl(src, { width });
        
        // Create srcset if responsive
        if (img.hasAttribute('data-responsive')) {
          const widths = [320, 640, 960, 1280, 1920].filter(w => w <= width * 2);
          img.setAttribute('srcset', this.createSrcSet(src, widths));
          img.setAttribute('sizes', img.getAttribute('data-sizes') || '100vw');
        }
        
        // Update src with optimized version
        img.setAttribute('src', optimizedSrc);
      } catch (error) {
        console.warn('Failed to optimize image:', src, error);
        // Keep the original src if optimization fails
      }
    });
  }
};

// Netlify Blobs integration (for storing form data or assessment results)
const NetlifyBlobs = {
  /**
   * Store data in Netlify Blobs (client-side implementation)
   * Note: For production use, this should be done server-side via Netlify Functions
   * @param {string} key - Unique identifier for the data
   * @param {Object} data - Data to store
   * @returns {Promise}
   */
  async storeData(key, data) {
    try {
      // This is a client-side implementation that uses Netlify Functions
      // In production, create a Netlify Function to handle this securely
      const response = await fetch('/.netlify/functions/store-blob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, data }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to store data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error storing data in Netlify Blobs:', error);
      throw error;
    }
  },
  
  /**
   * Retrieve data from Netlify Blobs (client-side implementation)
   * Note: For production use, this should be done server-side via Netlify Functions
   * @param {string} key - Unique identifier for the data
   * @returns {Promise<Object>}
   */
  async retrieveData(key) {
    try {
      // This is a client-side implementation that uses Netlify Functions
      // In production, create a Netlify Function to handle this securely
      const response = await fetch(`/.netlify/functions/retrieve-blob?key=${encodeURIComponent(key)}`);
      
      if (!response.ok) {
        throw new Error('Failed to retrieve data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error retrieving data from Netlify Blobs:', error);
      throw error;
    }
  }
};

// Initialize Netlify optimizations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Apply optimized images
  NetlifyImageCDN.optimizeImages();
  
  // Example of storing form submissions with privacy flag
  document.querySelectorAll('form[data-store]').forEach(form => {
    form.addEventListener('submit', async (event) => {
      // Don't store if Netlify is already handling the form
      if (form.getAttribute('data-netlify') === 'true') return;
      
      // Store form data with a unique key
      try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Generate unique key for this submission
        const key = `form-${form.getAttribute('name')}-${Date.now()}`;
        
        await NetlifyBlobs.storeData(key, data);
        console.log('Form data stored successfully');
      } catch (error) {
        console.error('Error storing form data:', error);
      }
    });
  });
});

// Export the modules for use in other scripts
window.NetlifyImageCDN = NetlifyImageCDN;
window.NetlifyBlobs = NetlifyBlobs; 