/**
 * AI Maturity Assessment Tool
 * Main assessment JavaScript file that handles form input, visualization, and results
 */

// Global constants for dimensions and colors - available globally for non-module access
window.CLARITY_DIMENSIONS = [
  'strategy', 'process', 'technology', 'people', 'data', 'governance'
];

window.CLARITY_COLORS = {
  beginner: '#FF6B6B',
  developing: '#FFD166',
  established: '#06D6A0',
  advanced: '#118AB2',
  leading: '#5D54F1',
  primary: '#6E59F2',
  benchmark: '#FF9B50'
};

// Performance metrics collection
const perfMetrics = {
  initStart: 0,
  initEnd: 0,
  formReady: 0,
  firstInteraction: 0,
  resultsShown: 0
};

// Initialize the assessment tool
function initAssessment() {
  console.log("Initializing enhanced assessment experience...");
  
  // Core functionality initialization
  setupServiceWorker();
  setupFormHandler();
  setupResourcePreloading();
  setupVisualization();
  
  // Modern UI enhancements
  setupParticleEffects();
  setup3DCardEffects();
  setupCursorEffects();
  
  // Remove loading screen with elegant transition
  setTimeout(() => {
    const loadingScreen = document.querySelector('.loading');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }, 800); // Reduced timeout for faster loading
  
  // Fallback to ensure loading screen is removed
  setTimeout(() => {
    const loadingScreen = document.querySelector('.loading');
    if (loadingScreen && getComputedStyle(loadingScreen).display !== 'none') {
      console.log('Forcing removal of loading screen');
      loadingScreen.style.display = 'none';
    }
  }, 3000);
  
  // Log page performance metrics after loading
  logPerformanceMetrics();
}

// Set up service worker for offline functionality
function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  }
}

// Set up form submission handler with enhanced validation and animation
function setupFormHandler() {
  const form = document.getElementById('assessment-form');
  if (!form) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate form inputs
    const isValid = validateForm();
    if (!isValid) return;
    
    // Animate button to show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitButton.disabled = true;
    
    try {
      // Calculate scores
      const scores = calculateScores();
      
      // Animate transition to results
      await animateToResults(scores);
      
      // Track completion
      trackCompletion(scores);
      
      // After animation completes, show results section
      const resultsSection = document.getElementById('results-section');
      resultsSection.classList.remove('hidden');
      
      // Scroll to results
      resultsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } catch (error) {
      console.error('Error processing assessment:', error);
      
      // Show error message
      showErrorMessage(form, 'An error occurred while processing your assessment. Please try again.');
    } finally {
      // Reset button state
      submitButton.innerHTML = originalButtonText;
      submitButton.disabled = false;
    }
  });
}

// Validate form inputs
function validateForm() {
  // Example validation - in this case we don't need much as it's just sliders
  return true;
}

// Calculate assessment scores based on slider values
function calculateScores() {
  const sliders = document.querySelectorAll('.assessment-slider');
  const scores = {};
  let totalScore = 0;
  
  // Process each dimension
  sliders.forEach(slider => {
    const dimension = slider.getAttribute('data-dimension');
    const value = parseInt(slider.value);
    scores[dimension] = value;
    totalScore += value;
  });
  
  // Calculate average score
  scores.average = parseFloat((totalScore / sliders.length).toFixed(1));
  
  return scores;
}

