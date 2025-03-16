# JavaScript Utilities

This directory is reserved for utility functions and helper modules that can be shared across the application.

## Purpose

- Provide reusable helper functions
- Maintain DRY (Don't Repeat Yourself) principles
- Centralize common functionality

## Usage

Import utilities in your JavaScript files as needed:

```javascript
import { formatDate } from './utils/date-utils.js';
import { validateEmail } from './utils/validation.js';
```

## Guidelines

When adding new utility functions:

1. Group related functions in a single file
2. Use descriptive file and function names
3. Add JSDoc comments for better documentation
4. Write tests for utility functions when possible 