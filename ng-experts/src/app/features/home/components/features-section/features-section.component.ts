import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimateOnScroll } from '@shared/directives/animate-on-scroll.directive';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-features-section',
  templateUrl: './features-section.component.html',
  styleUrls: ['./features-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AnimateOnScroll]
})
export class FeaturesSection implements OnInit, OnDestroy {
  protected readonly lang = inject(LanguageService);

  private _countdownInterval: any = null;
  private _demoExpiry = 0;
  protected readonly countdownTick = signal(Date.now());

  ngOnInit(): void {
    this._demoExpiry = Date.now() + 22 * 60 * 1000;
    this._countdownInterval = setInterval(() => {
      this.countdownTick.set(Date.now());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this._countdownInterval) clearInterval(this._countdownInterval);
  }

  protected getDemoCountdown(): string {
    this.countdownTick();
    const ms = Math.max(0, this._demoExpiry - Date.now());
    if (ms <= 0) return this.lang.t('features.countdown.expired');
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}m ${sec.toString().padStart(2, '0')}s`;
  }

  protected getDemoPercent(): number {
    this.countdownTick();
    const ms = Math.max(0, this._demoExpiry - Date.now());
    const elapsed = 60 * 60 * 1000 - ms;
    return Math.min(100, Math.max(0, (elapsed / (60 * 60 * 1000)) * 100));
  }

  protected isDemoExpiringSoon(): boolean {
    this.countdownTick();
    const ms = Math.max(0, this._demoExpiry - Date.now());
    return ms > 0 && ms < 15 * 60 * 1000;
  }
}