// Animated transition to results section
async function animateToResults(scores) {
  return new Promise(resolve => {
    // If GSAP is available, use it for smoother animations
    if (typeof gsap !== 'undefined' && window.gsap) {
      try {
        // Create a timeline
        const tl = gsap.timeline({
          onComplete: resolve
        });
        
        // Animate the form to fade out slightly
        tl.to('#assessment-form', {
          opacity: 0.7,
          y: -20,
          duration: 0.5
        });
        
        // Prepare the results section
        const resultsSection = document.getElementById('results-section');
        resultsSection.innerHTML = generateResultsHTML(scores);
        
        // Animate the results section
        tl.to(resultsSection, {
          opacity: 1, 
          y: 0,
          duration: 0.7,
          ease: "power2.out"
        });
      } catch (error) {
        console.warn('GSAP animation error:', error);
        // Fallback if animation fails
        const resultsSection = document.getElementById('results-section');
        resultsSection.innerHTML = generateResultsHTML(scores);
        setTimeout(resolve, 500);
      }
    } else {
      // Fallback for browsers without GSAP
      const resultsSection = document.getElementById('results-section');
      resultsSection.innerHTML = generateResultsHTML(scores);
      setTimeout(resolve, 500);
    }
  });
}

// Generate HTML for results section
function generateResultsHTML(scores) {
  // Get maturity level label based on score
  const maturityLevel = getMaturityLevel(scores.average);
  
  return `
    <div class="container">
      <div class="results-card">
        <h2 class="results-title">Your AI Maturity Assessment</h2>
        
        <div class="results-overview">
          <div class="score-badge">
            <div class="score-inner">
              <div class="score-value">${scores.average}</div>
              <div class="score-label">${maturityLevel}</div>
            </div>
          </div>
          
          <div class="results-message">
            <p>Your organization is at the <strong>${maturityLevel}</strong> stage of AI maturity, scoring ${scores.average} out of 5. This indicates ${getScoreDescription(scores.average)}</p>
          </div>
        </div>
        
        <div class="visualization-section">
          <h3>Dimensional Analysis</h3>
          <div class="chart-container-wrapper">
            <div class="chart-container">
              <canvas id="results-radar-chart"></canvas>
            </div>
          </div>
        </div>
        
        <div class="next-steps-section">
          <h3 class="next-steps-title">Recommended Next Steps</h3>
          <div class="action-cards">
            <div class="action-card">
              <div class="action-icon"><i class="fas fa-book"></i></div>
              <h4 class="action-title">Download Your Custom Roadmap</h4>
              <p class="action-description">Get a personalized implementation plan based on your assessment results.</p>
              <button class="action-button"><i class="fas fa-download"></i> Get Roadmap</button>
            </div>
            <div class="action-card">
              <div class="action-icon"><i class="fas fa-calendar-check"></i></div>
              <h4 class="action-title">Schedule Strategy Session</h4>
              <p class="action-description">Speak with our AI strategy experts to discuss your assessment in detail.</p>
              <button class="action-button"><i class="fas fa-calendar-alt"></i> Book Session</button>
            </div>
            <div class="action-card">
              <div class="action-icon"><i class="fas fa-user-friends"></i></div>
              <h4 class="action-title">Join AI Leadership Network</h4>
              <p class="action-description">Connect with other leaders working on similar AI initiatives.</p>
              <button class="action-button"><i class="fas fa-user-plus"></i> Join Network</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Get maturity level label based on score
function getMaturityLevel(score) {
  if (score < 1.5) return "Initial";
  if (score < 2.5) return "Developing";
  if (score < 3.5) return "Defined";
  if (score < 4.5) return "Advanced";
  return "Leading";
}

// Get description based on score
function getScoreDescription(score) {
  if (score < 1.5) {
    return "your organization is in the early stages of AI adoption with significant opportunity for growth.";
  } else if (score < 2.5) {
    return "your organization has basic AI capabilities but needs more structured approach for scaling.";
  } else if (score < 3.5) {
    return "your organization has established AI practices but can improve consistency and integration.";
  } else if (score < 4.5) {
    return "your organization has mature AI capabilities and is ready to optimize for maximum business impact.";
  } else {
    return "your organization is at the forefront of AI innovation with sophisticated capabilities across all dimensions.";
  }
}

// Track assessment completion
function trackCompletion(scores) {
  // If Google Analytics is available
  if (typeof gtag === 'function') {
    gtag('event', 'complete_assessment', {
      'event_category': 'engagement',
      'event_label': 'ai_maturity',
      'value': Math.round(scores.average * 20), // Convert to 0-100 scale
      'dimensions': JSON.stringify(scores)
    });
  }
}

// Show error message on form
function showErrorMessage(form, message) {
  // Remove any existing error messages
  const existingError = form.querySelector('.form-error');
  if (existingError) {
    existingError.remove();
  }
  
  // Create error element
  const errorElement = document.createElement('div');
  errorElement.className = 'form-error';
  errorElement.textContent = message;
  
  // Add to form
  form.prepend(errorElement);
  
  // Scroll to error
  errorElement.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

// Setup resource preloading for better performance
function setupResourcePreloading() {
  // Preload critical images that will be needed soon
  const preloadImages = [
    // Using existing images instead
    '/img/profile.jpg',
    '/img/data-viz.svg'
  ];
  
  preloadImages.forEach(imageSrc => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageSrc;
    document.head.appendChild(link);
  });
}

// Setup visualization components
function setupVisualization() {
  try {
    console.log("Setting up visualization system...");
    const container = document.querySelector('.chart-container');
    
    // Use the internal AssessmentVisualizationManager class
    if (container) {
      window.visualManager = new AssessmentVisualizationManager({
        container: container
      });
    }
  } catch (error) {
    console.error("Error setting up visualization:", error);
  }
}

// Setup particle background effects
function setupParticleEffects() {
  // Create particle elements for each assessment card if not on a low-powered device
  if (isHighPerformanceDevice()) {
    document.querySelectorAll('.particles-container').forEach(container => {
      // Add randomized particles with staggered animations
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position, size and delay
        const size = Math.random() * 5 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${5 + Math.random() * 5}s`;
        
        container.appendChild(particle);
      }
    });
  }
}

