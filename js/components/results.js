/**
 * Results Component
 * Handles the display of assessment results
 */

import assessmentData from '../models/assessmentData.js';
import RadarChart from './radar.js';

class ResultsDisplay {
  /**
   * Initialize the results display
   * @param {string} containerId - ID of the results container
   * @param {Object} config - Configuration options
   */
  constructor(containerId, config = {}) {
    // Get the container
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Results container with ID "${containerId}" not found`);
      return;
    }
    
    // Default configuration
    this.config = {
      scoreElementId: 'overall-score',
      levelElementId: 'maturity-level',
      levelTitleElementId: 'maturity-level-title',
      levelDescElementId: 'maturity-level-description',
      recommendationsElementId: 'recommendations-list',
      dimensionScoresElementId: 'dimension-scores',
      radarChartId: 'radar-chart',
      industrySelectId: 'industry-select',
      downloadButtonId: 'download-report',
      ...config
    };
    
    // Initialize charts
    this.initializeCharts();
    
    // Initialize industry benchmark selector if it exists
    this.initializeIndustrySelector();
    
    // Initialize download functionality if button exists
    this.initializeDownload();
  }
  
  /**
   * Initialize the radar chart
   */
  initializeCharts() {
    const radarContainer = document.getElementById(this.config.radarChartId);
    if (!radarContainer) return;
    
    // Create radar chart
    this.radarChart = new RadarChart(this.config.radarChartId, {
      maxValue: 5,
      levels: 5,
      labelOffset: 1.2,
      colors: assessmentData.dimensions.map(d => d.color),
      dimensions: assessmentData.dimensions.map(d => d.shortName || d.name)
    });
  }
  
  /**
   * Initialize the industry selector
   */
  initializeIndustrySelector() {
    this.industrySelect = document.getElementById(this.config.industrySelectId);
    if (!this.industrySelect) return;
    
    // Add event listener
    this.industrySelect.addEventListener('change', () => {
      this.updateBenchmarks();
    });
  }
  
  /**
   * Initialize download functionality
   */
  initializeDownload() {
    const downloadButton = document.getElementById(this.config.downloadButtonId);
    if (!downloadButton) return;
    
    downloadButton.addEventListener('click', () => {
      this.downloadReport();
    });
  }
  
  /**
   * Update the results display with assessment values
   * @param {Array} values - Array of dimension values (1-5)
   */
  updateResults(values) {
    if (!values || values.length === 0) return;
    
    // Calculate overall score
    const overallScore = assessmentData.calculateOverallScore(values);
    
    // Get maturity level
    const maturityLevel = assessmentData.getMaturityLevel(overallScore);
    
    // Update overall score
    this.updateOverallScore(overallScore);
    
    // Update maturity level
    this.updateMaturityLevel(maturityLevel);
    
    // Update dimension scores
    this.updateDimensionScores(values);
    
    // Update radar chart
    this.updateRadarChart(values);
    
    // Update benchmarks
    this.updateBenchmarks();
    
    // Make results visible
    this.showResults();
  }
  
  /**
   * Update the overall score display
   * @param {number} score - The overall score
   */
  updateOverallScore(score) {
    const scoreElement = document.getElementById(this.config.scoreElementId);
    if (!scoreElement) return;
    
    // Format score to 1 decimal place
    scoreElement.textContent = score.toFixed(1);
  }
  
  /**
   * Update the maturity level display
   * @param {Object} level - The maturity level object
   */
  updateMaturityLevel(level) {
    // Update level name
    const levelElement = document.getElementById(this.config.levelElementId);
    if (levelElement) {
      levelElement.textContent = level.level;
    }
    
    // Update level title
    const titleElement = document.getElementById(this.config.levelTitleElementId);
    if (titleElement) {
      titleElement.textContent = level.title;
    }
    
    // Update level description
    const descElement = document.getElementById(this.config.levelDescElementId);
    if (descElement) {
      descElement.textContent = level.description;
    }
    
    // Update recommendations
    const recsElement = document.getElementById(this.config.recommendationsElementId);
    if (recsElement) {
      // Clear existing recommendations
      recsElement.innerHTML = '';
      
      // Add new recommendations
      level.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recsElement.appendChild(li);
      });
    }
  }
  
  /**
   * Update dimension scores display
   * @param {Array} values - Array of dimension values
   */
  updateDimensionScores(values) {
    const scoresContainer = document.getElementById(this.config.dimensionScoresElementId);
    if (!scoresContainer) return;
    
    // Clear existing scores
    scoresContainer.innerHTML = '';
    
    // Add dimension score items
    assessmentData.dimensions.forEach((dimension, index) => {
      // Create score item
      const item = document.createElement('div');
      item.className = 'dimension-score-item';
      
      // Add color indicator
      const colorIndicator = document.createElement('span');
      colorIndicator.className = 'color-indicator';
      colorIndicator.style.backgroundColor = dimension.color;
      item.appendChild(colorIndicator);
      
      // Add dimension name
      const name = document.createElement('span');
      name.className = 'dimension-name';
      name.textContent = dimension.name;
      item.appendChild(name);
      
      // Add score
      const score = document.createElement('span');
      score.className = 'dimension-score';
      score.textContent = values[index];
      item.appendChild(score);
      
      // Add to container
      scoresContainer.appendChild(item);
    });
  }
  
  /**
   * Update the radar chart
   * @param {Array} values - Array of dimension values
   */
  updateRadarChart(values) {
    if (!this.radarChart) return;
    
    // Update chart with new values
    this.radarChart.setData([values]);
  }
  
  /**
   * Update industry benchmarks
   */
  updateBenchmarks() {
    if (!this.radarChart || !this.industrySelect) return;
    
    // Get selected industry
    const industry = this.industrySelect.value;
    
    // Get benchmark data
    const benchmarkData = assessmentData.getIndustryBenchmark(industry);
    
    // Update chart with benchmark data
    if (this.radarChart.data && this.radarChart.data.length > 0) {
      this.radarChart.setData([this.radarChart.data[0], benchmarkData], ['Your Score', industry]);
    }
  }
  
  /**
   * Show the results container
   */
  showResults() {
    if (this.container) {
      this.container.style.display = 'block';
      
      // Scroll to results
      setTimeout(() => {
        this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
  
  /**
   * Hide the results container
   */
  hideResults() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
  
  /**
   * Download assessment report as PNG
   */
  downloadReport() {
    if (!this.radarChart) return;
    
    // Get assessment name
    const nameInput = document.querySelector('.form-input[name="assessment-name"]');
    const assessmentName = nameInput ? nameInput.value : 'AI Maturity Assessment';
    
    // Export radar chart as PNG
    this.radarChart.exportToPNG(assessmentName);
  }
}

export default ResultsDisplay; 