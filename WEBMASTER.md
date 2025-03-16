# ClarityAI Webmaster Technical Guide

## Purpose
This document provides technical specifications and implementation instructions for maintaining and enhancing ClarityAI's assessment visualization tools. Follow these guidelines to ensure consistent performance across devices while supporting the business goal of empowering CX teams with actionable insights.

## Key Technical Objectives
- Ensure visualizations accurately represent customer maturity data
- Maintain cross-browser and cross-device compatibility
- Optimize for both performance and visual appeal
- Support ClarityAI's brand identity throughout the technical implementation
- Facilitate data-driven decision making for CX teams

## Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: Chart.js (primary), D3.js (advanced features)
- **Styling**: CSS Grid and Flexbox for responsive layouts
- **Effects**: CSS transitions, subtle animations
- **Analytics**: Google Analytics with custom event tracking
- **Compatibility**: ES5 fallbacks for older browsers

## Current Technical Assessment

### Strengths to Maintain
- Core functionality of the radar chart visualization works effectively
- Data structure properly supports multi-dimensional assessment scoring
- Responsive base design adapts to different viewport sizes
- Solid foundation for visualization extensions and improvements

### Issues Requiring Immediate Action
1. **Module Loading Error**: Fix ES6 module import errors in certain browsers
   ```
   Error: Cannot use import statement outside a module
   ```
2. **Visualization Container**: Increase the width and flexibility of the glass-panel
3. **Mobile Experience**: Resolve radar chart rendering and sizing issues on small screens
4. **Visual Consistency**: Standardize icon colors across all sections
5. **Interface Options**: Add visualization toggle between radar and bar charts

## Implementation Instructions

### 1. Fix Module Loading Issues

```javascript
// REPLACE THIS:
import { RadarChart } from './components/radar.js';

// WITH THIS:
// First attempt modern approach
let RadarChart;
try {
  const module = await import('./components/radar.js');
  RadarChart = module.RadarChart;
} catch (e) {
  // Fallback for non-module supporting browsers
  RadarChart = window.ClarityAI.RadarChart;
}

// AND ADD THIS FALLBACK SCRIPT TO HTML:
<script nomodule src="js/components/radar-fallback.js"></script>
```

### 2. Fix Visualization Container

```css
/* ADD TO css/components/results.css */
.glass-panel {
  background-color: rgba(30, 30, 38, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: visible !important;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
}

/* Specifically for visualizations */
.glass-panel .radar-chart-container {
  min-height: 400px;
  width: 100%;
  margin: 0 auto;
  overflow: visible;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .glass-panel .radar-chart-container {
    min-height: 500px;
    max-width: 90%;
  }
}

@media (max-width: 767px) {
  .glass-panel .radar-chart-container {
    min-height: 350px;
  }
}
```

### 3. Implement Visualization Manager

Create a new file `js/components/visualization-manager.js`:

```javascript
/**
 * ClarityAI Visualization Manager
 * Handles the logic for toggling between different visualization types
 * and selects appropriate default based on device
 */
class VisualizationManager {
  constructor(config = {}) {
    this.container = document.getElementById(config.containerId || 'visualization-container');
    this.radarContainer = document.getElementById(config.radarId || 'radar-chart');
    this.barContainer = document.getElementById(config.barId || 'bar-chart');
    this.toggleButton = document.getElementById(config.toggleId || 'viz-toggle');
    
    this.isMobile = window.innerWidth < 768;
    this.currentView = this.isMobile ? 'bar' : 'radar';
    
    this.charts = {
      radar: null,
      bar: null
    };
    
    this.init();
  }
  
  init() {
    // Create both chart instances
    this.charts.radar = new RadarChart(this.radarContainer, {
      dimensions: CLARITY_DIMENSIONS.map(d => d.name),
      colors: CLARITY_COLORS
    });
    
    this.charts.bar = new BarChart(this.barContainer, {
      dimensions: CLARITY_DIMENSIONS.map(d => d.name),
      colors: CLARITY_COLORS
    });
    
    // Set initial visibility
    this.radarContainer.style.display = this.currentView === 'radar' ? 'block' : 'none';
    this.barContainer.style.display = this.currentView === 'bar' ? 'block' : 'none';
    
    // Add toggle functionality
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => this.toggle());
    }
    
    // Handle resize events
    window.addEventListener('resize', () => this.handleResize());
    
    // Track visualization view in analytics
    this.trackVisualization();
  }
  
  toggle() {
    this.currentView = this.currentView === 'radar' ? 'bar' : 'radar';
    this.radarContainer.style.display = this.currentView === 'radar' ? 'block' : 'none';
    this.barContainer.style.display = this.currentView === 'bar' ? 'block' : 'none';
    
    // Update toggle button text/icon if needed
    if (this.toggleButton) {
      this.toggleButton.setAttribute('data-view', this.currentView);
      const icon = this.toggleButton.querySelector('i');
      if (icon) {
        icon.className = this.currentView === 'radar' 
          ? 'fas fa-chart-bar' 
          : 'fas fa-chart-pie';
      }
    }
    
    // Track toggle interaction
    this.trackVisualization();
  }
  
  setData(userData, benchmarkData) {
    this.charts.radar.setData([userData, benchmarkData]);
    this.charts.bar.setData([userData, benchmarkData]);
  }
  
  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    
    // If switching between mobile and desktop, change visualization if user hasn't toggled
    if (wasMobile !== this.isMobile && !this.userToggled) {
      this.currentView = this.isMobile ? 'bar' : 'radar';
      this.radarContainer.style.display = this.currentView === 'radar' ? 'block' : 'none';
      this.barContainer.style.display = this.currentView === 'bar' ? 'block' : 'none';
    }
    
    // Redraw charts for new size
    this.charts.radar.resize();
    this.charts.bar.resize();
  }
  
  trackVisualization() {
    // Track which visualization is being viewed
    if (window.gtag) {
      gtag('event', 'view_visualization', {
        'visualization_type': this.currentView,
        'device_type': this.isMobile ? 'mobile' : 'desktop',
        'user_toggled': this.userToggled
      });
    }
  }
}

export { VisualizationManager };
```

