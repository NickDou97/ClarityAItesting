/**
 * Visualization Components using Chart.js
 * Includes RadarChart and BarChart visualizations with toggle capability
 */

/**
 * RadarChart Class - Creates and manages a radar chart visualization
 */
class RadarChart {
  /**
   * Initialize a new radar chart
   * @param {string} containerId - ID of the container element
   * @param {Object} config - Configuration options
   */
  constructor(containerId, config = {}) {
    // Get the canvas element
    this.canvas = document.getElementById(containerId);
    if (!this.canvas) {
      console.error(`Canvas element with ID "${containerId}" not found`);
      return;
    }
    
    // Store chart data
    this.data = [];
    this.labels = [];
    this.type = 'radar';
    
    // Default configuration
    this.config = {
      maxValue: 5,
      levels: 5,
      labelOffset: 1.2,
      colors: ['rgba(110, 89, 242, 0.8)', 'rgba(255, 155, 80, 0.7)'],
      dimensions: [],
      legendLabels: ['Your Organization', 'Industry Benchmark'],
      tooltips: true,
      responsive: true,
      maintainAspectRatio: false, // Changed to false to prevent sizing restrictions
      animation: {
        duration: 500,
        easing: 'easeOutQuart'
      },
      ...config
    };
    
    // Initialize chart
    this.initChart();
  }
  
  /**
   * Initialize the Chart.js radar chart
   */
  initChart() {
    try {
      // Define chart context
      const ctx = this.canvas.getContext('2d');
      
      // Initialize empty chart with placeholder data
      this.chart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: this.config.dimensions,
          datasets: [{
            label: this.config.legendLabels[0],
            data: new Array(this.config.dimensions.length).fill(0),
            fill: true,
            backgroundColor: this.hexToRgba(this.config.colors[0], 0.2),
            borderColor: this.config.colors[0],
            pointBackgroundColor: this.config.colors[0],
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: this.config.colors[0],
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: this.getChartOptions()
      });
    } catch (error) {
      console.error('Error initializing radar chart:', error);
    }
  }
  
