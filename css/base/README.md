# Base CSS Styles

This directory contains the foundational CSS styles for the project, including variables, typography, and other core styles.

## Files

- `variables.css` - Contains all global CSS variables (colors, spacing, etc.)
- `typography.css` - Contains typography-related styles and utility classes
- `index.css` - Imports all base styles in the correct order

## Usage

You can import all base styles at once:

```css
@import 'base/index.css';
```

Or import individual files as needed:

```css
@import 'base/variables.css';
@import 'base/typography.css';
```

## Typography Classes

The typography system includes various utility classes for text styling:

### Font Size

- `.text-xs` - Extra small text (0.75rem)
- `.text-sm` - Small text (0.875rem)
- `.text-base` - Base text size (1rem)
- `.text-md` - Alias for base text size (1rem)
- `.text-lg` - Large text (1.125rem)
- `.text-xl` - Extra large text (1.25rem)
- `.text-2xl` - 2x large text (1.5rem)
- `.text-3xl` - 3x large text (1.875rem)
- `.text-4xl` - 4x large text (2.25rem)
- `.text-5xl` - 5x large text (3rem)

### Font Weight

- `.font-light` - Light weight (300)
- `.font-normal` - Normal weight (400)
- `.font-medium` - Medium weight (500)
- `.font-semibold` - Semi-bold weight (600)
- `.font-bold` - Bold weight (700)
- `.font-extrabold` - Extra bold weight (800)

### Text Alignment

- `.text-left` - Left aligned text
- `.text-center` - Center aligned text
- `.text-right` - Right aligned text
- `.text-justify` - Justified text

### Text Transformation

- `.uppercase` - All uppercase text
- `.lowercase` - All lowercase text
- `.capitalize` - Capitalize text
- `.normal-case` - Normal case text (no transformation)

### Text Decoration

- `.underline` - Underlined text
- `.line-through` - Strikethrough text
- `.no-underline` - No text decoration

### Line Clamping

- `.line-clamp-1` - Limit text to 1 line
- `.line-clamp-2` - Limit text to 2 lines
- `.line-clamp-3` - Limit text to 3 lines

## Responsive Typography

The typography system includes responsive adjustments for different screen sizes:

- Desktop: Default sizes
- Tablets (max-width: 768px): Slightly reduced heading sizes
- Mobile (max-width: 480px): Further reduced heading sizes

## Print Styles

Typography adjustments for print are also included. 