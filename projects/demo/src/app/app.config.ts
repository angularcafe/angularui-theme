import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideUiTheme } from 'theme';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideUiTheme({
      strategy: 'class',
      storageKey: 'demo-theme'
    }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes)
  ]
};
