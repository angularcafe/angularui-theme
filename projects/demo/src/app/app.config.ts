import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideUiTheme } from '@angularui/theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideUiTheme({
      strategy: 'attribute',
      defaultTheme: 'system',
      enableColorScheme: true
    }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes)
  ]
};
