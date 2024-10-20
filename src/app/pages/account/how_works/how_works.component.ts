import { Component, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-how_works',
  templateUrl: './how_works.component.html',
  styleUrls: ['./how_works.component.scss']
})
export class HowWorksComponent {
  currentStep = 0;

  steps = [
    {
      title: 'Introduction to Angular',
      videoUrl: this.sanitize('https://www.youtube.com/embed/1'),
      description: 'In this video, we introduce Angular and discuss its core concepts.'
    },
    {
      title: 'Angular Components',
      videoUrl: this.sanitize('https://www.youtube.com/embed/2'),
      description: 'This video explains how Angular components work and how to create them.'
    },
  ];

  constructor(private sanitizer: DomSanitizer) {}

  sanitize(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  scrollToStep(stepIndex: number): void {
    const element = document.getElementById('step' + stepIndex);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const contentElement = document.getElementById('tutorial-content');
    const sections = contentElement?.getElementsByTagName('div');
    if (sections) {
      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
          this.currentStep = i;
          break;
        }
      }
    }
  }
}
