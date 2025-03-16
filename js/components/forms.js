/**
 * Forms Component
 * Handles form interactions for the AI assessment
 */

class AssessmentForm {
  /**
   * Initialize the assessment form
   * @param {string} formId - ID of the assessment form container
   * @param {Object} config - Form configuration
   */
  constructor(formId, config = {}) {
    // Get the form container
    this.container = document.getElementById(formId);
    if (!this.container) {
      console.error(`Form container with ID "${formId}" not found`);
      return;
    }
    
    // Default configuration
    this.config = {
      sliderSelector: '.slider',
      labelSelector: '.slider-label',
      optionTitleSelector: '.selected-option-title',
      optionDescSelector: '.selected-option-desc',
      activeClass: 'active',
      onValueChange: null,
      dimensions: [],
      ...config
    };
    
    // Initialize form
    this.initialize();
  }
  
  /**
   * Initialize the form and attach event listeners
   */
  initialize() {
    // Find all sliders
    this.sliders = this.container.querySelectorAll(this.config.sliderSelector);
    
    // Attach event listeners to sliders
    this.sliders.forEach((slider, index) => {
      // Add input event listener
      slider.addEventListener('input', () => {
        this.updateSliderDisplay(slider, index);
      });
      
      // Initialize display
      this.updateSliderDisplay(slider, index);
    });
    
    // Find assessment name input
    this.nameInput = this.container.querySelector('.form-input[name="assessment-name"]');
    if (this.nameInput) {
      this.nameInput.addEventListener('input', () => {
        this.updateHiddenFields();
      });
    }
  }
  
  /**
   * Update the display when a slider value changes
   * @param {HTMLElement} slider - The slider element
   * @param {number} index - The index of the dimension
   */
  updateSliderDisplay(slider, index) {
    try {
      const value = parseInt(slider.value);
      const dimension = this.config.dimensions[index];
      
      if (!dimension || !dimension.levels || !dimension.levels[value-1]) {
        console.error('Missing dimension data for index', index);
        return;
      }
      
      // Get the parent container of the slider
      const container = slider.closest('.dimension-assessment');
      if (!container) return;
      
      // Update labels
      const labels = container.querySelectorAll(this.config.labelSelector);
      labels.forEach((label, labelIndex) => {
        if (labelIndex === value - 1) {
          label.classList.add(this.config.activeClass);
        } else {
          label.classList.remove(this.config.activeClass);
        }
      });
      
      // Update option text
      const optionTitle = container.querySelector(this.config.optionTitleSelector);
      const optionDesc = container.querySelector(this.config.optionDescSelector);
      
      if (optionTitle) {
        optionTitle.textContent = dimension.levels[value-1].title;
      }
      
      if (optionDesc) {
        optionDesc.textContent = dimension.levels[value-1].desc;
      }
      
      // Update slider color gradient
      this.updateSliderColorGradient(slider, value);
      
      // Call the onValueChange callback if provided
      if (typeof this.config.onValueChange === 'function') {
        this.config.onValueChange(this.getValues());
      }
      
      // Update hidden form fields if they exist
      this.updateHiddenFields();
      
    } catch (error) {
      console.error('Error updating slider display:', error);
    }
  }
  
  /**
   * Update the color gradient of a slider
   * @param {HTMLElement} slider - The slider element
   * @param {number} value - The current value
   */
  updateSliderColorGradient(slider, value) {
    try {
      // Calculate percentage based on min, max, and current value
      const min = parseInt(slider.min) || 1;
      const max = parseInt(slider.max) || 5;
      const percentage = ((value - min) / (max - min)) * 100;
      
      // Update the gradient to highlight up to the current value
      slider.style.background = `linear-gradient(to right, 
          var(--primary-color) 0%, 
          var(--primary-color) ${percentage}%, 
          rgba(255,255,255,0.1) ${percentage}%, 
          rgba(255,255,255,0.1) 100%)`;
    } catch (error) {
      console.error('Error updating slider gradient:', error);
    }
  }
  
  /**
   * Update hidden form fields with current values
   */
  updateHiddenFields() {
    // Update dimension value fields
    this.sliders.forEach((slider, index) => {
      const fieldId = `dimension${index+1}-value`;
      const hiddenField = document.getElementById(fieldId);
      
      if (hiddenField) {
        hiddenField.value = slider.value;
      }
    });
    
    // Update assessment name field
    const nameField = document.getElementById('assessment-name-value');
    if (nameField && this.nameInput) {
      nameField.value = this.nameInput.value;
    }
  }
  
  /**
   * Get current values from all sliders
   * @returns {Array} - Array of slider values
   */
  getValues() {
    return Array.from(this.sliders).map(slider => parseInt(slider.value));
  }
  
  /**
   * Get normalized values (0-1) for the radar chart
   * @returns {Array} - Array of normalized values
   */
  getNormalizedValues() {
    return this.getValues().map(value => {
      const min = 1;
      const max = 5;
      return (value - min) / (max - min);
    });
  }
  
  /**
   * Reset the form to default values
   */
  reset() {
    this.sliders.forEach((slider, index) => {
      // Reset to default or center value
      slider.value = slider.defaultValue || 3;
      
      // Update display
      this.updateSliderDisplay(slider, index);
    });
    
    // Reset name input if it exists
    if (this.nameInput) {
      this.nameInput.value = '';
    }
    
    // Update hidden fields
    this.updateHiddenFields();
  }
}

// Export the class
export default AssessmentForm; 