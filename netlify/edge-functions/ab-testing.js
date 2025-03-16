// Advanced A/B Testing Edge Function
// Provides more control than built-in split testing including:
// - Traffic allocation based on user segments
// - Persistent variation assignment with cookies
// - Custom event tracking for test analysis

export default async (request, context) => {
  // Only proceed for HTML pages
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Skip for assets and non-HTML paths
  if (path.match(/\.(js|css|png|jpg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return;
  }
  
  // Get the original response
  const response = await context.next();
  
  // Only modify HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }
  
  // Setup and read cookies
  const cookies = parseCookies(request.headers.get('cookie') || '');
  
  // Define our experiments
  const experiments = {
    'homepage-headline': {
      variants: [
        { id: 'control', weight: 50 }, // Original headline
        { id: 'variation', weight: 50 } // New headline
      ],
      isActive: path === '/' || path === '/index.html',
      duration: 30 // cookie duration in days
    },
    'cta-color': {
      variants: [
        { id: 'blue', weight: 33 },
        { id: 'green', weight: 33 },
        { id: 'purple', weight: 34 }
      ],
      isActive: true, // run on all pages
      duration: 30
    },
    'assessment-length': {
      variants: [
        { id: 'standard', weight: 50 },
        { id: 'short', weight: 50 }
      ],
      isActive: path.includes('assessment'),
      duration: 30
    }
  };
  
  // Get variant assignments for active experiments
  const assignments = {};
  const newCookies = [];
  
  for (const [expName, config] of Object.entries(experiments)) {
    if (config.isActive) {
      const cookieName = `exp_${expName}`;
      
      // Check if user already has a variant assigned
      if (cookies[cookieName]) {
        assignments[expName] = cookies[cookieName];
      } else {
        // Assign a variant based on weighted random selection
        const variant = selectVariantByWeight(config.variants);
        assignments[expName] = variant.id;
        
        // Set a cookie for persistent assignment
        const expires = new Date();
        expires.setDate(expires.getDate() + config.duration);
        newCookies.push(`${cookieName}=${variant.id}; path=/; expires=${expires.toUTCString()}`);
      }
    }
  }
  
  // Get the page content
  const page = await response.text();
  
  // Apply variants to the page content
  let modifiedPage = page;
  
  // Add experiment tracking script with the assignments
  const experimentScript = `
    <script>
      window.clarityExperiments = ${JSON.stringify(assignments)};
      
      // Send experiment data to analytics
      document.addEventListener('DOMContentLoaded', function() {
        // Check if analytics is loaded
        if (typeof window.clarityAnalytics !== 'undefined') {
          // Track experiment views
          Object.entries(window.clarityExperiments).forEach(([experiment, variant]) => {
            window.clarityAnalytics.track('experiment_view', {
              experiment,
              variant,
              page: window.location.pathname
            });
          });
          
          // Track experiment conversions
          document.querySelectorAll('[data-conversion-target]').forEach(element => {
            element.addEventListener('click', function() {
              const conversionTarget = this.getAttribute('data-conversion-target');
              window.clarityAnalytics.track('experiment_conversion', {
                experiments: window.clarityExperiments,
                conversionTarget,
                page: window.location.pathname
              });
            });
          });
        }
      });
      
      // Apply visual changes based on experiments
      function applyExperimentVariants() {
        const variants = window.clarityExperiments;
        
        // Homepage headline experiment
        if (variants['homepage-headline'] === 'variation') {
          const headlineElement = document.querySelector('.hero-headline');
          if (headlineElement) {
            // Preserve the original class list and structure while changing the content
            const originalClasses = headlineElement.classList.value;
            const originalInnerHTML = headlineElement.innerHTML;
            const highlightElem = originalInnerHTML.match(/<span class="gradient-text">([\s\S]*?)<\/span>/);
            
            if (highlightElem) {
              headlineElement.innerHTML = 'Transform Your CX Strategy <span class="gradient-text">With AI That Understands Humans</span>';
            }
          }
        }
        
        // CTA color experiment
        if (variants['cta-color']) {
          const ctaButtons = document.querySelectorAll('.primary-button');
          const colorMap = {
            'blue': '#0052CC',
            'green': '#00875A',
            'purple': '#6554C0'
          };
          
          ctaButtons.forEach(button => {
            // Only change the background color, not other styles
            const originalColor = window.getComputedStyle(button).backgroundColor;
            button.style.backgroundColor = colorMap[variants['cta-color']] || originalColor;
          });
        }
        
        // Assessment length experiment
        if (variants['assessment-length'] === 'short' && window.location.pathname.includes('assessment')) {
          const optionalQuestions = document.querySelectorAll('.question-optional');
          optionalQuestions.forEach(q => q.style.display = 'none');
          
          const progressCounters = document.querySelectorAll('.progress-counter');
          progressCounters.forEach(counter => {
            const text = counter.textContent;
            if (text.includes('/')) {
              const parts = text.split('/');
              const total = parseInt(parts[1]);
              counter.textContent = parts[0] + '/' + (total - optionalQuestions.length);
            }
          });
        }
      }
      
      // Apply the variants once DOM is loaded
      document.addEventListener('DOMContentLoaded', applyExperimentVariants);
    </script>
  `;
  
  // Insert script before the closing body tag
  modifiedPage = modifiedPage.replace('</body>', `${experimentScript}\n</body>`);
  
  // Set any new cookies in the response
  const headers = new Headers(response.headers);
  newCookies.forEach(cookie => {
    headers.append('Set-Cookie', cookie);
  });
  
  // Return the modified page
  return new Response(modifiedPage, {
    status: response.status,
    headers
  });
};

// Helper function to parse cookies
function parseCookies(cookieString) {
  const cookies = {};
  
  if (cookieString) {
    cookieString.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length >= 2) {
        cookies[parts[0]] = parts.slice(1).join('=');
      }
    });
  }
  
  return cookies;
}

// Helper function to select a variant based on weights
function selectVariantByWeight(variants) {
  // Calculate total weight
  const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
  
  // Generate a random number between 0 and totalWeight
  const random = Math.random() * totalWeight;
  
  // Select variant based on weight
  let cumulativeWeight = 0;
  for (const variant of variants) {
    cumulativeWeight += variant.weight;
    if (random <= cumulativeWeight) {
      return variant;
    }
  }
  
  // Fallback to first variant (should never happen if weights are positive)
  return variants[0];
} 