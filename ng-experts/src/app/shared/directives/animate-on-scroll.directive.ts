import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true
})
export class AnimateOnScroll implements OnInit, OnDestroy {
  @Input() animClass: string = 'anim-fade-up';
  @Input() animDelay: number = 0;
  @Input() animThreshold: number = 0.15;

  private observer!: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const el = this.el.nativeElement;
    el.classList.add('anim-hidden');
    if (this.animDelay > 0) {
      el.style.transitionDelay = `${this.animDelay}ms`;
      el.style.animationDelay = `${this.animDelay}ms`;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove('anim-hidden');
          el.classList.add(this.animClass);
          this.observer.unobserve(el);
        }
      },
      { threshold: this.animThreshold }
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
