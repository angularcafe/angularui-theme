import { inject, InjectionToken } from '@angular/core';
import { ThemeConfig, ValidatedThemeConfig } from './theme.types';

export const THEME_CONFIG = new InjectionToken<ThemeConfig>('ThemeConfig');

export function validateConfig(config: any): void {
  const validThemes = ['light', 'dark', 'system'];
  const validStrategies = ['attribute', 'class'];

  if (config.defaultTheme && !validThemes.includes(config.defaultTheme)) {
    console.warn(`Invalid defaultTheme: ${config.defaultTheme}. Using 'system' as fallback.`);
    config.defaultTheme = 'system';
  }

  if (config.strategy && !validStrategies.includes(config.strategy)) {
    console.warn(`Invalid strategy: ${config.strategy}. Using 'attribute' as fallback.`);
    config.strategy = 'attribute';
  }

  if (config.storageKey && typeof config.storageKey !== 'string') {
    console.warn(`Invalid storageKey: ${config.storageKey}. Using 'theme' as fallback.`);
    config.storageKey = 'theme';
  }

  if (config.forcedTheme && !validThemes.includes(config.forcedTheme)) {
    console.warn(`Invalid forcedTheme: ${config.forcedTheme}. Ignoring forced theme.`);
    config.forcedTheme = undefined;
  }
}

export function initializeConfig(): ValidatedThemeConfig {
  const injectedConfig = inject(THEME_CONFIG, { optional: true });
  const defaultConfig: ValidatedThemeConfig = {
    defaultTheme: 'system',
    storageKey: 'theme',
    strategy: 'attribute',
    enableAutoInit: true,
    enableColorScheme: true,
    enableSystem: true,
    forcedTheme: undefined
  };
  
  const mergedConfig = { ...defaultConfig, ...injectedConfig };
  validateConfig(mergedConfig);
  return mergedConfig;
} 