import { Injectable, inject, PLATFORM_ID, InjectionToken, signal, computed, effect, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

export type ThemeStrategy = 'attribute' | 'class';

export interface ThemeConfig {
  defaultTheme?: Theme;
  storageKey?: string;
  strategy?: ThemeStrategy;
  enableAutoInit?: boolean;
  enableColorScheme?: boolean;
  enableSystem?: boolean;
  forcedTheme?: Theme;
}

export const THEME_CONFIG = new InjectionToken<ThemeConfig>('ThemeConfig');

@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly config: Required<Omit<ThemeConfig, 'forcedTheme'>> & { forcedTheme?: Theme } = (() => {
    const injectedConfig = inject(THEME_CONFIG, { optional: true });
    const defaultConfig: Required<Omit<ThemeConfig, 'forcedTheme'>> & { forcedTheme?: Theme } = {
      defaultTheme: 'system',
      storageKey: 'theme',
      strategy: 'attribute',
      enableAutoInit: true,
      enableColorScheme: true,
      enableSystem: true,
      forcedTheme: undefined
    };
    
    const mergedConfig = { ...defaultConfig, ...injectedConfig };
    
    // Validate configuration
    this.validateConfig(mergedConfig);
    
    return mergedConfig;
  })();

  private storage: Storage | null = null;
  private mediaQuery: MediaQueryList | null = null;
  private isInitialized = false;
  private isDestroyed = false;
  private lastAppliedTheme: 'light' | 'dark' | null = null;

  // Signals
  private themeSignal = signal<Theme>('system');
  private systemThemeSignal = signal<'light' | 'dark'>('light');

  // Computed signals
  readonly theme = this.themeSignal.asReadonly();
  readonly systemTheme = this.systemThemeSignal.asReadonly();
  readonly resolvedTheme = computed(() => {
    // If forced theme is set, always return it
    if (this.config.forcedTheme && this.config.forcedTheme !== 'system') {
      return this.config.forcedTheme;
    }
    
    const theme = this.themeSignal();
    // Only use system theme if enabled, otherwise fall back to light
    if (theme === 'system' && this.config.enableSystem) {
      return this.systemThemeSignal();
    }
    return theme === 'system' ? 'light' : theme;
  });

  /**
   * Initialize the theme service
   * This method can be called manually or by the app initializer
   */
  initialize(): void {
    if (this.isInitialized) {
      console.warn('ThemeService is already initialized');
      return;
    }

    if (this.isDestroyed) {
      console.warn('ThemeService has been destroyed and cannot be initialized');
      return;
    }

    try {
      if (isPlatformBrowser(this.platformId)) {
        this.setupStorage();
        this.setupMediaQuery();
        this.loadTheme();
      } else {
        // SSR fallback - use default theme to prevent hydration mismatch
        this.themeSignal.set(this.config.defaultTheme);
        this.systemThemeSignal.set('light');
      }

      this.setupEffects();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize ThemeService:', error);
      // Fallback to safe defaults
      this.themeSignal.set('light');
      this.systemThemeSignal.set('light');
      this.isInitialized = true;
    }
  }

  /**
   * Check if the theme service is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Check if a forced theme is currently active
   */
  get isForced(): boolean {
    return !!this.config.forcedTheme;
  }

  /**
   * Clean up resources when service is destroyed
   */
  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.cleanup();
  }

  /**
   * Manual cleanup method
   */
  cleanup(): void {
    try {
      if (this.mediaQuery) {
        this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange.bind(this));
        this.mediaQuery = null;
      }
    } catch (error) {
      console.warn('Error during ThemeService cleanup:', error);
    }
  }

  private validateConfig(config: any): void {
    // Validate defaultTheme
    if (config.defaultTheme && !['light', 'dark', 'system'].includes(config.defaultTheme)) {
      console.warn(`Invalid defaultTheme: ${config.defaultTheme}. Using 'system' as fallback.`);
      config.defaultTheme = 'system';
    }

    // Validate strategy
    if (config.strategy && !['attribute', 'class'].includes(config.strategy)) {
      console.warn(`Invalid strategy: ${config.strategy}. Using 'attribute' as fallback.`);
      config.strategy = 'attribute';
    }

    // Validate storageKey
    if (config.storageKey && typeof config.storageKey !== 'string') {
      console.warn(`Invalid storageKey: ${config.storageKey}. Using 'theme' as fallback.`);
      config.storageKey = 'theme';
    }

    // Validate forcedTheme
    if (config.forcedTheme && !['light', 'dark', 'system'].includes(config.forcedTheme)) {
      console.warn(`Invalid forcedTheme: ${config.forcedTheme}. Ignoring forced theme.`);
      config.forcedTheme = undefined;
    }
  }

  private setupStorage(): void {
    try {
      // Test if localStorage is available and working
      const testKey = '__theme_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.storage = localStorage;
    } catch (error) {
      console.warn('localStorage is not available, theme preferences will not be persisted:', error);
      this.storage = null;
    }
  }

  private setupMediaQuery(): void {
    try {
      if (typeof window !== 'undefined' && 
          window.matchMedia && 
          this.config.enableSystem && 
          !this.isDestroyed) {
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
        this.updateSystemTheme();
      }
    } catch (error) {
      console.warn('Failed to setup media query for system theme detection:', error);
    }
  }

  private handleSystemThemeChange(): void {
    if (!this.isDestroyed) {
      this.updateSystemTheme();
    }
  }

  private updateSystemTheme(): void {
    try {
      if (this.mediaQuery && !this.isDestroyed) {
        const systemTheme: 'light' | 'dark' = this.mediaQuery.matches ? 'dark' : 'light';
        this.systemThemeSignal.set(systemTheme);
      }
    } catch (error) {
      console.warn('Failed to update system theme:', error);
    }
  }

  private loadTheme(): void {
    if (!this.storage) return;

    try {
      const storedTheme = this.storage.getItem(this.config.storageKey);
      
      // Validate stored theme value
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        this.themeSignal.set(storedTheme as Theme);
      } else {
        // Invalid stored value, use default
        this.themeSignal.set(this.config.defaultTheme);
        // Clean up invalid storage
        if (storedTheme) {
          this.storage.removeItem(this.config.storageKey);
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
      this.themeSignal.set(this.config.defaultTheme);
    }
  }

  private setupEffects(): void {
    // Effect to apply theme changes to DOM with performance optimization
    effect(() => {
      const resolvedTheme = this.resolvedTheme();
      
      // Only apply theme if it actually changed
      if (resolvedTheme !== this.lastAppliedTheme) {
        this.applyTheme(resolvedTheme);
        this.lastAppliedTheme = resolvedTheme;
      }
    });

    // Effect to save theme changes to storage (only if not forced)
    effect(() => {
      const theme = this.themeSignal();
      if (this.storage && 
          isPlatformBrowser(this.platformId) && 
          !this.config.forcedTheme && 
          !this.isDestroyed) {
        try {
          this.storage.setItem(this.config.storageKey, theme);
        } catch (error) {
          console.warn('Failed to save theme to storage:', error);
        }
      }
    });
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    if (!isPlatformBrowser(this.platformId) || this.isDestroyed) return;

    try {
      const element = document.documentElement;

      if (this.config.strategy === 'class') {
        this.applyClassTheme(element, theme);
      } else {
        this.applyAttributeTheme(element, theme);
      }

      // Apply color-scheme if enabled
      if (this.config.enableColorScheme) {
        this.applyColorScheme(element, theme);
      }
    } catch (error) {
      console.error('Failed to apply theme:', error);
    }
  }

  private applyClassTheme(element: HTMLElement, theme: 'light' | 'dark'): void {
    try {
      // Only apply/remove the dark class
      // Light theme is the default, so no class needed
      if (theme === 'dark') {
        element.classList.add('dark');
      } else {
        element.classList.remove('dark');
      }
    } catch (error) {
      console.warn('Failed to apply class theme:', error);
    }
  }

  private applyAttributeTheme(element: HTMLElement, theme: 'light' | 'dark'): void {
    try {
      // Only set attribute for dark theme
      // Light theme is the default, so no attribute needed
      if (theme === 'dark') {
        element.setAttribute('data-theme', 'dark');
      } else {
        element.removeAttribute('data-theme');
      }
    } catch (error) {
      console.warn('Failed to apply attribute theme:', error);
    }
  }

  private applyColorScheme(element: HTMLElement, theme: 'light' | 'dark'): void {
    try {
      // Set color-scheme CSS property for browser UI consistency
      element.style.colorScheme = theme;
    } catch (error) {
      console.warn('Failed to apply color scheme:', error);
    }
  }

  setTheme(theme: Theme): void {
    if (this.isDestroyed) {
      console.warn('ThemeService has been destroyed');
      return;
    }

    const validThemes = ['light', 'dark', ...(this.config.enableSystem ? ['system'] : [])];
    
    if (!validThemes.includes(theme)) {
      console.warn(`Theme "${theme}" is not supported. Available themes: ${validThemes.join(', ')}`);
      return;
    }
    
    // Don't allow theme changes if forced theme is set
    if (this.config.forcedTheme) {
      console.warn('Theme cannot be changed while forced theme is active');
      return;
    }
    
    this.themeSignal.set(theme);
  }

  toggle(): void {
    if (this.isDestroyed) {
      console.warn('ThemeService has been destroyed');
      return;
    }

    // Don't allow toggle if forced theme is set
    if (this.config.forcedTheme) {
      console.warn('Theme cannot be toggled while forced theme is active');
      return;
    }

    try {
      const currentTheme = this.themeSignal();
      const themes: Theme[] = this.config.enableSystem 
        ? ['light', 'dark', 'system'] 
        : ['light', 'dark'];
      const currentIndex = themes.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % themes.length;
      this.themeSignal.set(themes[nextIndex]);
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    }
  }

  // Utility methods
  isDark(): boolean {
    return this.resolvedTheme() === 'dark';
  }

  isLight(): boolean {
    return this.resolvedTheme() === 'light';
  }

  isSystem(): boolean {
    return this.themeSignal() === 'system';
  }

  // Get current configuration for debugging
  getConfig(): ThemeConfig {
    return { 
      defaultTheme: this.config.defaultTheme,
      storageKey: this.config.storageKey,
      strategy: this.config.strategy,
      enableAutoInit: this.config.enableAutoInit,
      enableColorScheme: this.config.enableColorScheme,
      enableSystem: this.config.enableSystem,
      forcedTheme: this.config.forcedTheme
    };
  }
} 