// Check if device is high performance enough for advanced effects
function isHighPerformanceDevice() {
  // Simple heuristic - avoid most mobile devices and check for reduced motion preference
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(navigator.userAgent);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return !isMobile && !prefersReducedMotion;
}

// Setup 3D card hover effects
function setup3DCardEffects() {
  // Initialize 3D card effects
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize floating shapes
    const shapes = document.querySelectorAll('.shape');
    if (shapes.length) {
      shapes.forEach((shape, index) => {
        // Random sizes (smaller than before)
        const size = Math.floor(Math.random() * 150) + 50; // 50-200px
        const color = getRandomColor(0.05); // Lower opacity
        
        // Position them better - not just at the top
        const top = Math.floor(Math.random() * 100); // 0-100%
        const left = Math.floor(Math.random() * 100); // 0-100%
        
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.background = color;
        shape.style.top = `${top}%`;
        shape.style.left = `${left}%`;
        shape.style.animationDelay = `${index * 0.5}s`;
        shape.style.animationDuration = `${Math.random() * 10 + 10}s`; // 10-20s
        
        // Add transform for better spacing
        if (top < 30) {
          shape.style.transform = 'translateY(30%)';
        }
      });
    }
    
    // Random color function
    function getRandomColor(opacity = 0.1) {
      const hue = Math.floor(Math.random() * 360);
      return `hsla(${hue}, 70%, 60%, ${opacity})`;
    }
    
    // 3D card hover effects
    const cards = document.querySelectorAll('.assessment-card, .dimension-container');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  });
}

// Setup cursor effects
function setupCursorEffects() {
  if (!isHighPerformanceDevice()) return;
  
  const cursor = document.querySelector('.cursor-fx');
  if (!cursor) return;
  
  cursor.innerHTML = `
    <div class="cursor-dot"></div>
    <div class="cursor-circle"></div>
  `;
  
  // Style the custom cursor elements
  const style = document.createElement('style');
  style.textContent = `
    .cursor-fx {
      position: fixed;
      left: 0;
      top: 0;
      width: 40px;
      height: 40px;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: difference;
      transition: transform 0.1s ease;
    }
    .cursor-dot {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      background-color: white;
      border-radius: 50%;
    }
    .cursor-circle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.5);
      width: 40px;
      height: 40px;
      border: 2px solid rgba(255,255,255,0.5);
      border-radius: 50%;
      opacity: 0.5;
      transition: all 0.2s ease;
    }
    .cursor-active .cursor-circle {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.9;
      background-color: rgba(110, 89, 242, 0.1);
    }
  `;
  document.head.appendChild(style);
}

