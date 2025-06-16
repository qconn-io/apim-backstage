# Custom UI Theme Documentation

This document explains the custom UI theme implementation for the API Management Platform Backstage application.

## Overview

The custom theme system provides a modern, professional appearance specifically designed for enterprise API management platforms. It features:

- **Stunning Dark Theme**: Primary theme with deep slate backgrounds and vibrant accent colors
- **Professional Light Theme**: Clean alternative with excellent readability
- **Modular Architecture**: Easy to remove or modify without affecting core functionality
- **Enterprise Branding**: API management-focused design elements
- **Accessibility**: Proper contrast ratios and focus states

## Theme Components

### 1. Custom Themes (`src/themes/apimTheme.ts`)

- **apimDarkTheme**: Modern dark theme with gradient backgrounds and glass-morphism effects
- **apimLightTheme**: Clean light alternative
- Colors:
  - Primary: Indigo (#6366f1)
  - Secondary: Cyan (#06b6d4)
  - Success: Emerald (#10b981)
  - Warning: Amber (#f59e0b)
  - Error: Red (#ef4444)

### 2. Custom Home Page (`src/components/home/CustomHomePage.tsx`)

Features:
- Hero section with gradient background
- Platform statistics dashboard
- Quick action cards with hover effects
- Modern card layouts with backdrop filters
- Responsive design for all screen sizes

### 3. Theme Provider (`src/components/theme/`)

- **CustomThemeProvider**: Main theme wrapper
- **ThemeToggle**: Floating action button for theme switching
- Modular system that can be easily removed

### 4. Custom Logo (`src/components/Root/CustomLogo.tsx`)

- Modern API Platform branding
- Full and icon variants
- Gradient text effects

### 5. Custom Styles (`src/styles/custom.css`)

- Inter font for better typography
- Smooth animations and transitions
- Custom scrollbars
- Accessibility enhancements
- Mobile responsiveness

## Features

### Visual Enhancements

1. **Gradient Backgrounds**: Subtle gradients throughout the interface
2. **Glass-morphism Effects**: Backdrop blur and transparency
3. **Smooth Animations**: Hover effects and transitions
4. **Modern Typography**: Inter font with proper font weights
5. **Card Hover Effects**: Lift and glow effects on interactive elements

### Functional Features

1. **Theme Toggle**: Floating button to switch between dark and light themes
2. **Custom Dashboard**: Enhanced home page with API management focus
3. **Responsive Design**: Works on all device sizes
4. **Accessibility**: Proper focus states and contrast ratios

## Installation

The theme is already integrated into the application. No additional installation is required.

## Configuration

### Customizing Colors

Edit `src/themes/apimTheme.ts` to change the color palette:

```typescript
const apimColors = {
  primary: {
    main: '#6366f1', // Change primary color
  },
  secondary: {
    main: '#06b6d4', // Change secondary color
  },
  // ... other colors
};
```

### Customizing Home Page

Edit `src/components/home/CustomHomePage.tsx` to modify:
- Platform statistics
- Quick action cards
- Hero section content
- Layout structure

### Adding Custom Styles

Add new styles to `src/styles/custom.css` or create new CSS files and import them in `src/index.tsx`.

## Removing the Custom Theme

To completely remove the custom theme and revert to default Backstage styling:

### Step 1: Update App.tsx

```typescript
// Remove these imports
import { CustomHomePage } from './components/home/CustomHomePage';
import { CustomThemeProvider } from './components/theme/CustomThemeProvider';

// Change the route back to default
<Route path="/" element={<Navigate to="catalog" />} />

// Remove theme provider wrapper
export default app.createRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);
```

### Step 2: Update Root.tsx

```typescript
// Change back to original logos
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';

// In the component:
{isOpen ? <LogoFull /> : <LogoIcon />}
```

### Step 3: Remove Custom Files

Delete these directories and files:
- `src/themes/`
- `src/components/theme/`
- `src/components/home/`
- `src/components/Root/CustomLogo.tsx`
- `src/styles/custom.css`

### Step 4: Update index.tsx

```typescript
// Remove custom CSS import
import './styles/custom.css'; // Remove this line
```

## Browser Support

The theme supports all modern browsers:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance

The theme is optimized for performance:
- Minimal CSS bundle size
- Efficient React components
- Hardware-accelerated animations
- Optimized font loading

## Accessibility

The theme meets WCAG 2.1 AA standards:
- Proper color contrast ratios
- Focus indicators
- Screen reader support
- Keyboard navigation

## Mobile Support

Fully responsive design with:
- Mobile-first CSS
- Touch-friendly interactions
- Optimized layouts for small screens
- Reduced animations on mobile

## Customization Examples

### Change Primary Color to Purple

```typescript
// In src/themes/apimTheme.ts
primary: {
  main: '#8b5cf6', // Purple
},
```

### Add New Quick Action

```typescript
// In src/components/home/CustomHomePage.tsx
const quickActions = [
  // ... existing actions
  {
    title: 'New Feature',
    description: 'Access new platform feature',
    emoji: '⭐',
    color: '#8b5cf6',
    href: '/new-feature',
  },
];
```

### Customize Platform Stats

```typescript
// In src/components/home/CustomHomePage.tsx
const platformStats = [
  { label: 'Total APIs', value: '324', trend: '+15%' },
  { label: 'Daily Requests', value: '1.2M', trend: '+18%' },
  // ... customize as needed
];
```

## Troubleshooting

### Theme Not Applying

1. Check if `CustomThemeProvider` is properly wrapping the app
2. Verify CSS imports in `index.tsx`
3. Clear browser cache

### Performance Issues

1. Check for CSS animation overrides
2. Verify backdrop-filter browser support
3. Consider reducing animation complexity

### Accessibility Issues

1. Test with screen readers
2. Verify color contrast ratios
3. Check keyboard navigation

## Contributing

To contribute to the theme:

1. Follow the existing code structure
2. Maintain accessibility standards
3. Test on multiple browsers and devices
4. Document any new features
5. Keep the modular architecture intact

## Future Enhancements

Planned improvements:
- Additional theme variants
- More customization options
- Enhanced animations
- Better mobile experience
- Theme persistence across sessions
