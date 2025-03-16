/**
 * Visualization Manager Component
 * Handles all chart-related functionality with advanced rendering optimizations
 */
export class VisualizationManager {
  #radarChart = null;
  #barChart = null;
  #activeType = 'radar';
  #dimensions = [];
  #colors = {};
  #options = {};
  #userScores = null;
  #benchmarkData = null;
  #isInitialized = false;
  #rafId = null;
  
  /**
   * Creates a new visualization manager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Default configuration
    this.#options = Object.assign({
      radarContainer: null,
      barContainer: null,
      toggleButtons: [],
      dimensions: [],
      colors: {},
      responsive: true,
      animationDuration: 800,
      devicePixelRatio: window.devicePixelRatio || 1
    }, options);
    
    this.#dimensions = this.#options.dimensions;
    this.#colors = this.#options.colors;
    
    // Check if browser and device are capable
    if (!this._checkBrowserCompatibility() || !this._checkDeviceCapabilities()) {
      this._handleInitializationError(new Error('Browser or device not compatible with advanced visualizations'));
      return;
    }
    
    // Initialize visualization
    this.initialize();
  }
  
  /**
   * Initialize the visualization component
   */
  initialize() {
    try {
      // Create loading indicators
      this._createLoadingIndicators();
      
      // Create chart containers
      this._createChartContainer();
      
      // Set up toggle buttons
      this._setupToggleButtons();
      
      // Set up event listeners
      this._setupEventListeners();
      
      // Load Chart.js dynamically or use existing
      this._loadChartJs().then(() => {
        // Create charts with optimized rendering
        this._createCharts();
        
        // Mark as initialized
        this.#isInitialized = true;
        
        // Remove loading indicators
        this._removeLoadingIndicators();
      }).catch(error => {
        this._handleInitializationError(error);
      });
    } catch (error) {
      this._handleInitializationError(error);
    }
  }
  
  /**
   * Checks if the browser supports required features
   * @private
   * @returns {boolean} Whether the browser is compatible
   */
  _checkBrowserCompatibility() {
    // Check for Canvas API support
    const canvas = document.createElement('canvas');
    const isCanvasSupported = !!(canvas.getContext && canvas.getContext('2d'));
    
    // Check for basic ES6 features (Promises, Classes, etc.)
    const basicFeaturesSupported = (
      typeof Promise !== 'undefined' &&
      typeof Map !== 'undefined' &&
      typeof Set !== 'undefined' &&
      typeof Symbol !== 'undefined'
    );
    
    return isCanvasSupported && basicFeaturesSupported;
  }
  
  /**
   * Checks if the device has adequate capabilities
   * @private
   * @returns {boolean} Whether the device is capable
   */
  _checkDeviceCapabilities() {
    // Check for memory constraints - skip complex animations on low-memory devices
    if ('deviceMemory' in navigator) {
      if (navigator.deviceMemory < 2) {
        this.#options.animationDuration = 0;
        return true; // Still return true but with reduced features
      }
    }
    
    // Check screen size - adjust for very small screens
    if (window.innerWidth < 360) {
      this.#options.devicePixelRatio = 1; // Force 1:1 pixel ratio to save memory
    }
    
    return true;
  }
  
  /**
   * Create loading indicators for chart containers
   * @private
   */
  _createLoadingIndicators() {
    const containers = [
      this.#options.radarContainer,
      this.#options.barContainer
    ].filter(Boolean);
    
    containers.forEach(container => {
      if (container && container.querySelector('.chart-loading') === null) {
        container.innerHTML = `
          <div class="chart-loading">
            <div class="chart-spinner"></div>
            <div class="loading-text">Preparing visualization...</div>
          </div>
        `;
      }
    });
  }
  
  /**
   * Remove loading indicators
   * @private
   */
  _removeLoadingIndicators() {
    const loadingElements = document.querySelectorAll('.chart-loading');
    loadingElements.forEach(element => {
      element.classList.add('fade-out');
      setTimeout(() => element.remove(), 300);
    });
  }
  
