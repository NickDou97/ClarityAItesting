/**
 * SVG Radar Chart
 * A custom SVG-based radar chart implementation optimized for assessment visualization
 */

class SVGRadarChart {
  /**
   * Create a new SVG Radar Chart
   * @param {string|HTMLElement} container - Container ID or element
   * @param {Object} options - Chart configuration options
   */
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
      
    if (!this.container) {
      throw new Error('Container element not found');
    }
    
    // Default configuration
    this.config = {
      size: options.size || Math.min(500, window.innerWidth * 0.8),
      margin: options.margin || 60,
      levels: options.levels || 5,
      maxValue: options.maxValue || 5,
      labelOffset: options.labelOffset || 1.2,
      fontSize: options.fontSize || 12,
      fontFamily: options.fontFamily || "'Inter', sans-serif",
      showLegend: options.showLegend !== undefined ? options.showLegend : true,
      showTooltips: options.showTooltips !== undefined ? options.showTooltips : true,
      animationDuration: options.animationDuration !== undefined ? options.animationDuration : 800,
      colors: options.colors || ['rgba(110, 89, 242, 0.8)', 'rgba(255, 155, 80, 0.7)'],
      opacities: options.opacities || [0.7, 0.5],
      dimensions: options.dimensions || [],
      labels: options.labels || options.dimensions || [],
      showToolTip: options.showTooltip !== undefined ? options.showTooltip : true,
      responsiveRadius: options.responsiveRadius !== undefined ? options.responsiveRadius : true
    };
    
    // Internal state
    this.data = [];
    this.tooltipElement = null;
    this.svg = null;
    this.centerGroup = null;
    this.maxValueScale = this.config.maxValue;
    this.axes = [];
    this.dataPointElements = [];
    this.dataPolygons = [];
    this.legendItems = [];
    this.dataPointCoordinates = [];
    this.currentAnimation = null;
    this.animationStart = null;
    this.isMobile = window.innerWidth < 768;
    
    // Initialize the chart
    this.init();
    
