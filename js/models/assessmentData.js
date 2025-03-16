/**
 * Assessment Data Model
 * Contains all data for the AI Maturity Assessment
 */

/**
 * Dimensions for the AI Maturity Assessment
 */
export const dimensions = [
  {
    id: 'strategy',
    name: 'Strategy & Vision',
    shortName: 'Strategy',
    desc: 'The organization\'s approach to AI strategy, planning and alignment with business goals',
    color: '#4285F4',
    levels: [
      {
        value: 1,
        title: 'Ad hoc',
        desc: 'No formal AI strategy exists. AI initiatives are unplanned and disconnected from business objectives.'
      },
      {
        value: 2,
        title: 'Exploratory',
        desc: 'Basic AI awareness at leadership level. Experimental projects with limited strategic alignment.'
      },
      {
        value: 3,
        title: 'Defined',
        desc: 'Documented AI strategy exists with clear business objectives. Resources allocated to strategic AI initiatives.'
      },
      {
        value: 4,
        title: 'Managed',
        desc: 'Comprehensive AI strategy with KPIs. Regular reviews of AI initiatives and their business impact.'
      },
      {
        value: 5, 
        title: 'Optimized',
        desc: 'AI strategy fully integrated with business strategy. Continuous refinement based on emerging technologies and market changes.'
      }
    ]
  },
  {
    id: 'data',
    name: 'Data Infrastructure',
    shortName: 'Data',
    desc: 'The organization\'s data management capabilities and infrastructure to support AI',
    color: '#EA4335',
    levels: [
      {
        value: 1,
        title: 'Fragmented',
        desc: 'Data exists in silos. No organized approach to data collection, storage, or governance.'
      },
      {
        value: 2,
        title: 'Developing',
        desc: 'Basic data collection systems in place. Initial efforts to create data repositories with inconsistent quality.'
      },
      {
        value: 3,
        title: 'Structured',
        desc: 'Formal data governance policies exist. Standardized approaches to data collection, storage, and access.'
      },
      {
        value: 4,
        title: 'Advanced',
        desc: 'Robust data infrastructure with high-quality data pipelines. Data is accessible, well-documented, and maintained.'
      },
      {
        value: 5,
        title: 'Optimized',
        desc: 'Sophisticated data ecosystem with real-time processing capabilities. Data strategy continuously evolves with changing AI requirements.'
      }
    ]
  },
  {
    id: 'talent',
    name: 'Talent & Skills',
    shortName: 'Talent',
    desc: 'The organization\'s AI talent acquisition, development, and retention strategies',
    color: '#FBBC04',
    levels: [
      {
        value: 1,
        title: 'Limited',
        desc: 'Few or no AI skills in-house. Heavy reliance on external vendors for any AI capabilities.'
      },
      {
        value: 2,
        title: 'Emerging',
        desc: 'Basic AI awareness training for some staff. Initial hiring of specialized AI roles.'
      },
      {
        value: 3,
        title: 'Established',
        desc: 'Dedicated AI team with specialized roles. Regular AI training programs for technical staff.'
      },
      {
        value: 4,
        title: 'Advanced',
        desc: 'Robust AI talent ecosystem with specialized experts. Comprehensive AI skills development across the organization.'
      },
      {
        value: 5,
        title: 'Leading',
        desc: 'World-class AI talent across all levels. Innovation-focused culture with continuous AI skills development and knowledge sharing.'
      }
    ]
  },
  {
    id: 'technology',
    name: 'Technology & Tools',
    shortName: 'Technology',
    desc: 'The organization\'s AI technology stack, tools and infrastructure',
    color: '#34A853',
    levels: [
      {
        value: 1,
        title: 'Basic',
        desc: 'Minimal AI tools in use. Reliance on basic analytics software with limited AI capabilities.'
      },
      {
        value: 2,
        title: 'Emerging',
        desc: 'Initial investment in AI technologies. Experimentation with basic ML tools and platforms.'
      },
      {
        value: 3,
        title: 'Established',
        desc: 'Standardized AI technology stack. Regular evaluation and adoption of new AI tools.'
      },
      {
        value: 4,
        title: 'Advanced',
        desc: 'Sophisticated AI platforms and tools integrated across the organization. Robust MLOps practices in place.'
      },
      {
        value: 5,
        title: 'Cutting-edge',
        desc: 'State-of-the-art AI infrastructure with custom tools. Continuous evaluation and integration of emerging AI technologies.'
      }
    ]
  },
  {
    id: 'governance',
    name: 'Governance & Ethics',
    shortName: 'Governance',
    desc: 'The organization\'s approach to AI governance, ethics, and responsible AI practices',
    color: '#673AB7',
    levels: [
      {
        value: 1,
        title: 'Minimal',
        desc: 'No formal AI governance or ethics policies in place. Limited awareness of AI risks.'
      },
      {
        value: 2,
        title: 'Developing',
        desc: 'Basic awareness of AI ethics considerations. Initial development of AI governance policies.'
      },
      {
        value: 3,
        title: 'Defined',
        desc: 'Formal AI governance framework in place. Documented ethics guidelines for AI development and use.'
      },
      {
        value: 4,
        title: 'Managed',
        desc: 'Comprehensive AI governance with dedicated oversight. Rigorous ethical review processes for all AI initiatives.'
      },
      {
        value: 5,
        title: 'Optimized',
        desc: 'Industry-leading AI governance and ethics framework. Proactive approach to responsible AI with continuous improvement.'
      }
    ]
  },
  {
    id: 'operations',
    name: 'Operations & Integration',
    shortName: 'Operations',
    desc: 'The extent to which AI capabilities are integrated into business operations',
    color: '#03A9F4',
    levels: [
      {
        value: 1,
        title: 'Isolated',
        desc: 'AI initiatives operate in isolation from core business processes. Limited operational impact.'
      },
      {
        value: 2,
        title: 'Connected',
        desc: 'Basic integration of AI with some business processes. Limited automation and decision support.'
      },
      {
        value: 3,
        title: 'Integrated',
        desc: 'AI integrated into key business processes. Clear operational improvements from AI initiatives.'
      },
      {
        value: 4,
        title: 'Transformed',
        desc: 'AI significantly transforms business operations. Widespread automation and AI-driven decision making.'
      },
      {
        value: 5,
        title: 'Optimized',
        desc: 'AI fully embedded in operations as a core capability. Continuous optimization of AI-driven processes across the organization.'
      }
    ]
  }
];

