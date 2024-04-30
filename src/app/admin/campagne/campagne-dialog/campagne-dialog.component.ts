import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { Campagne, Product } from 'src/app/app.models';
import * as moment from  'moment';
@Component({
  selector: 'app-campagne-dialog',
  templateUrl: './campagne-dialog.component.html',
  styleUrl: './campagne-dialog.component.scss'
})
export class CampagneDialogComponent implements OnInit {
  public products: Array<Product> = [];

  public form: UntypedFormGroup;
  public selectedImage: File;
    public campagnes: Campagne[] = [];

  public campagne: any = {};
  public showSuccessMessage: boolean = false;
  public isUpdateMode: boolean = false;
  constructor(public dialogRef: MatDialogRef<CampagneDialogComponent>,public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: UntypedFormBuilder, public appService : AppService, private router: Router){}
  ngOnInit(): void {
    // this.isUpdateMode = !!this.data.campagne; // Déterminer le mode en fonction de la présence de données de catégorie

    // // Initialiser le formulaire en fonction du mode
    // this.form = this.fb.group({
    //   id: this.isUpdateMode ? this.data.campagne.id : 0,
    //   libelle: [this.isUpdateMode ? this.data.campagne.libelle : null, Validators.required],
    //   username: [this.isUpdateMode ? this.data.campagne.username : null, Validators.required],
    //   type: [this.isUpdateMode ? this.data.campagne.type : null, Validators.required],
    //   dateDebut: [this.isUpdateMode ? new Date(this.data.campagne.dateDebut) : null, Validators.required],
    //   dateFin: [this.isUpdateMode ? this.data.campagne.dateFin : null, Validators.required],
    //   produit: this.isUpdateMode ? this.data.campagne.produit : 0,
    //   image: null,
    // });
    // if (this.isUpdateMode) {
    //   this.form.patchValue(this.data.campagne);
    // }
    this.isUpdateMode = !!this.data.campagne;
    console.log("data ",this.isUpdateMode)
    // console.log("Date  ",this.data.campagne.dateDebut)
    // console.log("moment ",moment(this.data.campagne.dateDebut).format('DD MMM, YYYY'));
    // console.log("moment ",moment(this.data.campagne.dateDebut).format('LT'));
    // console.log("Date new ",new Date(this.data.campagne.dateDebut))
    this.form = this.fb.group({
      id: [this.isUpdateMode ? this.data.campagne.id : null],
      libelle: [this.isUpdateMode ? this.data.campagne.libelle : null, Validators.required],
      username: [this.isUpdateMode ? this.data.campagne.username : null, Validators.required],
      type: [this.isUpdateMode ? this.data.campagne.type : null, Validators.required],
      dateDebut: [this.isUpdateMode ? new Date(this.data.campagne.dateDebut) : null, Validators.required],
      dateFin: [this.isUpdateMode ? new Date(this.data.campagne.dateFin) : null, Validators.required],
      // produit: [this.isUpdateMode ? this.data.campagne.produit : null, Validators.required],
      produit: this.isUpdateMode ? this.data.campagne.produit : 0,
      image: null,
      // image: this.isUpdateMode ? this.data.campagne.image : null, // Ajout de la valeur de l'image existante

    });
    if (this.isUpdateMode) {
      this.form.patchValue(this.data.campagne);
    }



     this.getAllProducts();
  }
  public getAllProducts(){
    this.appService.getAllProducts().subscribe(data=>{
      this.products = data;
      console.log("Produit :", this.products)
      //for show more product
      // for (var index = 0; index < 3; index++) {
      //   this.products = this.products.concat(this.products);
      // }
    });
  }

//   onFileSelected(event) {
//     this.selectedImage = event.target.files[0] as File;
//     console.log(this.selectedImage);
// }\

onFileSelected(event) {
  this.selectedImage = event.target.files[0] as File;
}
  public onSubmit() {
    if (this.form.valid) {
        const values: Campagne = this.form.value;
        console.log("Ma campagne : ",values);

        if (values.id) {
            this.appService.updateCampagne(values.id,values.libelle,
               values.username, values.type, values.dateDebut , values.dateFin, values.produit, this.selectedImage).subscribe(
                response => {
                    console.log('Campagne mise à jour avec succès:', response);
                    console.log("Image : ", values.image);
                    this.showSuccessMessage = true;
                    setTimeout(() => {
                        this.dialogRef.close();
                    }, 3000);
                    // this.router.navigate(['/admin/campagne/campagne-list']);
                },
                error => {
                    console.error('Erreur lors de la mise à jour de la campagne:', error);
                }
            );
        } else {
            this.appService.addCampagne(values, this.selectedImage).subscribe(
                response => {
                    console.log('Campagne ajoutée avec succès:', response);
                     console.log('Mon image : ', this.selectedImage);
                    this.showSuccessMessage = true;
                    setTimeout(() => {
                        this.dialogRef.close();
                    }, 3000);
                },
                error => {
                    console.error('Erreur lors de l\'ajout de la campagne:', error);
                }
            );
        }
    }
  }
  // public onSubmit() {
  //   if (this.form.valid) {
  //     const values: Campagne = this.form.value;

  //     if (this.isUpdateMode) {
  //       console.log('update mode : ', this.isUpdateMode);
  //       this.appService.updateCampagne(
  //         values.id,
  //         values.libelle,
  //         values.username,
  //         values.type,
  //         values.dateDebut,
  //         values.dateFin,
  //         values.produit,
  //         this.selectedImage
  //       ).subscribe(
  //         response => {
  //           console.log('Campagne mise à jour avec succès:', response);
  //           this.showSuccessMessage = true;
  //           setTimeout(() => {
  //             this.dialogRef.close();
  //           }, 3000);
  //         },
  //         error => {
  //           console.error('Erreur lors de la mise à jour de la campagne:', error);
  //         }
  //       );
  //     } else {
  //       console.log("Mode ajouter : ",values);
  //       this.appService.addCampagne(values, this.selectedImage).subscribe(
  //         response => {
  //           console.log('Campagne ajoutée avec succès:', response);
  //           this.showSuccessMessage = true;
  //           setTimeout(() => {
  //             this.dialogRef.close();
  //           }, 3000);
  //         },
  //         error => {
  //           console.error('Erreur lors de l\'ajout de la campagne:', error);
  //         }
  //       );
  //     }
  //   }
  // }
}
