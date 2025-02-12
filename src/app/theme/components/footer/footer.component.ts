import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from 'express';
import { Newsletter } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';
import { AnalyticsService } from 'src/app/services/analitycs.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
public newsletter: Newsletter[];
contactForm: UntypedFormGroup;

  constructor(public formBuilder: UntypedFormBuilder, public appService : AppService,
    private analitycsService: AnalyticsService) { }

  ngOnInit() {
    this.initForm()
    this.analitycsService.trackEvent('footer loaded', 'footer loaded into view','view');
   }


  initForm(){
    this.contactForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
     });
  }
  public subscribe(): void {
    if (this.contactForm.valid) {
      const email = this.contactForm.get('email').value;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (emailPattern.test(email)) {
        console.log('1 newsletter ajoutée avec succès:');
        const values: Newsletter = this.contactForm.value;
        console.log(values);
        this.appService.addNewsletter(values).subscribe(
          (response) => {
            // console.log('Newsletter ajoutée avec succès:', response);
            this.contactForm.reset();
          },
          (error) => {
            console.error('Erreur lors de l\'ajout de la newsletter:', error);
          }
        );
      } else {
        console.error('Adresse e-mail non valide');
      }
    }
  }

  isOtherRouteActive(): boolean {
    return window.location.href.includes('account-customer')|| window.location.href.includes('account-seller');
  }

}