    // Add resize handler
    window.addEventListener('resize', this.debounce(() => this.resize(), 250));
  }
  
  /**
   * Initialize the radar chart
   */
  init() {
    // Clear container
    this.container.innerHTML = '';
    
    // Adjust size for mobile devices if responsive option is enabled
    if (this.config.responsiveRadius && this.isMobile) {
      this.config.size = Math.min(300, window.innerWidth * 0.8);
      this.config.margin = 40;
      this.config.fontSize = 10;
    }
    
    // Create SVG element
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', this.config.size);
    this.svg.setAttribute('height', this.config.size);
    this.svg.setAttribute('class', 'svg-radar-chart');
    this.svg.style.overflow = 'visible';
    
    // Calculate radius
    this.radius = (this.config.size - 2 * this.config.margin) / 2;
    
    // Create group for centering
    this.centerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.centerGroup.setAttribute('transform', `translate(${this.config.size / 2}, ${this.config.size / 2})`);
    this.svg.appendChild(this.centerGroup);
    
    // Draw background circles and axes
    this.drawBackgroundCircles();
    this.drawAxes();
    
    // Create group for data polygons
    this.dataGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.centerGroup.appendChild(this.dataGroup);
    
    // Create group for data points
    this.pointsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.centerGroup.appendChild(this.pointsGroup);
    
    // Create tooltip
    if (this.config.showTooltips) {
      this.createTooltip();
    }
    
    // Create legend if enabled
    if (this.config.showLegend) {
      this.createLegend();
    }
    
    // Add SVG to container
    this.container.appendChild(this.svg);
  }
  
  /**
   * Draw background circles
   */
  drawBackgroundCircles() {
    // Create group for background elements
    const backgroundGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    backgroundGroup.setAttribute('class', 'radar-background');
    this.centerGroup.appendChild(backgroundGroup);
    
    // Draw concentric circles
    for (let i = 1; i <= this.config.levels; i++) {
      const levelRadius = (this.radius * i) / this.config.levels;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      
      circle.setAttribute('cx', 0);
      circle.setAttribute('cy', 0);
      circle.setAttribute('r', levelRadius);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)');
      circle.setAttribute('stroke-width', 0.5);
      
      backgroundGroup.appendChild(circle);
      
      // Add level labels
      if (i < this.config.levels) {
        const levelValue = Math.round((i / this.config.levels) * this.config.maxValue * 10) / 10;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 5); // Small offset from center
        text.setAttribute('y', -levelRadius);
        text.setAttribute('font-size', this.config.fontSize * 0.8);
        text.setAttribute('fill', 'rgba(0, 0, 0, 0.5)');
        text.textContent = levelValue.toString();
        backgroundGroup.appendChild(text);
      }
    }
  }
  
  /**
   * Draw axis lines and labels
   */
  drawAxes() {
    // Check if we have valid dimensions
    const numAxes = this.config.dimensions.length;
    if (numAxes < 3) {
      console.warn('Radar chart needs at least 3 dimensions, falling back to 6');
      this.config.dimensions = ['Dim 1', 'Dim 2', 'Dim 3', 'Dim 4', 'Dim 5', 'Dim 6'];
    }
    
    // Create group for axes
    const axesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    axesGroup.setAttribute('class', 'radar-axes');
    this.centerGroup.appendChild(axesGroup);
    
    // Clear stored axes
    this.axes = [];
    
    // Calculate angles for each axis
    const numDimensions = this.config.dimensions.length;
    const angleStep = (Math.PI * 2) / numDimensions;
    
    // Draw each axis
    for (let i = 0; i < numDimensions; i++) {
      const angle = Math.PI / 2 - i * angleStep;
      const x = this.radius * Math.cos(angle);
      const y = -this.radius * Math.sin(angle);
      
      // Create axis line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', 0);
      line.setAttribute('y1', 0);
      line.setAttribute('x2', x);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)');
      line.setAttribute('stroke-width', 1);
      axesGroup.appendChild(line);
      
      this.axes.push({ angle, x, y });
      
      // Create axis label
      const labelX = this.radius * this.config.labelOffset * Math.cos(angle);
      const labelY = -this.radius * this.config.labelOffset * Math.sin(angle);
      
      const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      labelGroup.setAttribute('transform', `translate(${labelX}, ${labelY})`);
      
      // Optional icon if available
      if (this.config.icons && this.config.icons[i]) {
        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreignObject.setAttribute('width', 24);
        foreignObject.setAttribute('height', 24);
        foreignObject.setAttribute('x', -12);
        foreignObject.setAttribute('y', -12);
        
        const icon = document.createElement('i');
        icon.className = 'fas ' + this.config.icons[i];
        icon.style.color = '#6E59F2';
        icon.style.fontSize = '16px';
        icon.style.textAlign = 'center';
        icon.style.width = '100%';
        icon.style.height = '100%';
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';
        
        foreignObject.appendChild(icon);
        labelGroup.appendChild(foreignObject);
      }
      
      // Create text label
      let dimensionName = this.config.dimensions[i];
      
      // Display partial text on mobile
      if (this.isMobile && dimensionName.length > 8) {
        dimensionName = dimensionName.substring(0, 6) + '...';
      }
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('font-size', this.config.fontSize);
      label.setAttribute('font-family', this.config.fontFamily);
      label.setAttribute('fill', '#333');
      label.setAttribute('text-anchor', 'middle');
      
      // Add slight position adjustment based on angle
      if (Math.abs(angle - Math.PI/2) < 0.1) {
        // Top label
        label.setAttribute('dy', -8);
      } else if (Math.abs(angle - 3*Math.PI/2) < 0.1) {
        // Bottom label
        label.setAttribute('dy', 16);
      } else if (angle > Math.PI/2 && angle < 3*Math.PI/2) {
        // Left side
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('dx', -8);
      } else {
        // Right side
        label.setAttribute('text-anchor', 'start');
        label.setAttribute('dx', 8);
      }
      
      label.textContent = dimensionName;
      labelGroup.appendChild(label);
      
      axesGroup.appendChild(labelGroup);
    }
  }
  
  /**
   * Create tooltip element
   */
  createTooltip() {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'svg-radar-tooltip';
    this.tooltipElement.style.position = 'absolute';
    this.tooltipElement.style.display = 'none';
    this.tooltipElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.tooltipElement.style.color = 'white';
    this.tooltipElement.style.padding = '5px 10px';
    this.tooltipElement.style.borderRadius = '3px';
    this.tooltipElement.style.fontSize = '12px';
    this.tooltipElement.style.pointerEvents = 'none';
    this.tooltipElement.style.zIndex = '1000';
    this.tooltipElement.style.whiteSpace = 'nowrap';
    document.body.appendChild(this.tooltipElement);
  }
  
  /**
   * Create chart legend
   */
  createLegend() {
    // Create legend container
    const legendContainer = document.createElement('div');
    legendContainer.className = 'svg-radar-legend';
    legendContainer.style.display = 'flex';
    legendContainer.style.justifyContent = 'center';
    legendContainer.style.flexWrap = 'wrap';
    legendContainer.style.marginTop = '15px';
    legendContainer.style.gap = '15px';
    
    // This will be filled in when setData is called
    this.legendItems = [];
    
    // Add legend below the chart
    this.container.appendChild(legendContainer);
  }
  
  /**
   * Update the legend with current data
   */
  updateLegend() {
    // Find legend container
    const legendContainer = this.container.querySelector('.svg-radar-legend');
    if (!legendContainer) return;
    
    // Clear current content
    legendContainer.innerHTML = '';
    
    // Add legend items for each dataset
    this.data.forEach((dataset, i) => {
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.style.display = 'flex';
      legendItem.style.alignItems = 'center';
      legendItem.style.margin = '0 10px 5px 0';
      
      const colorBox = document.createElement('span');
      colorBox.style.width = '12px';
      colorBox.style.height = '12px';
      colorBox.style.backgroundColor = this.config.colors[i];
      colorBox.style.display = 'inline-block';
      colorBox.style.marginRight = '5px';
      colorBox.style.borderRadius = '50%';
      
      const labelText = document.createElement('span');
      labelText.textContent = dataset.label || `Dataset ${i+1}`;
      labelText.style.fontSize = '0.875rem';
      
      legendItem.appendChild(colorBox);
      legendItem.appendChild(labelText);
      
      // Add hover effect to highlight corresponding dataset
      legendItem.addEventListener('mouseenter', () => {
        this.highlightDataset(i);
      });
      
      legendItem.addEventListener('mouseleave', () => {
        this.resetHighlight();
      });
      
      legendContainer.appendChild(legendItem);
      this.legendItems.push(legendItem);
    });
  }
  
  /**
   * Highlight a specific dataset
   * @param {number} index - Dataset index
   */
  highlightDataset(index) {
    // Dim other datasets
    this.dataPolygons.forEach((polygon, i) => {
      if (i !== index) {
        polygon.setAttribute('fill-opacity', '0.2');
        polygon.setAttribute('stroke-opacity', '0.2');
      } else {
        polygon.setAttribute('fill-opacity', '0.8');
        polygon.setAttribute('stroke-opacity', '1');
      }
    });
    
    // Dim other points
    this.dataPointElements.forEach((pointsArray, i) => {
      pointsArray.forEach(point => {
        point.setAttribute('opacity', i === index ? 1 : 0.2);
      });
    });
  }
  
  /**
   * Reset highlighting
   */
  resetHighlight() {
    // Reset polygons
    this.dataPolygons.forEach((polygon, i) => {
      polygon.setAttribute('fill-opacity', this.config.opacities[i]);
      polygon.setAttribute('stroke-opacity', '1');
    });
    
    // Reset points
    this.dataPointElements.forEach(pointsArray => {
      pointsArray.forEach(point => {
        point.setAttribute('opacity', 1);
      });
    });
  }
  
  /**
   * Set data for the chart
   * @param {Array} datasets - Array of datasets
   */
  setData(datasets) {
    // Clone the input data to prevent reference issues
    this.data = JSON.parse(JSON.stringify(datasets));
    
    // Format data if not in the expected structure
    this.data = this.data.map((dataset, index) => {
      if (Array.isArray(dataset)) {
        return {
          label: `Dataset ${index + 1}`,
          data: dataset
        };
      }
      
      if (!dataset.label) {
        dataset.label = `Dataset ${index + 1}`;
      }
      
      return dataset;
    });
    
    // Find the maximum value to scale the chart
    this.maxValueScale = this.config.maxValue;
    for (const dataset of this.data) {
      const maxDataValue = Math.max(...dataset.data);
      if (maxDataValue > this.maxValueScale) {
        this.maxValueScale = maxDataValue;
      }
    }
    
    // Update legend
    if (this.config.showLegend) {
      this.updateLegend();
    }
    
    // Draw the data
    this.drawData();
  }
  
  /**
   * Draw the data on the chart
   */
  drawData() {
    // Clear existing data
    this.dataGroup.innerHTML = '';
    this.pointsGroup.innerHTML = '';
    this.dataPolygons = [];
    this.dataPointElements = [];
    this.dataPointCoordinates = [];
    
    // Cancel any ongoing animation
    if (this.currentAnimation) {
      window.cancelAnimationFrame(this.currentAnimation);
      this.currentAnimation = null;
    }
    
    // Start with zero-radius points for animation
    const startingData = this.data.map(dataset => {
      return {
        label: dataset.label,
        data: new Array(dataset.data.length).fill(0)
      };
    });
    
    // Draw initial state
    this.drawDataSets(startingData);
    
    // Start animation
    this.animateData();
  }
  
  /**
   * Draw datasets with current values
   * @param {Array} datasets - Datasets to draw
   */
  drawDataSets(datasets) {
    // Clear existing data while preserving polygon references
    while (this.dataGroup.firstChild) {
      this.dataGroup.removeChild(this.dataGroup.firstChild);
    }
    
    while (this.pointsGroup.firstChild) {
      this.pointsGroup.removeChild(this.pointsGroup.firstChild);
    }
    
    this.dataPolygons = [];
    this.dataPointElements = [];
    this.dataPointCoordinates = [];
    
    // For each dataset
    datasets.forEach((dataset, datasetIndex) => {
      const dataPoints = [];
      const dataCoordinates = [];
      const color = this.config.colors[datasetIndex % this.config.colors.length];
      
      // Create points at axes
      const pointElements = [];
      
      // Calculate points
      for (let i = 0; i < this.config.dimensions.length; i++) {
        const value = dataset.data[i] || 0;
        const angle = this.axes[i].angle;
        
        // Scale value
        const scaledValue = (value / this.maxValueScale) * this.radius;
        
        // Calculate coordinates
        const x = scaledValue * Math.cos(angle);
        const y = -scaledValue * Math.sin(angle);
        
        dataPoints.push(`${x},${y}`);
        dataCoordinates.push({ x, y, value, dimension: this.config.dimensions[i] });
        
        // Create point element
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 4);
        circle.setAttribute('fill', color);
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', '1');
        circle.setAttribute('cursor', 'pointer');
        
        // Add event listeners for tooltips
        if (this.config.showTooltips) {
          circle.addEventListener('mouseenter', (event) => {
            this.showTooltip(event, dataset, i, datasetIndex);
          });
          
          circle.addEventListener('mousemove', (event) => {
            this.moveTooltip(event);
          });
          
          circle.addEventListener('mouseleave', () => {
            this.hideTooltip();
          });
        }
        
        this.pointsGroup.appendChild(circle);
        pointElements.push(circle);
      }
      
      // Create polygon for the dataset
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', dataPoints.join(' '));
      polygon.setAttribute('fill', color);
      polygon.setAttribute('fill-opacity', this.config.opacities[datasetIndex]);
      polygon.setAttribute('stroke', color);
      polygon.setAttribute('stroke-width', '1.5');
      
      this.dataGroup.appendChild(polygon);
      this.dataPolygons.push(polygon);
      this.dataPointElements.push(pointElements);
      this.dataPointCoordinates.push(dataCoordinates);
    });
  }
  
  /**
   * Animate data from zero to actual values
   */
  animateData() {
    const startTime = performance.now();
    const duration = this.config.animationDuration;
    
    // Calculate target data for animation
    const targetData = this.data.map(dataset => dataset.data);
    
    const animate = (currentTime) => {
      // Calculate progress
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      // Calculate current frame's data
      const currentData = this.data.map((dataset, datasetIndex) => {
        const current = {
          label: dataset.label,
          data: dataset.data.map((target, i) => target * easedProgress)
        };
        return current;
      });
      
      // Draw current frame
      this.drawDataSets(currentData);
      
      // Continue animation or end
      if (progress < 1) {
        this.currentAnimation = window.requestAnimationFrame(animate);
      } else {
        this.currentAnimation = null;
      }
    };
    
    // Start animation
    this.currentAnimation = window.requestAnimationFrame(animate);
  }
  
  /**
   * Show tooltip with data point information
   */
  showTooltip(event, dataset, pointIndex, datasetIndex) {
    if (!this.tooltipElement) return;
    
    const value = dataset.data[pointIndex];
    const dimension = this.config.dimensions[pointIndex];
    
    this.tooltipElement.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 2px;">
        ${dataset.label}
      </div>
      <div>${dimension}: ${value}</div>
    `;
    
    this.tooltipElement.style.display = 'block';
    this.moveTooltip(event);
    
    // Highlight this data point
    this.dataPointElements[datasetIndex][pointIndex].setAttribute('r', '6');
    this.dataPointElements[datasetIndex][pointIndex].setAttribute('stroke-width', '2');
  }
  
  /**
   * Move tooltip to follow mouse
   */
  moveTooltip(event) {
    if (!this.tooltipElement) return;
    
    const offset = 10;
    let x = event.pageX + offset;
    let y = event.pageY + offset;
    
    // Prevent tooltip from going off screen
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const rightEdge = window.innerWidth - tooltipRect.width - offset;
    const bottomEdge = window.innerHeight - tooltipRect.height - offset;
    
    if (x > rightEdge) x = rightEdge;
    if (y > bottomEdge) y = bottomEdge;
    
    this.tooltipElement.style.left = `${x}px`;
    this.tooltipElement.style.top = `${y}px`;
  }
  
  /**
   * Hide the tooltip
   */
  hideTooltip() {
    if (!this.tooltipElement) return;
    
    this.tooltipElement.style.display = 'none';
    
    // Reset all point sizes
    this.dataPointElements.forEach(points => {
      points.forEach(point => {
        point.setAttribute('r', '4');
        point.setAttribute('stroke-width', '1');
      });
    });
  }
  
  /**
   * Export chart to PNG
   * @param {string} filename - Optional filename
   * @returns {Promise} - Promise resolving to the data URL
   */
  exportToPNG(filename = 'radar-chart') {
    return new Promise((resolve, reject) => {
      try {
        // Serialize SVG
        const svg = this.svg;
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svg);
        
        // Fix namespace issues
        if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
          svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        
        // Create a canvas element to draw the SVG
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Get SVG dimensions
        const rect = svg.getBoundingClientRect();
        canvas.width = rect.width * 2;  // Higher resolution
        canvas.height = rect.height * 2;
        context.scale(2, 2);  // Higher resolution
        
        // Convert SVG to data URL
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        // Create image from SVG
        const image = new Image();
        image.onload = () => {
          // Draw background
          context.fillStyle = 'white';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw SVG image
          context.drawImage(image, 0, 0, rect.width, rect.height);
          
          // Convert to PNG
          const pngDataUrl = canvas.toDataURL('image/png');
          
          // Download the image
          const downloadLink = document.createElement('a');
          downloadLink.href = pngDataUrl;
          downloadLink.download = `${filename}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          // Clean up
          URL.revokeObjectURL(url);
          
          resolve(pngDataUrl);
        };
        
        image.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to convert SVG to PNG'));
        };
        
        image.src = url;
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Resize the chart when container size changes
   */
  resize() {
    const newIsMobile = window.innerWidth < 768;
    
    // Only rebuild the chart if the device type changes or on significant resize
    if (newIsMobile !== this.isMobile || 
        Math.abs(this.container.offsetWidth - this.config.size) > 50) {
      
      this.isMobile = newIsMobile;
      
      // Store current data
      const currentData = this.data;
      
      // Reinitialize the chart
      this.init();
      
      // Redraw data without animation
      if (currentData.length > 0) {
        this.data = currentData;
        this.drawDataSets(currentData);
        
        // Update legend
        if (this.config.showLegend) {
          this.updateLegend();
        }
      }
    }
  }
  
  /**
   * Update chart configuration
   * @param {Object} config - New configuration options
   */
  updateConfig(config) {
    // Update configuration
    Object.assign(this.config, config);
    
    // Store current data
    const currentData = this.data;
    
    // Reinitialize the chart
    this.init();
    
    // Redraw data without animation
    if (currentData.length > 0) {
      this.data = currentData;
      this.drawDataSets(currentData);
      
      // Update legend
      if (this.config.showLegend) {
        this.updateLegend();
      }
    }
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    // Remove tooltip
    if (this.tooltipElement && this.tooltipElement.parentNode) {
      this.tooltipElement.parentNode.removeChild(this.tooltipElement);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.resize);
    
    // Cancel any ongoing animation
    if (this.currentAnimation) {
      window.cancelAnimationFrame(this.currentAnimation);
    }
    
    // Clear container
    this.container.innerHTML = '';
  }
  
  /**
   * Debounce function to limit rapid function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
}

// Expose as module and global variable
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SVGRadarChart;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return SVGRadarChart;
  });
} else {
  window.SVGRadarChart = SVGRadarChart;
}

export { SVGRadarChart }; 