  /**
   * Get Chart.js configuration options
   * @returns {Object} Chart.js options
   */
  getChartOptions() {
    return {
      scales: {
        r: {
          angleLines: {
            display: true,
            color: 'rgba(255, 255, 255, 0.15)' // Improved visibility
          },
          grid: {
            display: true,
            color: 'rgba(255, 255, 255, 0.15)' // Improved visibility
          },
          pointLabels: {
            color: 'rgba(255, 255, 255, 0.9)',
            font: {
              family: "'Inter', sans-serif",
              size: 14, // Increased from 12
              weight: '600'
            },
            padding: 10 // Added padding to prevent cutoff
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)', // Improved visibility
            backdropColor: 'transparent',
            stepSize: 1,
            font: {
              size: 10
            },
            z: 2,
            count: this.config.maxValue,
            display: true // Ensure ticks are displayed
          },
          suggestedMin: 0,
          suggestedMax: this.config.maxValue,
          beginAtZero: true // Ensure chart starts from 0
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          align: 'center',
          labels: {
            color: 'rgba(255, 255, 255, 0.9)', // Improved visibility
            font: {
              family: "'Inter', sans-serif",
              size: 12
            },
            boxWidth: 15,
            padding: 20 // Increased padding
          }
        },
        tooltip: {
          enabled: this.config.tooltips,
          backgroundColor: 'rgba(20, 20, 30, 0.9)',
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
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            title: (items) => {
              return this.config.dimensions[items[0].dataIndex];
            },
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.raw || 0;
              return `${label}: ${value}`;
            }
          }
        }
      },
      responsive: this.config.responsive,
      maintainAspectRatio: this.config.maintainAspectRatio,
      animation: this.config.animation,
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10
        }
      }
    };
  }
  
  /**
   * Set data for the radar chart
   * @param {Array} datasets - Array of data arrays
   * @param {Array} labels - Optional array of labels for datasets
   */
  setData(datasets, labels = null) {
    try {
      if (!this.chart) {
        console.error('Chart not initialized');
        return;
      }
      
      // Store data internally
      this.data = datasets;
      if (labels) {
        this.labels = labels;
      }
      
      // Update chart datasets
      this.chart.data.datasets = datasets.map((data, i) => {
        const color = this.config.colors[i] || this.getRandomColor();
        const label = (labels && labels[i]) ? labels[i] : this.config.legendLabels[i] || `Dataset ${i+1}`;
        
        return {
          label: label,
          data: data,
          fill: true,
          backgroundColor: this.hexToRgba(color, i === 0 ? 0.3 : 0.2), // Slightly more opaque for first dataset
          borderColor: color,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: color,
          pointRadius: 5, // Increased from 4
          pointHoverRadius: 7, // Increased from 6
          borderWidth: 2
        };
      });
      
      // Force redraw by resetting chart size
      setTimeout(() => {
        if (this.chart) {
          const parent = this.canvas.parentElement;
          if (parent) {
            this.chart.resize();
          }
          // Update the chart
          this.chart.update();
          
          // Add pulse animation class
          this.canvas.classList.add('radar-pulse');
          setTimeout(() => {
            this.canvas.classList.remove('radar-pulse');
          }, 500);
        }
      }, 50);
      
    } catch (error) {
      console.error('Error setting radar chart data:', error);
    }
  }
  
  /**
   * Update the chart configuration
   * @param {Object} config - New configuration options
   */
  updateConfig(config) {
    try {
      // Update config
      this.config = {
        ...this.config,
        ...config
      };
      
      // Update chart options
      if (this.chart) {
        this.chart.options = this.getChartOptions();
        
        // Update dimensions if provided
        if (config.dimensions) {
          this.chart.data.labels = config.dimensions;
        }
        
        // Update the chart
        this.chart.update();
      }
    } catch (error) {
      console.error('Error updating radar chart config:', error);
    }
  }
  
  /**
   * Show this chart and hide others
   */
  show() {
    if (this.canvas) {
      this.canvas.style.display = 'block';
      // Ensure chart is properly sized when shown
      if (this.chart) {
        setTimeout(() => this.chart.resize(), 10);
      }
    }
  }
  
  /**
   * Hide this chart
   */
  hide() {
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
  }
  
  /**
   * Export the radar chart to a PNG image
   * @param {string} filename - Optional filename for the download
   */
  exportToPNG(filename = 'ai-maturity-assessment') {
    try {
      if (!this.chart) {
        console.error('Chart not initialized');
        return;
      }
      
      // Set a temporary scale for better export quality
      const originalDevicePixelRatio = window.devicePixelRatio;
      window.devicePixelRatio = 2;
      
      // Force resize to apply new pixel ratio
      this.chart.resize();
      
      // Create exportable chart with white background
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = this.canvas.width;
      exportCanvas.height = this.canvas.height;
      const exportCtx = exportCanvas.getContext('2d');
      
      // Draw white background
      exportCtx.fillStyle = '#FFFFFF';
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      // Create temporary chart for export with darker colors for better visibility on white
      const tempConfig = JSON.parse(JSON.stringify(this.chart.config));
      
      // Update scale colors for better visibility on white
      tempConfig.options.scales.r.angleLines.color = 'rgba(0, 0, 0, 0.2)';
      tempConfig.options.scales.r.grid.color = 'rgba(0, 0, 0, 0.2)';
      tempConfig.options.scales.r.pointLabels.color = 'rgba(0, 0, 0, 0.9)';
      tempConfig.options.scales.r.ticks.color = 'rgba(0, 0, 0, 0.6)';
      
      // Update legend colors
      tempConfig.options.plugins.legend.labels.color = 'rgba(0, 0, 0, 0.8)';
      
      // Create temporary chart
      const tempChart = new Chart(exportCtx, tempConfig);
      
      // Generate download link
      setTimeout(() => {
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
        
        // Clean up
        tempChart.destroy();
        
        // Restore original device pixel ratio
        window.devicePixelRatio = originalDevicePixelRatio;
        
        // Force resize to restore original size
        if (this.chart) {
          this.chart.resize();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error exporting radar chart:', error);
      
      // Fallback to html2canvas if available
      if (typeof html2canvas === 'function') {
        console.log('Falling back to html2canvas for export');
        this.exportUsingHtml2Canvas(filename);
      }
    }
  }
  
  /**
   * Fallback export method using html2canvas
   * @param {string} filename - Filename for the download
   */
  exportUsingHtml2Canvas(filename) {
    try {
      if (!this.canvas) return;
      
      // Get parent container for better styling
      const container = this.canvas.parentElement;
      
      html2canvas(container, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        logging: false
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    } catch (error) {
      console.error('Error with fallback export:', error);
      alert('Unable to export chart. Please try again later.');
    }
  }
  
  /**
   * Destroy the chart instance
   */
  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
  
  /**
   * Utility method to get a random color
   * @returns {string} Random hex color
   */
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  /**
   * Utility method to convert hex to rgba
   * @param {string} hex - Hex color code
   * @param {number} alpha - Alpha value
   * @returns {string} RGBA color string
   */
  hexToRgba(hex, alpha = 1) {
    // Default fallback color
    if (!hex) return `rgba(110, 89, 242, ${alpha})`;
    
    // Handle rgba input
    if (hex.startsWith('rgba')) return hex;
    
    // Handle rgb input
    if (hex.startsWith('rgb(')) {
      const rgb = hex.match(/\d+/g);
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    }
    
    // Convert hex to rgba
    let r = 0, g = 0, b = 0;
    
    // 3 digits
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    }
    // 6 digits
    else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

/**
 * BarChart Class - Creates and manages a bar chart visualization
 * for displaying assessment results as an alternative to radar chart
 */
class BarChart {
  /**
   * Initialize a new bar chart
   * @param {string} containerId - ID of the container element
   * @param {Object} config - Configuration options
   */
  constructor(containerId, config = {}) {
    // Get the canvas element
    this.canvas = document.getElementById(containerId);
    if (!this.canvas) {
      console.error(`Canvas element with ID "${containerId}" not found`);
      return;
    }
    
    // Store chart data
    this.data = [];
    this.labels = [];
    this.type = 'bar';
    
    // Default configuration
    this.config = {
      maxValue: 5,
      colors: ['rgba(110, 89, 242, 0.8)', 'rgba(255, 155, 80, 0.7)'],
      dimensions: [],
      legendLabels: ['Your Organization', 'Industry Benchmark'],
      tooltips: true,
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500,
        easing: 'easeOutQuart'
      },
      ...config
    };
    
    // Hide by default if specified
    if (config.hidden) {
      this.hide();
    }
    
    // Initialize chart
    this.initChart();
  }
  
  /**
   * Initialize the Chart.js bar chart
   */
  initChart() {
    try {
      // Define chart context
      const ctx = this.canvas.getContext('2d');
      
      // Initialize empty chart with placeholder data
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.config.dimensions,
          datasets: [{
            label: this.config.legendLabels[0],
            data: new Array(this.config.dimensions.length).fill(0),
            backgroundColor: this.config.colors[0],
            borderColor: this.config.colors[0],
            borderWidth: 1
          }]
        },
        options: this.getChartOptions()
      });
    } catch (error) {
      console.error('Error initializing bar chart:', error);
    }
  }
  
  /**
   * Get Chart.js configuration options for bar chart
   * @returns {Object} Chart.js options
   */
  getChartOptions() {
    return {
      indexAxis: 'y', // Horizontal bar chart
      scales: {
        x: {
          beginAtZero: true,
          max: this.config.maxValue,
          ticks: {
            stepSize: 1,
            color: 'rgba(255, 255, 255, 0.7)'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.15)'
          }
        },
        y: {
          ticks: {
            color: 'rgba(255, 255, 255, 0.9)',
            font: {
              family: "'Inter', sans-serif",
              size: 12,
              weight: '600'
            }
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          align: 'center',
          labels: {
            color: 'rgba(255, 255, 255, 0.9)',
            font: {
              family: "'Inter', sans-serif",
              size: 12
            },
            boxWidth: 15,
            padding: 20
          }
        },
        tooltip: {
          enabled: this.config.tooltips,
          backgroundColor: 'rgba(20, 20, 30, 0.9)',
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
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            title: (items) => {
              return this.config.dimensions[items[0].dataIndex];
            },
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.raw || 0;
              return `${label}: ${value}`;
            }
          }
        }
      },
      responsive: this.config.responsive,
      maintainAspectRatio: this.config.maintainAspectRatio,
      animation: this.config.animation,
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 20
        }
      }
    };
  }
  
  /**
   * Set data for the bar chart
   * @param {Array} datasets - Array of data arrays
   * @param {Array} labels - Optional array of labels for datasets
   */
  setData(datasets, labels = null) {
    try {
      if (!this.chart) {
        console.error('Chart not initialized');
        return;
      }
      
      // Store data internally
      this.data = datasets;
      if (labels) {
        this.labels = labels;
      }
      
      // Update chart datasets
      this.chart.data.datasets = datasets.map((data, i) => {
        const color = this.config.colors[i] || this.getRandomColor();
        const label = (labels && labels[i]) ? labels[i] : this.config.legendLabels[i] || `Dataset ${i+1}`;
        
        return {
          label: label,
          data: data,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.8,
          categoryPercentage: 0.7
        };
      });
      
      // Update the chart
      this.chart.update();
      
      // Add pulse animation
      this.canvas.classList.add('chart-pulse');
      setTimeout(() => {
        this.canvas.classList.remove('chart-pulse');
      }, 500);
      
    } catch (error) {
      console.error('Error setting bar chart data:', error);
    }
  }
  
  /**
   * Update the chart configuration
   * @param {Object} config - New configuration options
   */
  updateConfig(config) {
    try {
      // Update config
      this.config = {
        ...this.config,
        ...config
      };
      
      // Update chart options
      if (this.chart) {
        this.chart.options = this.getChartOptions();
        
        // Update dimensions if provided
        if (config.dimensions) {
          this.chart.data.labels = config.dimensions;
        }
        
        // Update the chart
        this.chart.update();
      }
    } catch (error) {
      console.error('Error updating bar chart config:', error);
    }
  }
  
  /**
   * Show this chart and hide others
   */
  show() {
    if (this.canvas) {
      this.canvas.style.display = 'block';
      // Ensure chart is properly sized when shown
      if (this.chart) {
        setTimeout(() => this.chart.resize(), 10);
      }
    }
  }
  
  /**
   * Hide this chart
   */
  hide() {
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
  }
  
  /**
   * Export the bar chart to a PNG image
   * @param {string} filename - Optional filename for the download
   */
  exportToPNG(filename = 'ai-maturity-assessment-bar') {
    try {
      if (!this.chart) {
        console.error('Chart not initialized');
        return;
      }
      
      // Set a temporary scale for better export quality
      const originalDevicePixelRatio = window.devicePixelRatio;
      window.devicePixelRatio = 2;
      
      // Force resize to apply new pixel ratio
      this.chart.resize();
      
      // Create exportable chart with white background
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = this.canvas.width;
      exportCanvas.height = this.canvas.height;
      const exportCtx = exportCanvas.getContext('2d');
      
      // Draw white background
      exportCtx.fillStyle = '#FFFFFF';
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      // Create temporary chart for export with darker colors for better visibility on white
      const tempConfig = JSON.parse(JSON.stringify(this.chart.config));
      
      // Update scale colors for better visibility on white
      tempConfig.options.scales.x.grid.color = 'rgba(0, 0, 0, 0.1)';
      tempConfig.options.scales.x.ticks.color = 'rgba(0, 0, 0, 0.7)';
      tempConfig.options.scales.y.ticks.color = 'rgba(0, 0, 0, 0.9)';
      
      // Update legend colors
      tempConfig.options.plugins.legend.labels.color = 'rgba(0, 0, 0, 0.8)';
      
      // Create temporary chart
      const tempChart = new Chart(exportCtx, tempConfig);
      
      // Generate download link
      setTimeout(() => {
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
        
        // Clean up
        tempChart.destroy();
        
        // Restore original device pixel ratio
        window.devicePixelRatio = originalDevicePixelRatio;
        
        // Force resize to restore original size
        if (this.chart) {
          this.chart.resize();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error exporting bar chart:', error);
      
      // Fallback to html2canvas if available
      if (typeof html2canvas === 'function') {
        console.log('Falling back to html2canvas for export');
        this.exportUsingHtml2Canvas(filename);
      }
    }
  }
  
  /**
   * Fallback export method using html2canvas
   * @param {string} filename - Filename for the download
   */
  exportUsingHtml2Canvas(filename) {
    try {
      if (!this.canvas) return;
      
      // Get parent container for better styling
      const container = this.canvas.parentElement;
      
      html2canvas(container, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        logging: false
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    } catch (error) {
      console.error('Error with fallback export:', error);
      alert('Unable to export chart. Please try again later.');
    }
  }
  
  /**
   * Destroy the chart instance
   */
  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
  
  /**
   * Utility method to get a random color
   * @returns {string} Random hex color
   */
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

/**
 * VisualizationManager - Manages multiple chart types and toggling between them
 */
class VisualizationManager {
  /**
   * Initialize visualization manager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      radarId: 'radar-chart',
      barId: 'bar-chart',
      toggleId: 'chart-toggle',
      dimensions: [],
      colors: ['rgba(110, 89, 242, 0.8)', 'rgba(255, 155, 80, 0.7)'],
      isMobile: window.innerWidth < 768,
      ...options
    };
    
    this.charts = {};
    this.activeChart = this.options.isMobile ? 'bar' : 'radar';
    
    this.init();
  }
  
  /**
   * Initialize charts and toggle UI
   */
  init() {
    // Initialize radar chart
    if (document.getElementById(this.options.radarId)) {
      this.charts.radar = new RadarChart(this.options.radarId, {
        dimensions: this.options.dimensions,
        colors: this.options.colors,
        hidden: this.activeChart !== 'radar'
      });
    }
    
    // Initialize bar chart
    if (document.getElementById(this.options.barId)) {
      this.charts.bar = new BarChart(this.options.barId, {
        dimensions: this.options.dimensions,
        colors: this.options.colors,
        hidden: this.activeChart !== 'bar'
      });
    }
    
    // Initialize toggle button
    this.initToggle();
    
    // Show active chart
    this.showChart(this.activeChart);
    
    // Add resize handler for responsive behavior
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  /**
   * Initialize toggle UI
   */
  initToggle() {
    const toggleBtn = document.getElementById(this.options.toggleId);
    
    if (toggleBtn) {
      // Set initial state
      toggleBtn.setAttribute('aria-pressed', this.activeChart === 'bar');
      toggleBtn.setAttribute('aria-label', `Switch to ${this.activeChart === 'radar' ? 'bar' : 'radar'} chart`);
      
      // Add click handler
      toggleBtn.addEventListener('click', () => {
        const newType = this.activeChart === 'radar' ? 'bar' : 'radar';
        this.showChart(newType);
        
        // Update button state
        toggleBtn.setAttribute('aria-pressed', newType === 'bar');
        toggleBtn.setAttribute('aria-label', `Switch to ${newType === 'radar' ? 'bar' : 'radar'} chart`);
        
        // Track toggle event
        if (typeof gtag === 'function') {
          gtag('event', 'toggle_chart_type', {
            'event_category': 'engagement',
            'event_label': newType
          });
        }
      });
    }
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    const wasMobile = this.options.isMobile;
    this.options.isMobile = window.innerWidth < 768;
    
    // If switching between mobile and desktop, update active chart
    if (wasMobile !== this.options.isMobile) {
      const preferredChart = this.options.isMobile ? 'bar' : 'radar';
      this.showChart(preferredChart);
      
      // Update toggle button
      const toggleBtn = document.getElementById(this.options.toggleId);
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-pressed', preferredChart === 'bar');
        toggleBtn.setAttribute('aria-label', `Switch to ${preferredChart === 'radar' ? 'bar' : 'radar'} chart`);
      }
    }
    
    // Resize visible chart
    if (this.charts[this.activeChart] && this.charts[this.activeChart].chart) {
      this.charts[this.activeChart].chart.resize();
    }
  }
  
  /**
   * Show specified chart type and hide others
   * @param {string} type - Chart type to show ('radar' or 'bar')
   */
  showChart(type) {
    if (!this.charts[type]) {
      console.error(`Chart type "${type}" not initialized`);
      return;
    }
    
    // Hide all charts
    Object.values(this.charts).forEach(chart => chart.hide());
    
    // Show specified chart
    this.charts[type].show();
    
    // Update active chart
    this.activeChart = type;
  }
  
  /**
   * Update data for all charts
   * @param {Array} datasets - Data arrays
   * @param {Array} labels - Optional labels for datasets
   */
  updateData(datasets, labels = null) {
    Object.values(this.charts).forEach(chart => {
      chart.setData(datasets, labels);
    });
  }
  
  /**
   * Export active chart as PNG
   * @param {string} filename - Optional filename
   */
  exportToPNG(filename) {
    if (this.charts[this.activeChart]) {
      this.charts[this.activeChart].exportToPNG(filename);
    }
  }
  
  /**
   * Clean up and destroy charts
   */
  destroy() {
    Object.values(this.charts).forEach(chart => {
      chart.destroy();
    });
    
    // Remove resize handler
    window.removeEventListener('resize', this.handleResize);
  }
}

// Make charts available both as module exports and global variables
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS/Node.js environment
  module.exports = {
    RadarChart,
    BarChart,
    VisualizationManager
  };
} else if (typeof define === 'function' && define.amd) {
  // AMD/RequireJS environment
  define([], function() {
    return {
      RadarChart,
      BarChart,
      VisualizationManager
    };
  });
} else {
  // Browser environment
  window.RadarChart = RadarChart;
  window.BarChart = BarChart;
  window.VisualizationManager = VisualizationManager;
}

// ES6 module export
export { RadarChart, BarChart, VisualizationManager };
export default VisualizationManager; 