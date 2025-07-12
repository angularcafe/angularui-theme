import { Provider, EnvironmentProviders } from '@angular/core';
import { provideAppInitializer, inject } from '@angular/core';
import { ThemeService, ThemeConfig, THEME_CONFIG } from './theme.service';

/**
 * Provider function to configure the theme service
 * @param config Theme configuration options
 * @returns Provider array for Angular DI
 */
export function provideUiTheme(config?: ThemeConfig): (Provider | EnvironmentProviders)[] {
  return [
    {
      provide: THEME_CONFIG,
      useValue: config || {}
    },
    provideAppInitializer(() => {
      const themeService = inject(ThemeService);
      // Initialize the theme service if enableAutoInit is enabled or not explicitly disabled
      if (config?.enableAutoInit !== false) {
        themeService.initialize();
      }

      return Promise.resolve();
    })
  ];
} 