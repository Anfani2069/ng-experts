import { Injectable, signal } from '@angular/core';
import { FR, EN, Lang, TranslationDict } from '@core/i18n/translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly _lang = signal<Lang>(this.getSavedLang());

  readonly currentLang = this._lang.asReadonly();

  private getSavedLang(): Lang {
    try {
      const saved = localStorage.getItem('ng_experts_lang');
      return saved === 'en' ? 'en' : 'fr';
    } catch {
      return 'fr';
    }
  }

  setLang(lang: Lang): void {
    this._lang.set(lang);
    try {
      localStorage.setItem('ng_experts_lang', lang);
    } catch { /* noop */ }
  }

  toggleLang(): void {
    this.setLang(this._lang() === 'fr' ? 'en' : 'fr');
  }

  t(key: string): string {
    const dict: TranslationDict = this._lang() === 'en' ? EN : FR;
    const parts = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = dict;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') return key;
      current = current[part];
    }
    return typeof current === 'string' ? current : key;
  }

  /** Returns the full nested object at a given prefix (e.g. 'howItWorks.steps') */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get<T = any>(key: string): T {
    const dict: TranslationDict = this._lang() === 'en' ? EN : FR;
    const parts = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = dict;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') return key as unknown as T;
      current = current[part];
    }
    return current as T;
  }
}
