import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Newsletter } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  center: google.maps.LatLngLiteral = { lat: 40.678178, lng: -73.944158};
  zoom = 7;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPositions: google.maps.LatLngLiteral[] = [
    { lat: 40.678178, lng: -73.944158 }
  ];
public newsletter: Newsletter[];
contactForm: UntypedFormGroup;

  constructor(public formBuilder: UntypedFormBuilder, public appService : AppService) { }

  ngOnInit() {
    this.initForm()
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
          console.log('Newsletter ajoutée avec succès:', response);
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

// public subscribe(): void {
//   if (this.contactForm.valid) {
//       const email = this.contactForm.get('email').value;

//       // Expression régulière pour vérifier si c'est une adresse e-mail valide
//       const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//       if (emailPattern.test(email)) {
//           console.log('1 newsletter ajoutée avec succès:');

//           const values: Newsletter = this.contactForm.value; // Récupérer les valeurs du formulaire
//           console.log(values);
//           this.appService.addNewsletter(values).subscribe(
//               (response) => {
//                   console.log('Newsletter ajoutée avec succès:', response);
//                   // Réinitialiser le formulaire ici
//                   this.contactForm.reset(); // Réinitialiser le formulaire

//                   // Vous pouvez également afficher un message de confirmation ou rediriger l'utilisateur ici

//               },
//               (error) => {
//                   console.error('Erreur lors de l\'ajout de la newsletter:', error);
//               }
//           );
//       } else {
//           console.error('Adresse e-mail non valide');
//           // Vous pouvez afficher un message d'erreur à l'utilisateur ou effectuer d'autres actions ici
//       }
//   }
// }

}
