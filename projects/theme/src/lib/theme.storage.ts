import { Theme, ValidatedThemeConfig } from './theme.types';

export interface StorageManager {
  storage: Storage | null;
  setup(): void;
  loadTheme(config: ValidatedThemeConfig): Theme;
  saveTheme(config: ValidatedThemeConfig, theme: Theme): void;
}

export class LocalStorageManager implements StorageManager {
  storage: Storage | null = null;

  setup(): void {
    try {
      const testKey = '__theme_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.storage = localStorage;
    } catch (error) {
      console.warn('localStorage is not available, theme preferences will not be persisted:', error);
      this.storage = null;
    }
  }

  loadTheme(config: ValidatedThemeConfig): Theme {
    if (!this.storage) return config.defaultTheme;

    try {
      const storedTheme = this.storage.getItem(config.storageKey);
      
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        return storedTheme as Theme;
      } else {
        if (storedTheme) {
          this.storage.removeItem(config.storageKey);
        }
        return config.defaultTheme;
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
      return config.defaultTheme;
    }
  }

  saveTheme(config: ValidatedThemeConfig, theme: Theme): void {
    if (!this.storage) return;

    try {
      this.storage.setItem(config.storageKey, theme);
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  }
} 