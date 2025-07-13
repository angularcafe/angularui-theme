import { Provider, EnvironmentProviders, provideAppInitializer, inject } from '@angular/core';
import { ThemeService } from './theme.service';
import { THEME_CONFIG } from './theme.config';
import type { ThemeConfig } from './theme.types';

export function provideUiTheme(config?: ThemeConfig): (Provider | EnvironmentProviders)[] {
  return [
    ...(config ? [{ provide: THEME_CONFIG, useValue: config }] : []),
    ...(config?.enableAutoInit !== false ? [
      provideAppInitializer(() => {
        const themeService = inject(ThemeService);
        themeService.initialize();
        return Promise.resolve();
      })
    ] : [])
  ];
} 