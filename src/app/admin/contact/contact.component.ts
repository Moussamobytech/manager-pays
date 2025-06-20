import { Component, HostListener, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { emailValidator } from '../../theme/utils/app-validators';
import { AppService } from 'src/app/app.service';
import { Contact } from 'src/app/app.models';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { AppSettings, Settings } from 'src/app/app.settings';
import { ContactDetailComponent } from './contact-detail/contact-detail.component';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: UntypedFormGroup;
 public contact : Contact[];
 public page: any;
 public count = 5;
 public viewCol: number = 25;
 public settings:Settings;
  countries: any;


  constructor(public countryService:CountryService, public formBuilder: UntypedFormBuilder, public appService : AppService,public domHandlerService: DomHandlerService , public dialog: MatDialog, public appSettings:AppSettings) {
    this.settings = this.appSettings.settings;

   }

  ngOnInit() {
   this.initForm();
   this.getContact();
    this.getAllPays();
   if(this.domHandlerService.window?.innerWidth < 1280){
    this.viewCol = 33.3;
  };
  }


  @HostListener('window:resize')
  public onWindowResize():void {
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }
  public onPageChanged(event){
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
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

      const values: Contact = this.contactForm.value; // Récupérer les valeurs du formulaire
      this.appService.addContact(values).subscribe(
        (response) => {
          console.log('Contact ajouté avec succès:', response);
          // Réinitialiser le formulaire ici si nécessaire
          this.contactForm.reset(); // Réinitialiser le formulaire

        },
        (error) => {
          console.error('Erreur lors de l\'ajout du contact:', error);
        }
      );
    }
  }
  public getContact(){
    this.appService.getContact().subscribe(data =>{
      this.contact = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  })}
 // console.log("2 Contact data: ", JSON.stringify(this.contact));


  public openContactDialog(data: any) {
    const dialogRef = this.dialog.open(ContactDetailComponent, {
      data: {
        contact: data,
         contacts: this.contact
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(contact => {
      if (contact) {
        const index: number = this.contact.findIndex(x => x.id === contact.id);
        if (index !== -1) {
          // Si le contact existe déjà, mettez à jour ses données
          this.contact[index] = contact;
        } else {
          // Si le contact n'existe pas, ajoutez-la à la liste
          const lastContact = this.contact[this.contact.length - 1];
          contact.id = lastContact.id + 1;
          this.contact.push(contact);
        }
      }
    });
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
          indicatif: `+${country.indicatif}`,
        }));
  
    });
  }
  getCountryNameFromPhoneNumber(phoneNumber: string): string | null {
    if (!phoneNumber || !this.countries || this.countries.length === 0) return null;
  
    const indicatifs = this.countries
      .map(c => c.indicatif)
      .sort((a, b) => b.length - a.length);
  
    const matchingIndicatif = indicatifs.find(ind => phoneNumber.startsWith(ind));
  
    if (matchingIndicatif) {
      const country = this.getCountryByPhoneIndicatif(matchingIndicatif);
      return country?.nom || null;
    }
  
    return null;
  }
  
  
  getCountryByPhoneIndicatif(indicatif: string) {
    if (!this.countries || this.countries.length === 0) {
      return null;
    }
    return this.countries.find(country => country.indicatif === indicatif);
  }
  

}
