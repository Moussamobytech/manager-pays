import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { emailValidator } from '../../theme/utils/app-validators';
import { AppService } from 'src/app/app.service';
import { Contact } from 'src/app/app.models';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: UntypedFormGroup;

  constructor(public formBuilder: UntypedFormBuilder, public appService : AppService) { }

  ngOnInit() {
   this.initForm();
  }
initForm(){
   this.contactForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      message: ['', Validators.required]
    });
}

  public onContactFormSubmit(): void {

    if (this.contactForm.valid) {
          console.log('1 Contact ajouté avec succès:');

      const values: Contact = this.contactForm.value; // Récupérer les valeurs du formulaire
      console.log(values);
      this.appService.addContact(values).subscribe(
        (response) => {
          console.log('Contact ajouté avec succès:', response);
          // Réinitialiser le formulaire ici si nécessaire
        },
        (error) => {
          console.error('Erreur lors de l\'ajout du contact:', error);
        }
      );
    }
  }

  // public onContactFormSubmit(values:Contact):void {
  //   if (this.contactForm.valid) {
  //     console.log(values);
  //     this.appService.addContact(values).subscribe(
  //       (response) => {
  //         console.log('Contact ajouté avec succès:', response);
  //         // Réinitialiser le formulaire ici si nécessaire
  //       },
  //       (error) => {
  //         console.error('Erreur lors de l\'ajout du contact:', error);
  //       }
  //     );
  //   }
  // }
  public  onContactFormSubmits(): void {
    if (this.contactForm.valid) {
      const values: Contact = this.contactForm.value;
      this.appService.addContact(values).subscribe(
        (response) => {
          console.log('Contact ajouté avec succès:', response);
          // Réinitialiser le formulaire ici si nécessaire
        },
        (error) => {
          console.error('Erreur lors de l\'ajout du contact:', error);
        }
      );
    }
  }

  public onSubmit(){
    console.log(this.contactForm.value);
  }

}
