/**
 * Guided Tour Component
 * Uses Shepherd.js to create an interactive guided tour for the AI Maturity Assessment.
 * This component provides a step-by-step walkthrough of the assessment interface,
 * helping users understand how to complete the assessment and interpret their results.
 * 
 * @requires Shepherd.js - The library must be loaded before initializing the tour
 * @requires gtag - Optional Google Analytics for tour tracking
 */

/**
 * Initialize the guided tour for the assessment.
 * This function sets up and starts an interactive tour that guides users through
 * the assessment interface, highlighting key features and functionality.
 * 
 * The tour includes steps for:
 * - Welcome introduction
 * - Progress tracking
 * - Industry selection
 * - Dimension rating
 * - Results preview
 * - Radar chart analysis
 * - Recommendations
 * - Email capture for report
 * 
 * @returns {void}
 * @throws {Error} Logs error if Shepherd.js is not loaded
 */
export function initGuidedTour() {
  // Check if Shepherd is loaded
  if (typeof Shepherd !== 'function') {
    console.error('Shepherd.js is not loaded. Please include the Shepherd library.');
    return;
  }

  // Configure the tour
  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom',
      scrollTo: { behavior: 'smooth', block: 'center' },
      highlightClass: 'highlight',
      modalOverlayOpeningPadding: 10,
      modalOverlayOpeningRadius: 4
    },
    useModalOverlay: true
  });

  // Add steps to the tour
  tour.addStep({
    id: 'welcome',
    title: 'Welcome to the AI Maturity Assessment',
    text: `<p>This guided tour will walk you through how to complete the assessment and understand your results.</p>
          <p>Click "Next" to continue or "Skip" to exit the tour.</p>`,
    attachTo: {
      element: '.assessment-intro',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip',
        action: tour.cancel
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'progress-steps',
    title: 'Assessment Progress',
    text: `<p>The assessment is divided into easy-to-complete steps.</p>
          <p>You can track your progress here and navigate between steps.</p>`,
    attachTo: {
      element: '.progress-container',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'industry-selection',
    title: 'Select Your Industry',
    text: `<p>Start by selecting your industry to enable comparison with relevant benchmarks.</p>
          <p>This helps contextualize your assessment results.</p>`,
    attachTo: {
      element: '#industry',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'dimension-sliders',
    title: 'Rate Each Dimension',
    text: `<p>Use these sliders to rate your organization's capabilities in each dimension.</p>
          <p>Hover over the info icon for detailed descriptions of each level.</p>`,
    attachTo: {
      element: '.slider-container',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'results-preview',
    title: 'Results Overview',
    text: `<p>After submission, you'll see your overall maturity score and level.</p>
          <p>This indicates your organization's general AI readiness.</p>`,
    attachTo: {
      element: '.score-card',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ],
    beforeShowPromise: function() {
      return new Promise(function(resolve) {
        // If results section is hidden, make it temporarily visible for the tour
        const resultsSection = document.getElementById('results-section');
        if (resultsSection && resultsSection.classList.contains('hidden')) {
          resultsSection.classList.add('tour-preview');
          resultsSection.classList.remove('hidden');
        }
        resolve();
      });
    },
    when: {
      hide: function() {
        // Hide the results section again if it was just for preview
        const resultsSection = document.getElementById('results-section');
        if (resultsSection && resultsSection.classList.contains('tour-preview')) {
          resultsSection.classList.add('hidden');
          resultsSection.classList.remove('tour-preview');
        }
      }
    }
  });

  tour.addStep({
    id: 'radar-chart',
    title: 'Dimension Analysis',
    text: `<p>The radar chart visualizes your scores across all dimensions.</p>
          <p>It also shows industry benchmarks for comparison, helping identify strengths and areas for improvement.</p>`,
    attachTo: {
      element: '.radar-container',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'recommendations',
    title: 'Personalized Recommendations',
    text: `<p>Based on your assessment, you'll receive tailored recommendations.</p>
          <p>These actionable insights will help you advance your AI maturity.</p>`,
    attachTo: {
      element: '.recommendations-container',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ]
  });

  tour.addStep({
    id: 'email-capture',
    title: 'Save Your Results',
    text: `<p>Enter your email to receive a detailed PDF report of your assessment.</p>
          <p>You can also download the visualization or share your results.</p>`,
    attachTo: {
      element: '.email-capture',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Finish Tour',
        action: tour.complete
      }
    ]
  });

  // Start the tour
  tour.start();
  
  // Track tour start in analytics
  if (typeof gtag === 'function') {
    gtag('event', 'guided_tour_start', {
      'event_category': 'engagement',
      'event_label': 'AI Assessment Tour'
    });
  }
  
  // Listen for tour completion or cancellation
  tour.on('complete', () => {
    if (typeof gtag === 'function') {
      gtag('event', 'guided_tour_complete', {
        'event_category': 'engagement',
        'event_label': 'AI Assessment Tour'
      });
    }
  });
  
  tour.on('cancel', () => {
    if (typeof gtag === 'function') {
      gtag('event', 'guided_tour_cancel', {
        'event_category': 'engagement',
        'event_label': 'AI Assessment Tour',
        'value': tour.getCurrentStep() ? tour.getCurrentStep().id : 'unknown'
      });
    }
  });
  
  return tour;
}

/**
 * Initialize the results walkthrough
 * Focused specifically on explaining assessment results
 */
export function initResultsWalkthrough() {
  // Check if Shepherd is loaded
  if (typeof Shepherd !== 'function') {
    console.error('Shepherd.js is not loaded. Please include the Shepherd library.');
    return;
  }
  
  // Configure the walkthrough
  const walkthrough = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom results-walkthrough',
      scrollTo: { behavior: 'smooth', block: 'center' },
      modalOverlayOpeningPadding: 10
    },
    useModalOverlay: true
  });
  
  // Add steps focused on results explanation
  walkthrough.addStep({
    id: 'overall-score-explanation',
    title: 'Your Overall Score',
    text: `<p>Your overall score is the average of all dimension ratings.</p>
          <p>This determines your maturity level from Initial (1) to Leading (5).</p>`,
    attachTo: {
      element: '.score-circle',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip',
        action: walkthrough.cancel
      },
      {
        text: 'Next',
        action: walkthrough.next
      }
    ]
  });
  
  walkthrough.addStep({
    id: 'maturity-level-explanation',
    title: 'Maturity Level',
    text: `<p>Each maturity level represents a distinct stage in AI adoption:</p>
          <ul>
            <li><strong>Initial (1):</strong> Limited awareness or ad-hoc implementation</li>
            <li><strong>Developing (2):</strong> Beginning to implement with some strategy</li>
            <li><strong>Defined (3):</strong> Established practices with clear processes</li>
            <li><strong>Advanced (4):</strong> Sophisticated capabilities across organization</li>
            <li><strong>Leading (5):</strong> Industry-leading capabilities driving value</li>
          </ul>`,
    attachTo: {
      element: '.maturity-level-container',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: walkthrough.back
      },
      {
        text: 'Next',
        action: walkthrough.next
      }
    ]
  });
  
  walkthrough.addStep({
    id: 'radar-explanation',
    title: 'Understanding the Radar Chart',
    text: `<p>The radar chart shows:</p>
          <ul>
            <li><strong>Blue area:</strong> Your scores across all dimensions</li>
            <li><strong>Orange area:</strong> Industry benchmark comparison</li>
          </ul>
          <p>Areas where your plot extends beyond the benchmark indicate strengths, while areas inside suggest opportunities for improvement.</p>`,
    attachTo: {
      element: '.radar-canvas-wrapper',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: walkthrough.back
      },
      {
        text: 'Next',
        action: walkthrough.next
      }
    ]
  });
  
  walkthrough.addStep({
    id: 'dimension-scores-explanation',
    title: 'Dimension Details',
    text: `<p>These cards break down your score in each dimension.</p>
          <p>Each includes:</p>
          <ul>
            <li>Your specific score (1-5)</li>
            <li>Description of the dimension</li>
            <li>Personalized recommendation for improvement</li>
          </ul>`,
    attachTo: {
      element: '.dimensions-list',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action: walkthrough.back
      },
      {
        text: 'Next',
        action: walkthrough.next
      }
    ]
  });
  
  walkthrough.addStep({
    id: 'recommendations-explanation',
    title: 'Key Recommendations',
    text: `<p>These recommendations are tailored to your current maturity level.</p>
          <p>They provide actionable next steps to advance your organization's AI capabilities.</p>
          <p>Focus on these areas to strategically improve your maturity score.</p>`,
    attachTo: {
      element: '.recommendations-list',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action: walkthrough.back
      },
      {
        text: 'Next',
        action: walkthrough.next
      }
    ]
  });
  
  walkthrough.addStep({
    id: 'next-steps',
    title: 'What To Do Next',
    text: `<p>To get the most from your assessment:</p>
          <ul>
            <li>Download or email your results for reference</li>
            <li>Share insights with key stakeholders</li>
            <li>Implement recommendations based on priority</li>
            <li>Consider booking a consultation for detailed guidance</li>
            <li>Re-assess in 6-12 months to track progress</li>
          </ul>`,
    attachTo: {
      element: '.email-capture',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action: walkthrough.back
      },
      {
        text: 'Finish',
        action: walkthrough.complete
      }
    ]
  });
  
  // Start the walkthrough
  walkthrough.start();
  
  // Track walkthrough in analytics
  if (typeof gtag === 'function') {
    gtag('event', 'results_walkthrough_start', {
      'event_category': 'engagement',
      'event_label': 'Results Explanation'
    });
  }
  
  // Listen for walkthrough completion
  walkthrough.on('complete', () => {
    if (typeof gtag === 'function') {
      gtag('event', 'results_walkthrough_complete', {
        'event_category': 'engagement',
        'event_label': 'Results Explanation'
      });
    }
  });
  
  return walkthrough;
}

export default { initGuidedTour, initResultsWalkthrough }; 