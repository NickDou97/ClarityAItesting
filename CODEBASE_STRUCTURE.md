# ClarityAI Codebase Structure

This document provides an overview of the ClarityAI website codebase structure and organization.

## Directory Structure

```
/
├── css/                    # CSS styles
│   ├── base/               # Base styles (variables, typography, reset)
│   ├── components/         # Component-specific styles
│   ├── layouts/            # Layout styles
│   ├── styles.css          # Main stylesheet
│   └── assessment.css      # Assessment-specific styles
│
├── js/                     # JavaScript files
│   ├── components/         # UI components
│   ├── models/             # Data models
│   ├── utils/              # Utility functions
│   ├── main.js             # Main site JavaScript
│   ├── assessment.js       # Assessment tool JavaScript
│   └── netlify-integration.js # Netlify-specific integrations
│
├── img/                    # Image assets
│
├── netlify/                # Netlify configuration
│   ├── edge-functions/     # Netlify Edge Functions
│   ├── functions/          # Netlify Serverless Functions
│   └── scheduled-functions/ # Netlify Scheduled Functions
│
├── variant-b/              # A/B testing variant
│
├── index.html              # Main homepage
├── ai-assessment.html      # AI Assessment tool
├── sample-assessment.html  # Sample assessment results
├── success.html            # Form submission success page
├── netlify.toml            # Netlify configuration
├── site.webmanifest        # PWA manifest
├── service-worker.js       # Service worker for offline support
├── robots.txt              # Search engine directives
├── _redirects              # Netlify redirects
└── favicon files           # Various favicon files
```

## Key Files

- **index.html**: Main landing page
- **ai-assessment.html**: Interactive AI maturity assessment tool
- **styles.css**: Main stylesheet that imports modular CSS components
- **main.js**: Core JavaScript functionality for the site
- **assessment.js**: JavaScript for the assessment tool
- **netlify.toml**: Configuration for Netlify deployment and features

## CSS Organization

The CSS follows a modular approach:

1. **Base**: Foundational styles like variables, typography, and reset
2. **Components**: Styles for specific UI components
3. **Layouts**: Styles for page layouts and sections

## JavaScript Organization

The JavaScript is organized into:

1. **Components**: Reusable UI components
2. **Models**: Data structures and business logic
3. **Utils**: Helper functions and utilities

## Netlify Integration

The site uses several Netlify features:

1. **Edge Functions**: For A/B testing and personalization
2. **Serverless Functions**: For API endpoints and data processing
3. **Scheduled Functions**: For automated tasks like follow-up emails
4. **Forms**: For handling form submissions without a backend

## Progressive Web App (PWA)

The site is configured as a Progressive Web App with:

1. **Service Worker**: For offline support and caching
2. **Web Manifest**: For installability and app-like experience

## Development Guidelines

1. Keep CSS modular and follow the established organization
2. Use JavaScript modules for better code organization
3. Test changes in multiple browsers before deployment
4. Follow the established naming conventions
5. Document new features and components 