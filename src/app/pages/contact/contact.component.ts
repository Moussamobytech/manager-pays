import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { emailValidator } from '../../theme/utils/app-validators';
import { AppService } from 'src/app/app.service';
import { Contact } from 'src/app/app.models';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { CountryService } from 'src/app/services/country.service';
import { count } from 'console';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: UntypedFormGroup;
  selectedCountry: any;
  countries:any

  constructor(private countryService: CountryService,private commonService: CommonMessageService,public formBuilder: UntypedFormBuilder, public appService : AppService) { }

  ngOnInit() {
   this.initForm();
   this.getAllPays();
  }
initForm(){
   this.contactForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      message: ['', Validators.required],
      country: ['', Validators.required],
    });
}

  public onContactFormSubmit(): void {

    if (this.contactForm.valid) {
     const phone = this.selectedCountry.indicatif+this.contactForm.get('phoneNumber')?.value;
     this.contactForm.patchValue({ phoneNumber: phone }); // Mettre à jour le numéro de téléphone avec l'indicatif du pays
      const values: Contact = this.contactForm.value; // Récupérer les valeurs du formulaire
      this.appService.addContact(values).subscribe(
        (response) => {

          this.commonService.successToast(response.message || 'Merci pour votre message, nous vous répondrons dans les plus brefs délais.');
          // Réinitialiser le formulaire ici si nécessaire
          //this.contactForm.reset(); 
          window.location.reload(); // Recharger la page pour réinitialiser le formulaire
        

        },
        (error) => {
          this.commonService.errorToast(error.message || 'Erreur lors de l\'ajout du contact.');
          //console.error('Erreur lors de l\'ajout du contact:', error);
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

  getAllPays() {
    this.countryService.getAllCountries().subscribe(datas => {
      this.countries = datas
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(country => ({
        ...country,
        mask: '0'.repeat(this.getPhoneLength(country.nom)),
        indicatif: `+${country.indicatif}`,
      }));
      this.selectedCountry = this.countries.find(c => c.nom === 'Mali');
      this.contactForm.controls['country'].setValue(this.selectedCountry?.id);
    })
  }

  
  getPhoneLength(countryName: string): number {
    const countryMap: { names: string[]; length: number }[] = [
      { names: ["bénin", "benin"], length: 8 },
      { names: ["burkina faso", "bourkina faso", "burkina"], length: 8 },
      { names: ["cap-vert", "cap vert"], length: 7 },
      { names: ["côte d'ivoire", "cote d'ivoire", "ivoire"], length: 10 },
      { names: ["gambie"], length: 7 },
      { names: ["ghana", "gana"], length: 9 },
      { names: ["guinée", "guinee"], length: 9 },
      { names: ["guinée-bissau", "guinée bissau", "bissau"], length: 7 },
      { names: ["libéria", "liberia"], length: 9 },
      { names: ["mali", "malie", "malin"], length: 8 },
      { names: ["niger", "nigér"], length: 8 },
      { names: ["nigeria", "nigéria"], length: 10 },
      { names: ["sénégal", "senegal"], length: 9 },
      { names: ["sierra leone", "leone"], length: 8 },
      { names: ["togo"], length: 8 },
      { names: ["tchad"], length: 8 },
      { names: ["tunisie", "tunis"], length: 8 },
      { names: ["zambie"], length: 9 },
      { names: ["zimbabwe"], length: 9 },
      { names: ["afrique du sud", "afrique sud", "sud afrique"], length: 9 },
      { names: ["botswana"], length: 9 },
      { names: ["burundi"], length: 9 },
      { names: ["cameroon", "cameroun"], length: 9 },
      { names: ["central african republic", "république centrafricaine"], length: 9 },
      { names: ["congo"], length: 9 },
    ];
  
    const normalizedInput = countryName.trim().toLowerCase();
  
    for (const entry of countryMap) {
      if (entry.names.some(name => name.toLowerCase() === normalizedInput)) {
        return entry.length;
      }
    }
  
    return 9; // Valeur par défaut
  }

  handleChange(event: any) {
    this.selectedCountry = this.countries.find(c => c.id === event.value);
    console.log(this.selectedCountry);
    this.contactForm.controls['phoneNumber'].setValue('');
  }

}