/**
 * Industry benchmarks for the AI Maturity Assessment
 */
export const industryBenchmarks = {
  'Technology': [3.8, 4.1, 3.9, 4.2, 3.7, 3.6],
  'Financial Services': [3.5, 3.7, 3.3, 3.6, 3.9, 3.4],
  'Healthcare': [2.8, 3.1, 2.9, 2.7, 3.5, 2.6],
  'Retail': [3.2, 3.4, 2.8, 3.3, 3.0, 3.1],
  'Manufacturing': [2.9, 3.2, 2.7, 3.0, 2.8, 3.3],
  'Energy': [2.7, 3.0, 2.5, 2.8, 3.1, 2.6],
  'Government': [2.1, 2.4, 2.0, 2.2, 2.7, 1.9],
  'Education': [2.3, 2.5, 2.2, 2.4, 2.6, 2.0],
  'Average': [2.9, 3.2, 2.8, 3.0, 3.1, 2.8]
};

/**
 * Maturity levels for the AI Maturity Assessment
 */
export const maturityLevels = [
  {
    range: [1, 1.8],
    level: 'Beginning',
    title: 'Beginning AI Maturity',
    description: 'Your organization is in the early stages of AI adoption with experimental initiatives and limited strategic direction.',
    recommendations: [
      'Develop a basic AI strategy aligned with business objectives',
      'Invest in data infrastructure and governance',
      'Build AI awareness through training and education',
      'Explore potential AI use cases relevant to your business'
    ]
  },
  {
    range: [1.81, 2.6],
    level: 'Developing',
    title: 'Developing AI Maturity',
    description: 'Your organization has started implementing AI initiatives with some strategic alignment and basic AI capabilities.',
    recommendations: [
      'Formalize your AI strategy with clear objectives and metrics',
      'Enhance data quality, access, and management systems',
      'Build specialized AI teams and develop internal expertise',
      'Implement AI governance and ethics frameworks',
      'Scale successful AI pilots across the organization'
    ]
  },
  {
    range: [2.61, 3.4],
    level: 'Established',
    title: 'Established AI Maturity',
    description: 'Your organization has established AI capabilities with dedicated resources, formal processes, and measurable business impact.',
    recommendations: [
      'Refine AI strategy to maximize business value and competitive advantage',
      'Advance data infrastructure with real-time capabilities',
      'Expand AI expertise across the organization',
      'Enhance AI governance with comprehensive risk management',
      'Deepen integration of AI into core business operations'
    ]
  },
  {
    range: [3.41, 4.2],
    level: 'Advanced',
    title: 'Advanced AI Maturity',
    description: 'Your organization demonstrates advanced AI capabilities with sophisticated technologies, strong talent, and significant business transformation.',
    recommendations: [
      'Ensure AI strategy adapts to emerging technologies and market changes',
      'Optimize data ecosystems for AI innovation',
      'Create centers of excellence to drive AI innovation',
      'Lead in responsible AI with proactive governance',
      'Expand AI-driven business model innovation'
    ]
  },
  {
    range: [4.21, 5],
    level: 'Leading',
    title: 'Leading AI Maturity',
    description: 'Your organization is an AI leader with cutting-edge capabilities, industry-leading practices, and AI at the core of business operations.',
    recommendations: [
      'Drive industry standards and best practices in AI',
      'Pioneer new AI techniques and applications',
      'Nurture an AI-first culture across the organization',
      'Shape AI policy and ethical frameworks',
      'Continuously reinvent business models through AI innovation'
    ]
  }
];

/**
 * Get the maturity level based on the average score
 * @param {number} averageScore - The average score across all dimensions
 * @returns {Object} The maturity level object
 */
export function getMaturityLevel(averageScore) {
  return maturityLevels.find(level => 
    averageScore >= level.range[0] && averageScore <= level.range[1]
  ) || maturityLevels[0];
}

/**
 * Calculate the overall score from dimension values
 * @param {Array} values - Array of dimension values (1-5)
 * @returns {number} The average score
 */
export function calculateOverallScore(values) {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Get benchmark data for a specific industry
 * @param {string} industry - The industry name
 * @returns {Array} The benchmark values for each dimension
 */
export function getIndustryBenchmark(industry) {
  return industryBenchmarks[industry] || industryBenchmarks['Average'];
}

export default {
  dimensions,
  industryBenchmarks,
  maturityLevels,
  getMaturityLevel,
  calculateOverallScore,
  getIndustryBenchmark
}; 