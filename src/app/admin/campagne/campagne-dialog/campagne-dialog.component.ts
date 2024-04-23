import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { Campagne, Product } from 'src/app/app.models';

@Component({
  selector: 'app-campagne-dialog',
  templateUrl: './campagne-dialog.component.html',
  styleUrl: './campagne-dialog.component.scss'
})
export class CampagneDialogComponent implements OnInit {
  public products: Array<Product> = [];

  public form: UntypedFormGroup;
  public selectedImage: File;
  public categories: Campagne[] = [];

  public category: any = {};
  public showSuccessMessage: boolean = false;
  public isUpdateMode: boolean = false;
  constructor(public dialogRef: MatDialogRef<CampagneDialogComponent>,public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: UntypedFormBuilder, public appService : AppService, private router: Router){}
  ngOnInit(): void {
    this.isUpdateMode = !!this.data.category; // Déterminer le mode en fonction de la présence de données de catégorie

    // Initialiser le formulaire en fonction du mode
    this.form = this.fb.group({
      id: this.isUpdateMode ? this.data.category.id : 0,
      nom: [this.isUpdateMode ? this.data.category.nom : null, Validators.required],
      hasSubCategory: this.isUpdateMode ? this.data.category.hasSubCategory : false,
      parentId: this.isUpdateMode ? this.data.category.parentId : 0,
      image: null,
    });
    if (this.isUpdateMode) {
      this.form.patchValue(this.data.category);
    }

  }
  public getAllProducts(){
    this.appService.getAllProducts().subscribe(data=>{
      this.products = data;

      //for show more product
      for (var index = 0; index < 3; index++) {
        this.products = this.products.concat(this.products);
      }
    });
  }

  onFileSelected(event) {
    this.selectedImage = event.target.files[0] as File;
    console.log(this.selectedImage);
}
  public onSubmit() {
    if (this.form.valid) {
        const values: Campagne = this.form.value;

        if (values.id) {
            this.appService.updateCampagne(values.id,values.libelle, values.username, values.type, values.dateDebut , values.dateFin, values.produit, this.selectedImage).subscribe(
                response => {
                    console.log('Campagne mise à jour avec succès:', response);
                    console.log("Image : ", values.image);
                    this.showSuccessMessage = true;
                    setTimeout(() => {
                        this.dialogRef.close();
                    }, 3000);
                    this.router.navigate(['/admin/campagne/campagne-list']);
                },
                error => {
                    console.error('Erreur lors de la mise à jour de la campagne:', error);
                }
            );
        } else {
            this.appService.addCampagne(values, this.selectedImage).subscribe(
                response => {
                    console.log('Campagne ajoutée avec succès:', response);
                    // console.log('Modification de la catégorie : ', this.selectedImage);
                    this.showSuccessMessage = true;
                    setTimeout(() => {
                        this.dialogRef.close();
                    }, 3000);
                },
                error => {
                    console.error('Erreur lors de l\'ajout de la camapgne:', error);
                }
            );
        }
    }
  }
}