  /**
   * Creates chart containers and validates them
   * @private
   */
  _createChartContainer() {
    const containers = [
      this.#options.radarContainer,
      this.#options.barContainer
    ].filter(Boolean);
    
    containers.forEach(container => {
      // Clear container
      if (container.querySelector('.chart-loading') === null) {
        container.innerHTML = '';
      }
      
      // Create and append canvas
      const canvas = document.createElement('canvas');
      canvas.width = container.clientWidth * this.#options.devicePixelRatio;
      canvas.height = container.clientHeight * this.#options.devicePixelRatio;
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${container.clientHeight}px`;
      
      // Apply optimized rendering context attributes
      canvas.getContext('2d', {
        alpha: true,
        desynchronized: true, // Potential performance boost
        willReadFrequently: false
      });
      
      // Add canvas to container (without removing loading first)
      if (container.querySelector('canvas') === null) {
        container.appendChild(canvas);
      }
    });
  }
  
  /**
   * Set up toggle buttons for switching chart types
   * @private
   */
  _setupToggleButtons() {
    const toggleButtons = this.#options.toggleButtons;
    if (!toggleButtons || toggleButtons.length === 0) return;
    
    toggleButtons.forEach(button => {
      const chartType = button.dataset.chartType;
      
      // Set initial active state
      if (chartType === this.#activeType) {
        button.classList.add('active');
      }
      
      button.addEventListener('click', () => {
        // Skip if already active
        if (chartType === this.#activeType) return;
        
        // Update active button styling
        toggleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Switch chart type
        this.switchChartType(chartType);
        
        // Track event
        if (window.trackEvent) {
          window.trackEvent('visualization', 'switch_chart_type', chartType);
        }
      });
    });
  }
  
  /**
   * Set up event listeners (resize, etc.)
   * @private
   */
  _setupEventListeners() {
    if (this.#options.responsive) {
      // Debounced resize handler
      const debouncedResize = this._debounce(this._handleResize.bind(this), 250);
      window.addEventListener('resize', debouncedResize);
      
      // Screen orientation change
      if ('orientation' in screen) {
        screen.orientation.addEventListener('change', debouncedResize);
      } else if ('onorientationchange' in window) {
        window.addEventListener('orientationchange', debouncedResize);
      }
    }
    
    // Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Redraw charts if they exist and the page becomes visible
        if (this.#isInitialized && (this.#radarChart || this.#barChart)) {
          this._refreshActiveChart();
        }
      }
    });
    
    // Handle network status changes
    window.addEventListener('online', () => {
      // Maybe reload font assets or external resources when connection restored
      if (this.#isInitialized) {
        setTimeout(() => this._refreshActiveChart(), 1000);
      }
    });
  }
  
  /**
   * Handles window resize events
   * @private
   */
  _handleResize() {
    // Cancel any pending animation frame
    if (this.#rafId) {
      cancelAnimationFrame(this.#rafId);
    }
    
    // Use requestAnimationFrame for performance
    this.#rafId = requestAnimationFrame(() => {
      if (!this.#isInitialized) return;
      
      const activeContainer = this.#activeType === 'radar' 
        ? this.#options.radarContainer 
        : this.#options.barContainer;
      
      if (!activeContainer) return;
      
      // Get the canvas element
      const canvas = activeContainer.querySelector('canvas');
      if (!canvas) return;
      
      // Update canvas dimensions
      const containerWidth = activeContainer.clientWidth;
      const containerHeight = activeContainer.clientHeight;
      
      canvas.width = containerWidth * this.#options.devicePixelRatio;
      canvas.height = containerHeight * this.#options.devicePixelRatio;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;
      
      // Update charts
      this._refreshActiveChart();
    });
  }
  
  /**
   * Loads Chart.js if it's not already available
   * @private
   * @returns {Promise} Resolves when Chart.js is loaded
   */
  _loadChartJs() {
    return new Promise((resolve, reject) => {
      // If Chart is already loaded, resolve immediately
      if (typeof Chart !== 'undefined') {
        resolve();
        return;
      }
      
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
      script.integrity = 'sha384-7NrRHqlw8l9da09AEJ4UJyF+ZWtS7mJP6aHNiV68lSPCjBbHtLdCndlJ3656+JsB';
      script.crossOrigin = 'anonymous';
      
      // Set callbacks
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Chart.js'));
      
      // Add script to document
      document.head.appendChild(script);
    });
  }
  
  /**
   * Creates radar and bar charts
   * @private
   */
  _createCharts() {
    if (typeof Chart === 'undefined') {
      this._handleInitializationError(new Error('Chart.js not available'));
      return;
    }
    
    // Register Chart.js plugins if needed
    if (Chart.registry.plugins.get('datalabels') === undefined) {
      // Optional: Add datalabels plugin when needed
    }
    
    try {
      // Create radar chart if container exists
      if (this.#options.radarContainer) {
        const radarCanvas = this.#options.radarContainer.querySelector('canvas');
        if (radarCanvas) {
          const radarCtx = radarCanvas.getContext('2d');
          const radarConfig = this._getRadarChartConfig();
          this.#radarChart = new Chart(radarCtx, radarConfig);
        }
      }
      
      // Create bar chart if container exists
      if (this.#options.barContainer) {
        const barCanvas = this.#options.barContainer.querySelector('canvas');
        if (barCanvas) {
          const barCtx = barCanvas.getContext('2d');
          const barConfig = this._getBarChartConfig();
          this.#barChart = new Chart(barCtx, barConfig);
        }
      }
      
      // Show the active chart type
      this._showActiveChart();
    } catch (error) {
      this._handleInitializationError(error);
    }
  }
  
  /**
   * Get configuration for radar chart
   * @private
   * @returns {Object} Chart configuration
   */
  _getRadarChartConfig() {
    // Placeholder data until real data is provided
    const placeholderData = {};
    this.#dimensions.forEach(dim => placeholderData[dim] = 0);
    
    return {
      type: 'radar',
      data: {
        labels: this.#dimensions.map(dim => dim.charAt(0).toUpperCase() + dim.slice(1)),
        datasets: [
          {
            label: 'Your Organization',
            backgroundColor: this._hexToRgba(this.#colors.primary, 0.2),
            borderColor: this.#colors.primary,
            borderWidth: 2,
            pointBackgroundColor: this.#colors.primary,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: this.#colors.primary,
            pointRadius: 4,
            pointHoverRadius: 6,
            data: this.#dimensions.map(dim => this.#userScores ? this.#userScores[dim] : 0)
          },
          {
            label: 'Industry Benchmark',
            backgroundColor: this._hexToRgba(this.#colors.benchmark, 0.2),
            borderColor: this.#colors.benchmark,
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: this.#colors.benchmark,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: this.#colors.benchmark,
            pointRadius: 4,
            pointHoverRadius: 6,
            data: this.#dimensions.map(dim => this.#benchmarkData ? this.#benchmarkData[dim] : 0)
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: this.#options.devicePixelRatio,
        animation: {
          duration: this.#options.animationDuration,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#e0e0e0',
              font: {
                family: "'Inter', sans-serif",
                size: 12
              },
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              family: "'Inter', sans-serif",
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              family: "'Inter', sans-serif",
              size: 13
            },
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                return `${label}: ${context.raw}/10`;
              }
            }
          }
        },
        scales: {
          r: {
            angleLines: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            pointLabels: {
              color: '#e0e0e0',
              font: {
                family: "'Inter', sans-serif",
                size: function(context) {
                  const width = context.chart.width;
                  return width < 400 ? 10 : width < 600 ? 12 : 14;
                }
              }
            },
            ticks: {
              backdropColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.6)',
              font: {
                family: "'Inter', sans-serif",
                size: 10
              },
              showLabelBackdrop: false,
              stepSize: 2,
              max: 10,
              min: 0
            }
          }
        }
      }
    };
  }
  
  /**
   * Get configuration for bar chart
   * @private
   * @returns {Object} Chart configuration
   */
  _getBarChartConfig() {
    return {
      type: 'bar',
      data: {
        labels: this.#dimensions.map(dim => dim.charAt(0).toUpperCase() + dim.slice(1)),
        datasets: [
          {
            label: 'Your Organization',
            backgroundColor: this.#colors.primary,
            borderColor: this.#colors.primary,
            borderWidth: 1,
            borderRadius: 4,
            data: this.#dimensions.map(dim => this.#userScores ? this.#userScores[dim] : 0)
          },
          {
            label: 'Industry Benchmark',
            backgroundColor: this.#colors.benchmark,
            borderColor: this.#colors.benchmark,
            borderWidth: 1,
            borderRadius: 4,
            data: this.#dimensions.map(dim => this.#benchmarkData ? this.#benchmarkData[dim] : 0)
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: this.#options.devicePixelRatio,
        animation: {
          duration: this.#options.animationDuration,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#e0e0e0',
              font: {
                family: "'Inter', sans-serif",
                size: 12
              },
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              family: "'Inter', sans-serif",
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              family: "'Inter', sans-serif",
              size: 13
            },
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                return `${label}: ${context.raw}/10`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#e0e0e0',
              font: {
                family: "'Inter', sans-serif",
                size: function(context) {
                  const width = context.chart.width;
                  return width < 400 ? 10 : width < 600 ? 12 : 14;
                }
              },
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#e0e0e0',
              font: {
                family: "'Inter', sans-serif",
                size: 12
              },
              stepSize: 2,
              max: 10,
              min: 0
            }
          }
        },
        layout: {
          padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
          }
        }
      }
    };
  }
  
  /**
   * Switches between chart types
   * @param {string} type - The chart type to switch to ('radar' or 'bar')
   */
  switchChartType(type) {
    if (type !== 'radar' && type !== 'bar') return;
    
    // Update active type
    this.#activeType = type;
    
    // Show the active chart
    this._showActiveChart();
  }
  
  /**
   * Shows the active chart and hides the inactive one
   * @private
   */
  _showActiveChart() {
    // Show/hide radar container
    if (this.#options.radarContainer) {
      this.#options.radarContainer.style.display = 
        this.#activeType === 'radar' ? 'block' : 'none';
    }
    
    // Show/hide bar container
    if (this.#options.barContainer) {
      this.#options.barContainer.style.display = 
        this.#activeType === 'bar' ? 'block' : 'none';
    }
    
    // Refresh the active chart to ensure proper rendering
    this._refreshActiveChart();
  }
  
  /**
   * Refreshes the currently active chart
   * @private
   */
  _refreshActiveChart() {
    const activeChart = this.#activeType === 'radar' ? this.#radarChart : this.#barChart;
    
    if (activeChart) {
      // Update and re-render
      activeChart.update();
    }
  }
  
  /**
   * Updates chart data with new scores
   * @param {Object} userScores - User assessment scores
   * @param {Object} benchmarkData - Benchmark data for comparison
   */
  updateCharts(userScores, benchmarkData) {
    if (!this.#isInitialized) {
      console.warn('Cannot update charts before initialization');
      return;
    }
    
    // Store the data
    this.#userScores = userScores;
    this.#benchmarkData = benchmarkData;
    
    // Update radar chart if it exists
    if (this.#radarChart) {
      this.#radarChart.data.datasets[0].data = 
        this.#dimensions.map(dim => userScores[dim] || 0);
      
      this.#radarChart.data.datasets[1].data = 
        this.#dimensions.map(dim => benchmarkData[dim] || 0);
      
      this.#radarChart.update();
    }
    
    // Update bar chart if it exists
    if (this.#barChart) {
      this.#barChart.data.datasets[0].data = 
        this.#dimensions.map(dim => userScores[dim] || 0);
      
      this.#barChart.data.datasets[1].data = 
        this.#dimensions.map(dim => benchmarkData[dim] || 0);
      
      this.#barChart.update();
    }
  }
  
  /**
   * Handles errors during initialization
   * @private
   * @param {Error} error - The error that occurred
   */
  _handleInitializationError(error) {
    console.error('Visualization initialization error:', error);
    
    // Display error message in containers
    const containers = [
      this.#options.radarContainer,
      this.#options.barContainer
    ].filter(Boolean);
    
    containers.forEach(container => {
      container.innerHTML = `
        <div class="chart-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>We're having trouble showing this visualization.</p>
          <button class="retry-button">Retry</button>
        </div>
      `;
      
      // Add retry functionality
      const retryButton = container.querySelector('.retry-button');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          // Clear container
          container.innerHTML = '';
          
          // Try to reinitialize
          this.initialize();
        });
      }
    });
    
    // Track error
    if (window.trackEvent) {
      window.trackEvent('error', 'visualization_error', error.message);
    }
  }
  
  /**
   * Exports the current chart as an image
   */
  exportChart() {
    const activeChart = this.#activeType === 'radar' ? this.#radarChart : this.#barChart;
    
    if (!activeChart) {
      console.warn('No chart available to export');
      return;
    }
    
    try {
      // Get canvas
      const canvas = activeChart.canvas;
      
      // Create a temporary canvas with white background for better printing
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      const ctx = tempCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.drawImage(canvas, 0, 0);
      
      // Add watermark/branding
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('AI Maturity Assessment', tempCanvas.width - 20, tempCanvas.height - 20);
      
      // Convert to image
      const image = tempCanvas.toDataURL('image/png');
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = image;
      downloadLink.download = 'ai-maturity-assessment.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Track event
      if (window.trackEvent) {
        window.trackEvent('visualization', 'export_chart', this.#activeType);
      }
    } catch (error) {
      console.error('Error exporting chart:', error);
      
      // Track error
      if (window.trackEvent) {
        window.trackEvent('error', 'export_chart_error', error.message);
      }
    }
  }
  
  /**
   * Converts a hex color to rgba
   * @private
   * @param {string} hex - Hex color code
   * @param {number} alpha - Alpha value (0-1)
   * @returns {string} RGBA color string
   */
  _hexToRgba(hex, alpha) {
    if (!hex) return `rgba(0, 0, 0, ${alpha})`;
    
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  /**
   * Debounce helper function
   * @private
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  _debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
  
  /**
   * Cleans up resources and event listeners
   */
  destroy() {
    // Cleanup charts
    if (this.#radarChart) {
      this.#radarChart.destroy();
      this.#radarChart = null;
    }
    
    if (this.#barChart) {
      this.#barChart.destroy();
      this.#barChart = null;
    }
    
    // Cancel any pending animation frame
    if (this.#rafId) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this._handleResize);
    
    if ('orientation' in screen) {
      screen.orientation.removeEventListener('change', this._handleResize);
    } else if ('onorientationchange' in window) {
      window.removeEventListener('orientationchange', this._handleResize);
    }
    
    // Mark as not initialized
    this.#isInitialized = false;
  }
}