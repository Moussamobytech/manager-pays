import { Component, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-how_works',
  templateUrl: './how_works.component.html',
  styleUrls: ['./how_works.component.scss']
})
export class HowWorksComponent {

  currentStep = 0;

  steps = [
    {
      title: 'Installation sur mobile',
      videoUrl: this.sanitize('https://www.youtube.com/embed/om4GUAq_TCg?si=Uwr6C3vRnY5tf8VR'),
      description: 'Comment Installer Fidelity-Market sur Votre Telephone (Bambara).'
    },
    {
      title: 'Publications',
      videoUrl: this.sanitize('https://www.youtube.com/embed/ra68vRB8vz4?si=SvcMiDVDt49P_Kan'),
      description: 'Comment Publier Vos Produits sur Fidelity-Market (Bambara).'
    },
    {
      title: 'Achats de Produits',
      videoUrl: this.sanitize('https://www.youtube.com/embed/WnvIhDNisqA?si=k75nitXM-lbPfqif'),
      description: 'Comment Acheter sur Fidelity-Market (Bambara).'
    },
  ];

  constructor(private sanitizer: DomSanitizer, private auth:AuthenticationService) {}

  sanitize(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  scrollToStep(stepIndex: number): void {
    const element = document.getElementById('step' + stepIndex);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Listening the scroll event window
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const contentElement = document.getElementById('steps-container');
    if (contentElement) {
      const steps = contentElement.getElementsByClassName('tutorial-video');

      for (let i = 0; i < steps.length; i++) {
        const rect = steps[i].getBoundingClientRect();

        if (rect.top >= 0 && rect.top < window.innerHeight) {
          this.currentStep = i;
          // document.getElementById('step'+i).click();
          break;
        }
      }
    }
  }
  askHelp() {
    let user:any = this.auth.currentUser;
    let url = "https://wa.me/+22376007979?text=" + encodeURIComponent(
      "bonjour je m'appelle " + user.firstname + ' ' + user.lastname +
      " j'ai besoin d'aide à propos de Fidelity Market."
    );
    window.open(url,"_blank");
  }
}