// Log performance metrics
function logPerformanceMetrics() {
  if (window.performance) {
    // Use Performance API to measure load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        console.log(`Page load complete: ${pageLoadTime}ms`);
        
        // Track performance in analytics if available
        if (typeof gtag === 'function') {
          gtag('event', 'performance', {
            'event_category': 'timing',
            'event_label': 'page_load',
            'value': pageLoadTime
          });
        }
      }, 0);
    });
  }
}

// VisualizationManager class to handle chart creation and updates
class AssessmentVisualizationManager {
  constructor(config) {
    this.container = config.container;
    this.charts = {};
    this.dependencies = {};
    
    this.initialize();
  }

  async initialize() {
    try {
      await this._loadDependencies();
      this._createCharts();
    } catch (error) {
      this._handleInitializationError(error);
    }
  }

  async _loadDependencies() {
    // Load Chart.js dynamically
    await this._loadChartJs();
  }

  async _loadChartJs() {
    return new Promise((resolve, reject) => {
      if (window.Chart) {
        resolve(window.Chart);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
      script.onload = () => resolve(window.Chart);
      script.onerror = () => reject(new Error('Failed to load Chart.js'));
      document.head.appendChild(script);
    });
  }

  _createCharts() {
    if (!this.container) return;
    
    const ctx = document.createElement('canvas');
    this.container.appendChild(ctx);
    
    this._createRadarChart(ctx);
  }

  _createRadarChart(element) {
    if (!window.Chart) {
      console.error('Chart.js not loaded');
      return;
    }
    
    const labels = window.CLARITY_DIMENSIONS.map(d => d.charAt(0).toUpperCase() + d.slice(1));
    
    this.charts.radar = new Chart(element, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Your Score',
            backgroundColor: window.CLARITY_COLORS.primary + '33',
            borderColor: window.CLARITY_COLORS.primary,
            pointBackgroundColor: window.CLARITY_COLORS.primary,
            data: [0, 0, 0, 0, 0, 0]
          },
          {
            label: 'Industry Benchmark',
            backgroundColor: window.CLARITY_COLORS.benchmark + '33',
            borderColor: window.CLARITY_COLORS.benchmark,
            pointBackgroundColor: window.CLARITY_COLORS.benchmark,
            data: [3.5, 2.8, 3.2, 3.0, 2.5, 2.9]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                family: 'Inter, system-ui, sans-serif'
              }
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 5,
            ticks: {
              display: true,
              color: 'rgba(255, 255, 255, 0.5)',
              backdropColor: 'transparent',
              font: {
                size: 10
              }
            },
            angleLines: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            pointLabels: {
              color: 'rgba(255, 255, 255, 0.8)',
              font: {
                family: 'Inter, system-ui, sans-serif',
                size: 12
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  }

  updateData(datasets) {
    if (!this.charts.radar) return;
    
    this.charts.radar.data.datasets[0].data = datasets;
    this.charts.radar.update();
  }

  _handleInitializationError(error) {
    console.error('Failed to initialize visualization:', error);
    
    // Fallback to simple HTML visualization if chart fails
    if (this.container) {
      this.container.innerHTML = '<p class="error-message">Interactive visualization could not be loaded. Please try refreshing the page.</p>';
    }
  }
}

// When DOM is loaded, initialize assessment functionality
document.addEventListener('DOMContentLoaded', initAssessment);

// Export for module usage
export {
  initAssessment,
  updateVisualization,
  calculateScores
};
