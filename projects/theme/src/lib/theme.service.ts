import { Injectable, inject, PLATFORM_ID, signal, computed, effect, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Theme, ThemeConfig } from './theme.types';
import { initializeConfig } from './theme.config';
import { LocalStorageManager } from './theme.storage';
import { SystemThemeManager } from './theme.media';
import { ThemeDomManager } from './theme.dom';

@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly config = initializeConfig();
  
  // Managers
  private readonly storageManager = new LocalStorageManager();
  private readonly mediaManager = new SystemThemeManager();
  private readonly domManager = new ThemeDomManager();
  
  // Private state
  private isInitialized = false;
  private isDestroyed = false;
  private lastAppliedTheme: 'light' | 'dark' | null = null;

  // Signals
  private readonly themeSignal = signal<Theme>('system');
  private readonly systemThemeSignal = signal<'light' | 'dark'>('light');

  // Public readonly signals
  readonly theme = this.themeSignal.asReadonly();
  readonly systemTheme = this.systemThemeSignal.asReadonly();
  readonly resolvedTheme = computed(() => {
    if (this.config.forcedTheme && this.config.forcedTheme !== 'system') {
      return this.config.forcedTheme;
    }
    
    const theme = this.themeSignal();
    return theme === 'system' && this.config.enableSystem 
      ? this.systemThemeSignal() 
      : theme === 'system' ? 'light' : theme;
  });

  // Getters
  get initialized(): boolean {
    return this.isInitialized;
  }

  get isForced(): boolean {
    return !!this.config.forcedTheme;
  }

  // Public methods
  initialize(): void {
    if (this.isInitialized || this.isDestroyed) {
      console.warn(this.isDestroyed ? 'ThemeService has been destroyed' : 'ThemeService is already initialized');
      return;
    }

    try {
      if (isPlatformBrowser(this.platformId)) {
        this.setupManagers();
        this.loadInitialTheme();
      } else {
        // SSR fallback
        this.themeSignal.set(this.config.defaultTheme);
        this.systemThemeSignal.set('light');
      }

      this.setupEffects();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize ThemeService:', error);
      this.setFallbackThemes();
    }
  }

  setTheme(theme: Theme): void {
    if (this.isDestroyed) {
      console.warn('ThemeService has been destroyed');
      return;
    }

    if (this.config.forcedTheme) {
      console.warn('Theme cannot be changed while forced theme is active');
      return;
    }

    const validThemes = ['light', 'dark', ...(this.config.enableSystem ? ['system'] : [])];
    if (!validThemes.includes(theme)) {
      console.warn(`Theme "${theme}" is not supported. Available themes: ${validThemes.join(', ')}`);
      return;
    }
    
    this.themeSignal.set(theme);
  }

  toggle(): void {
    if (this.isDestroyed || this.config.forcedTheme) {
      console.warn(this.isDestroyed ? 'ThemeService has been destroyed' : 'Theme cannot be toggled while forced theme is active');
      return;
    }

    try {
      const currentTheme = this.themeSignal();
      const themes: Theme[] = this.config.enableSystem ? ['light', 'dark', 'system'] : ['light', 'dark'];
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

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.cleanup();
  }

  cleanup(): void {
    try {
      this.mediaManager.removeChangeListener(this.handleSystemThemeChange.bind(this));
      this.mediaManager.cleanup();
    } catch (error) {
      console.warn('Error during ThemeService cleanup:', error);
    }
  }

  // Private methods
  private setupManagers(): void {
    this.storageManager.setup();
    this.mediaManager.setup(this.config);
    this.mediaManager.addChangeListener(this.handleSystemThemeChange.bind(this));
  }

  private loadInitialTheme(): void {
    const loadedTheme = this.storageManager.loadTheme(this.config);
    this.themeSignal.set(loadedTheme);
    
    const systemTheme = this.mediaManager.updateSystemTheme();
    this.systemThemeSignal.set(systemTheme);
  }

  private setFallbackThemes(): void {
    this.themeSignal.set('light');
    this.systemThemeSignal.set('light');
    this.isInitialized = true;
  }

  private handleSystemThemeChange(): void {
    if (!this.isDestroyed) {
      const systemTheme = this.mediaManager.updateSystemTheme();
      this.systemThemeSignal.set(systemTheme);
    }
  }

  // Effects setup
  private setupEffects(): void {
    effect(() => {
      const resolvedTheme = this.resolvedTheme();
      
      if (resolvedTheme !== this.lastAppliedTheme) {
        this.domManager.applyTheme(resolvedTheme, this.config);
        this.lastAppliedTheme = resolvedTheme;
      }
    });

    // Storage effect
    effect(() => {
      const theme = this.themeSignal();
      if (isPlatformBrowser(this.platformId) && 
          !this.config.forcedTheme && 
          !this.isDestroyed) {
        this.storageManager.saveTheme(this.config, theme);
      }
    });
  }
} 