### 4. Add Markup for Visualization Toggle

Add to HTML where visualization container is:

```html
<div class="visualization-container" id="visualization-container">
  <!-- Visualization Controls -->
  <div class="visualization-controls">
    <button id="viz-toggle" class="viz-toggle-btn" data-view="radar">
      <i class="fas fa-chart-bar"></i>
      <span>Switch to Bar Chart</span>
    </button>
  </div>
  
  <!-- Visualization Canvases -->
  <div class="radar-canvas-wrapper" id="radar-chart">
    <canvas id="radar-canvas"></canvas>
  </div>
  
  <div class="bar-canvas-wrapper" id="bar-chart">
    <canvas id="bar-canvas"></canvas>
  </div>
</div>
```

### 5. CSS for Visualization Controls

```css
/* Add to your CSS */
.visualization-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.viz-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(30, 30, 38, 0.6);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  color: white;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.viz-toggle-btn:hover {
  background: rgba(110, 89, 242, 0.2);
  border-color: var(--primary-color);
}

.viz-toggle-btn i {
  color: var(--primary-color);
}

.bar-canvas-wrapper {
  display: none;
  width: 100%;
  height: 400px;
}

@media (max-width: 767px) {
  .viz-toggle-btn span {
    display: none;
  }
  
  .viz-toggle-btn i {
    margin-right: 0;
  }
  
  .bar-canvas-wrapper {
    height: 350px;
  }
}
```

## Testing Checklist

Before deploying changes, verify the following:

- [ ] Visualization renders correctly across Chrome, Firefox, Safari, and Edge
- [ ] Module loading works on all browsers (including IE11 with fallback)
- [ ] Mobile experience uses appropriate visualization by default
- [ ] Toggle button works correctly and preserves data
- [ ] Glass panel properly contains visualization without cutoff
- [ ] Analytics events are firing correctly for visualization interactions
- [ ] Export functionality works with both visualization types
- [ ] Icon colors are consistent across all UI elements
- [ ] Performance is acceptable on lower-end devices
- [ ] Touch interactions work properly on mobile and tablets

## Performance Benchmarks

Your implementation should meet these performance targets:

- Initial load time: < 3s on 4G connection
- Visualization rendering: < 200ms
- Toggle between visualizations: < 100ms
- Total JavaScript bundle: < 150KB minified/gzipped
- Glass panel rendering: No visible flicker/jank (60fps)

## Dependency Versions

```json
{
  "chart.js": "^3.9.1",
  "d3": "^7.8.2",
  "html2canvas": "^1.4.1"
}
```

## Security Considerations

- Ensure all user assessment data remains client-side only
- Implement proper CORS headers if loading visualization resources externally
- Validate all user input before processing
- Do not expose sensitive configuration in client-side code
- Use CSP headers to prevent XSS attacks

---

These technical improvements will ensure ClarityAI's assessment tool provides CX teams with a robust, flexible visualization experience that adapts to their device while maintaining performance and security standards.

**Remember**: The visualization is a critical touchpoint for users to understand their CX team's maturity level. Technical excellence here directly supports ClarityAI's mission to help teams scale personalized outreach without sacrificing authenticity. 