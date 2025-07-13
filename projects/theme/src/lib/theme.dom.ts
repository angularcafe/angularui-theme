import { ValidatedThemeConfig } from './theme.types';

export interface DomManager {
  applyTheme(theme: 'light' | 'dark', config: ValidatedThemeConfig): void;
}

export class ThemeDomManager implements DomManager {
  applyTheme(theme: 'light' | 'dark', config: ValidatedThemeConfig): void {
    try {
      const element = document.documentElement;

      if (config.strategy === 'class') {
        this.applyClassTheme(element, theme);
      } else {
        this.applyAttributeTheme(element, theme);
      }

      if (config.enableColorScheme) {
        this.applyColorScheme(element, theme);
      }
    } catch (error) {
      console.error('Failed to apply theme:', error);
    }
  }

  private applyClassTheme(element: HTMLElement, theme: 'light' | 'dark'): void {
    try {
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
      element.style.colorScheme = theme;
    } catch (error) {
      console.warn('Failed to apply color scheme:', error);
    }
  }
} 