# @angularui/theme

[![npm version](https://badge.fury.io/js/%40angularui%2Ftheme.svg)](https://badge.fury.io/js/%40angularui%2Ftheme)
[![Downloads](https://img.shields.io/npm/dm/@angularui/theme.svg)](https://www.npmjs.com/package/@angularui/theme)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modern Theme Management for Angular - A lightweight, feature-rich theme library with automatic dark mode detection, SSR support, and zero configuration required.

**🌐 [Live Demo](https://angularcafe.github.io/angularui-theme/)**

## 🌟 Features

- **🎨 Automatic Theme Detection** - Supports light, dark, and system themes with OS preference detection
- **⚡ Angular 20 Signals** - Built with modern Angular signals for optimal performance and reactivity
- **🖥️ SSR Compatible** - Works perfectly with Angular SSR and server-side rendering
- **🎯 Zero Configuration** - Works out of the box with sensible defaults
- **🔧 Flexible Strategy** - Choose between class-based or attribute-based theming
- **📦 Tiny Bundle** - Lightweight with no unnecessary dependencies
- **🛡️ Production Ready** - Comprehensive error handling and memory leak prevention
- **♿ Accessibility Friendly** - Respects user preferences and system settings
- **🚀 Performance Optimized** - Efficient DOM updates and minimal re-renders
- **🔒 Type Safe** - Full TypeScript support with strict type checking
- **🧪 Tested** - Comprehensive test coverage for reliability
- **📚 Well Documented** - Extensive documentation with real-world examples
- **⚙️ Modern Architecture** - Uses Angular's app initializer for clean, testable initialization

## 🚀 Quick Start

### Installation

```bash
npm install @angularui/theme
```

### Basic Setup

Add the theme provider to your `app.config.ts`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideUiTheme } from '@angularui/theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideUiTheme()
  ]
};
```

### Use in Components

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from '@angularui/theme';

@Component({
  selector: 'app-header',
  template: `
    <header>
      <h1>My App</h1>
      <button (click)="toggleTheme()">Toggle Theme</button>
      <p>Current theme: {{ themeService.theme() }}</p>
      <p>Resolved theme: {{ themeService.resolvedTheme() }}</p>
    </header>
  `
})
export class HeaderComponent {
  private themeService = inject(ThemeService);

  toggleTheme() {
    this.themeService.toggle();
  }
}
```

### Add CSS for Theming

```css
/* Default styles (light theme) */
:root {
  --bg-color: #ffffff;
  --text-color: #000000;
  --primary-color: #3b82f6;
}

/* Dark theme styles */
.dark {
  --bg-color: #1f2937;
  --text-color: #f9fafb;
  --primary-color: #60a5fa;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### How to Prevent Theme Flash (FOUC) with an Inline Script
Add this **inline** script to your `index.html` `<head>`:
```html
<script>
(function(){'use strict';try{var t=localStorage.getItem('theme')||'system',e=t==='system'?window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light':t==='light'||t==='dark'?t:'light',n=document.documentElement;if(n){n.classList.remove('light','dark'),e==='dark'?(n.classList.add('dark'),n.setAttribute('data-theme','dark')):(n.classList.remove('dark'),n.removeAttribute('data-theme')),n.style.colorScheme=e}}catch(e){try{var n=document.documentElement;n&&(n.classList.remove('light','dark'),n.removeAttribute('data-theme'),n.style.colorScheme='light')}catch(e){}}})();
</script>
```
**Why inline?** Angular does not provide a way to inject scripts into the HTML `<head>` at build time. For true FOUC prevention, the script must run immediately as the HTML is parsed—before any content is rendered. External scripts or Angular providers/services run too late to prevent a flash. This is why the script must be copied directly into your `index.html` head.

## Why @angularui/theme?

- Native Angular integration: signals, DI, and standalone components
- TypeScript-first and future-proof (Angular 20+ ready)
- Clean, testable architecture (app initializer pattern)
- Consistent, standardized theming across apps
- Excellent developer experience (autocomplete, IDE support)
- Performance optimized and tree-shakeable
- Well-documented, maintainable, and enterprise-ready

## 🏗️ Modern Architecture

### App Initializer Pattern

@angularui/theme uses Angular's `provideAppInitializer()` for clean, testable initialization:

```typescript
// Traditional approach (other libraries)
constructor() {
  this.initialize(); // Side effects in constructor
}

// @angularui/theme approach
provideAppInitializer(() => {
  const themeService = inject(ThemeService);
  themeService.initialize(); // Clean, controlled initialization
  return Promise.resolve();
})
```

### Benefits of This Approach:

- **🔄 Testable** - Can test service without auto-initialization
- **⚡ Performant** - No constructor side effects
- **🎯 Controlled** - Can conditionally initialize based on app state
- **🧹 Clean** - Separation of concerns
- **🔧 Flexible** - Manual initialization when needed
- **📚 Modern** - Follows Angular 20+ best practices

## 📖 Configuration Options

```typescript
interface ThemeConfig {
  defaultTheme?: 'light' | 'dark' | 'system';  // Default: 'system'
  storageKey?: string;                         // Default: 'theme'
  strategy?: 'attribute' | 'class';            // Default: 'attribute'
  enableAutoInit?: boolean;                    // Default: true
  enableColorScheme?: boolean;                 // Default: true
  enableSystem?: boolean;                      // Default: true
  forcedTheme?: 'light' | 'dark' | 'system';  // Default: undefined
}
```

### Configuration Examples

#### Tailwind CSS Integration
```typescript
provideUiTheme({
  strategy: 'class'
})
```

#### Custom Storage Key
```typescript
provideUiTheme({
  storageKey: 'my-app-theme'
})
```

#### Disable System Detection
```typescript
provideUiTheme({
  enableSystem: false
})
```

#### Forced Theme (for demos)
```typescript
provideUiTheme({
  forcedTheme: 'dark'
})
```

## 🔧 API Reference

### ThemeService

The main service that manages theme state using Angular signals.

#### Properties

- `theme()` - Readonly signal for current theme setting
- `systemTheme()` - Readonly signal for system theme preference
- `resolvedTheme()` - Computed signal for the actual applied theme
- `initialized` - Boolean property indicating if service is initialized
- `isForced` - Boolean property indicating if forced theme is active

#### Methods

- `setTheme(theme: 'light' | 'dark' | 'system')` - Set the theme
- `toggle()` - Cycle through themes (light → dark → system)
- `isDark()` - Check if current theme is dark
- `isLight()` - Check if current theme is light
- `isSystem()` - Check if using system theme
- `getConfig()` - Get current configuration
- `cleanup()` - Manual cleanup (automatically called on destroy)

### Example Usage

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from '@angularui/theme';

@Component({
  selector: 'app-example',
  template: `
    <div>
      <h1>Theme Demo</h1>
      
      <div class="theme-info">
        <p>Current setting: {{ themeService.theme() }}</p>
        <p>System preference: {{ themeService.systemTheme() }}</p>
        <p>Applied theme: {{ themeService.resolvedTheme() }}</p>
        <p>Is dark mode: {{ themeService.isDark() ? 'Yes' : 'No' }}</p>
      </div>

      <div class="theme-controls">
        <button (click)="themeService.setTheme('light')">Light</button>
        <button (click)="themeService.setTheme('dark')">Dark</button>
        <button (click)="themeService.setTheme('system')">System</button>
        <button (click)="themeService.toggle()">Toggle</button>
      </div>
    </div>
  `
})
export class ExampleComponent {
  private themeService = inject(ThemeService);
}
```

## 🔄 Lifecycle Management

The ThemeService automatically handles cleanup when the application is destroyed. However, you can also manually manage the lifecycle:

### Manual Cleanup

```typescript
import { Component, inject, OnDestroy } from '@angular/core';
import { ThemeService } from '@angularui/theme';

@Component({
  selector: 'app-example',
  template: `...`
})
export class ExampleComponent implements OnDestroy {
  private themeService = inject(ThemeService);

  ngOnDestroy() {
    // Manual cleanup (optional - automatic cleanup is handled)
    this.themeService.cleanup();
  }
}
```

### Configuration Access

```typescript
// Get current configuration
const config = this.themeService.getConfig();
console.log('Current config:', config);
```

## 🎨 Theming Strategies

### Class Strategy (Recommended for Tailwind)

```typescript
provideUiTheme({
  strategy: 'class'
})
```

```css
/* CSS */
.dark {
  --bg-color: #1f2937;
  --text-color: #f9fafb;
}
```

```html
<!-- HTML -->
<html class="dark">
  <!-- Dark theme applied -->
</html>
```

### Attribute Strategy (CSS Variables)

```typescript
provideUiTheme({
  strategy: 'attribute'
})
```

```css
/* CSS */
[data-theme="dark"] {
  --bg-color: #1f2937;
  --text-color: #f9fafb;
}
```

```html
<!-- HTML -->
<html data-theme="dark">
  <!-- Dark theme applied -->
</html>
```

## 🖥️ SSR Support

The package automatically handles SSR scenarios:

- **Server-side rendering** - Uses default values for consistent rendering
- **Hydration safety** - Prevents mismatches between server and client
- **Client-side activation** - Loads saved preferences and applies them
- **No additional configuration** needed for Angular SSR

## 🚀 Advanced Usage

### Manual Initialization

```typescript
provideUiTheme({
  enableAutoInit: false
})

// In your component
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);
  
  ngOnInit() {
    // Initialize when ready
    this.themeService.initialize();
  }
}
```

### Conditional Initialization

```typescript
provideUiTheme({
  enableAutoInit: false
})

// Initialize based on conditions
ngOnInit() {
  if (this.shouldInitializeTheme()) {
    this.themeService.initialize();
  }
}
```

### Custom Theme Detection

```typescript
import { effect, inject } from '@angular/core';
import { ThemeService } from '@angularui/theme';

// Listen to theme changes
effect(() => {
  const themeService = inject(ThemeService);
  const theme = themeService.resolvedTheme();
  console.log('Theme changed to:', theme);
  
  // Apply custom logic
  if (theme === 'dark') {
    // Dark theme specific logic
  }
});
```

## 📦 Bundle Size

- **Core package**: ~13KB (raw) / ~3KB (gzipped)
- **Zero external dependencies** - Only Angular core and common
- **Tree-shakeable** - Unused features are removed

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork** this repository.
2. **Create a new branch** for your feature or fix.
3. **Make your changes** and ensure all tests pass.
4. **Open a Pull Request** with a clear description of your changes.

Please review our [Contributing Guide](CONTRIBUTING.md) before submitting your PR.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [next-themes](https://github.com/pacocoursey/next-themes)
- Built with [Angular](https://angular.io/)

---

**Made with ❤️ for the Angular community**

**Created by [@immohammadjaved](https://x.com/immohammadjaved)**
