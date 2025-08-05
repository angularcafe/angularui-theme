import { Component, inject } from '@angular/core';
import { ThemeService } from 'theme';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html'
})
export class App {
  private themeService = inject(ThemeService);

  // Theme signals
  protected readonly currentTheme = this.themeService.theme;
  protected readonly resolvedTheme = this.themeService.resolvedTheme;
  protected readonly systemTheme = this.themeService.systemTheme;

  // Theme methods
  protected toggleTheme() {
    this.themeService.toggle();
  }

  protected setTheme(theme: 'light' | 'dark' | 'system') {
    this.themeService.setTheme(theme);
  }
}
