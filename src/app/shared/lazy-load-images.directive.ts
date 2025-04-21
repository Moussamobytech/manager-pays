import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: 'img:not([loading])'
})
export class LazyLoadImagesDirective implements AfterViewInit {
  constructor(private elementRef: ElementRef<HTMLImageElement>) {}

  ngAfterViewInit(): void {
    const supports = 'loading' in HTMLImageElement.prototype;
    if (supports) {
      this.elementRef.nativeElement.setAttribute('loading', 'lazy');
    } else {
      // Check if the lazysizes script is already loaded to prevent duplicate scripts
      if (!document.querySelector('script[src="https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.1.2/lazysizes.min.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.1.2/lazysizes.min.js';
        document.body.appendChild(script);
      }
    }
  }
}
