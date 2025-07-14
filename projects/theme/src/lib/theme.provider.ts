import { Provider, EnvironmentProviders, provideAppInitializer, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from './theme.service';
import { THEME_CONFIG } from './theme.config';
import type { ThemeConfig } from './theme.types';

export function provideUiTheme(config?: ThemeConfig): (Provider | EnvironmentProviders)[] {
  return [
    ...(config ? [{ provide: THEME_CONFIG, useValue: config }] : []),
    ...(config?.enableAutoInit !== false ? [
      provideAppInitializer(() => {
        const platformId = inject(PLATFORM_ID);
        
        // Only initialize in browser environment
        if (isPlatformBrowser(platformId)) {
          const themeService = inject(ThemeService);
          themeService.initialize();
        }
        
        return Promise.resolve();
      })
    ] : [])
  ];
} 