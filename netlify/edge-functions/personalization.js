// Netlify Edge Function for Dynamic Content Personalization
// This function customizes content based on user context (location, device, etc.)

export default async (request, context) => {
  // Get information about the request
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";
  const geo = context.geo || {};
  const country = geo.country?.code || "unknown";
  const timezone = geo.timezone || "unknown";
  const city = geo.city || "unknown";
  
  // Check if this is a bot to avoid personalization for crawlers
  const isBot = /bot|crawl|spider/i.test(userAgent);
  
  // Only modify HTML pages and not for bots
  if (isBot || (!url.pathname.endsWith('.html') && url.pathname !== '/' && !url.pathname.endsWith('/'))) {
    return;
  }

  // Fetch the original response
  const response = await context.next();
  
  // Get the HTML content
  const page = await response.text();
  
  // Define personalization segments
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
  const isNorthAmerica = ['US', 'CA', 'MX'].includes(country);
  const isEurope = ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'CH', 'AT', 'BE', 'IE', 'SE', 'DK', 'NO', 'FI'].includes(country);
  
  // Personalization rules
  let personalizedPage = page;
  
  // 1. Personalize greeting based on location
  let locationGreeting = 'Hello from ClarityAI!';
  
  if (city !== 'unknown') {
    locationGreeting = `Hello from ${city}! `;
  } else if (country !== 'unknown') {
    const countryNames = {
      'US': 'the United States',
      'CA': 'Canada',
      'GB': 'the United Kingdom',
      'DE': 'Germany',
      'FR': 'France',
      // Add more as needed
    };
    
    locationGreeting = `Hello from ${countryNames[country] || country}! `;
  }
  
  // Replace greeting placeholder if it exists
  personalizedPage = personalizedPage.replace(
    /<span id="location-greeting">.*?<\/span>/,
    `<span id="location-greeting">${locationGreeting}</span>`
  );
  
  // 2. Adjust CTA button text based on region
  let ctaText = 'Schedule Your Free Strategy Call';
  
  if (isEurope) {
    ctaText = 'Book Your Complimentary Strategy Session';
  } else if (country === 'AU') {
    ctaText = 'Reserve Your Strategy Consultation';
  }
  
  // Replace CTA placeholder if it exists
  personalizedPage = personalizedPage.replace(
    /<span class="cta-text-personalized">.*?<\/span>/g,
    `<span class="cta-text-personalized">${ctaText}</span>`
  );
  
  // 3. Update form label for newsletter based on region
  let newsletterText = 'Get Weekly AI Insights';
  
  if (isEurope) {
    newsletterText = 'Receive GDPR-Compliant AI Updates';
  } else if (isNorthAmerica) {
    newsletterText = 'Get Weekly CX AI Strategies';
  }
  
  // Replace newsletter text placeholder if it exists
  personalizedPage = personalizedPage.replace(
    /<span class="newsletter-text-personalized">.*?<\/span>/g,
    `<span class="newsletter-text-personalized">${newsletterText}</span>`
  );
  
  // 4. Device-specific optimizations
  if (isMobile) {
    // For mobile users, simplify some content but preserve CSS
    personalizedPage = personalizedPage
      .replace(
        /<div class="desktop-expanded-content"([^>]*)>([\s\S]*?)<\/div>/g,
        '<div class="desktop-expanded-content"$1 style="display:none">$2</div>'
      )
      .replace(
        /<div class="mobile-simplified-content"([^>]*)style="display:none"([^>]*)>([\s\S]*?)<\/div>/g,
        '<div class="mobile-simplified-content"$1$2>$3</div>'
      );
  }
  
  // 5. Add personalization data for client-side use
  const personalizationData = {
    country,
    timezone,
    isMobile,
    isEurope,
    isNorthAmerica
  };
  
  // Use a non-intrusive way to add the script that won't break layout
  const personalizationScript = `
    <script>
      window.clarityPersonalization = ${JSON.stringify(personalizationData)};
      console.log("Edge Personalization Applied", window.clarityPersonalization);
      
      // Apply personalization without disrupting CSS
      document.addEventListener('DOMContentLoaded', function() {
        // Apply location greeting if element exists
        const greetingEl = document.getElementById('location-greeting');
        if (greetingEl) {
          greetingEl.textContent = ${JSON.stringify(locationGreeting)};
          // Make parent visible if it was hidden
          if (greetingEl.parentElement && greetingEl.parentElement.style.display === 'none') {
            greetingEl.parentElement.style.display = 'block';
          }
        }
        
        // Apply CTA text if elements exist
        const ctaElements = document.querySelectorAll('.cta-text-personalized');
        ctaElements.forEach(el => {
          el.textContent = ${JSON.stringify(ctaText)};
        });
        
        // Apply newsletter text if elements exist
        const newsletterElements = document.querySelectorAll('.newsletter-text-personalized');
        newsletterElements.forEach(el => {
          el.textContent = ${JSON.stringify(newsletterText)};
        });
      });
    </script>
  `;
  
  // Insert the script before the closing body tag
  personalizedPage = personalizedPage.replace(
    '</body>',
    `${personalizationScript}\n</body>`
  );
  
  // Return the personalized page
  return new Response(personalizedPage, {
    headers: response.headers
  });
}; 