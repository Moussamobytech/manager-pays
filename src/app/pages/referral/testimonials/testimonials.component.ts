import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'referal-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss']
})
export class TestimonialsComponent implements OnInit {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  testimonials = [
    {name: 'Ali',description: 'A parrainé 20 amis et a déjà gagné 70 000 F de commissions. 💸',medal: 'warn'},
    {name: 'Mariam',description: 'A invité 25 amis et a gagné la somme impressionnante de 85 000 F de commissions. 🌟',medal: 'primary'},
    {name: 'Fanta',description: 'Avec 16 amis invités, elle a gagné 60 000 F. 🎉',medal: 'fid_green'},
    {name: 'Abdoul',description: 'Superstar avec 30 amis parrainés, il a empoché 110 000 F. 🔥',medal: 'primary'},
  ];

  constructor() { }

  ngOnInit() {
    let scrollAmount = 0;

    setInterval(() => {
      if (this.scrollContainer) {
        const container = this.scrollContainer.nativeElement;
        const scrollWidth = container.scrollWidth - container.clientWidth; // Maximum scrollable width

        // Determine the scroll step based on screen size
        const scrollStep = window.innerWidth >= 1024
          ? 350 // Desktop
          : window.innerWidth >= 768
          ? 240 // Tablet
          : 285; // Mobile

        container.scrollBy({ left: scrollStep, behavior: 'smooth' });
        scrollAmount += scrollStep;

        if (scrollAmount >= scrollWidth) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
          scrollAmount = 0;
        }
      }
    }, 3000);
  }


}
