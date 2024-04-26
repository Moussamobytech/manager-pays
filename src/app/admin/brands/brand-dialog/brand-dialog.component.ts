import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { Brand } from 'src/app/app.models';

@Component({
  selector: 'app-brand-dialog',
  templateUrl: './brand-dialog.component.html',
  styleUrl: './brand-dialog.component.scss'
})
export class BrandDialogComponent implements OnInit {

  public form: UntypedFormGroup;
  public selectedImage: File;
  public showSuccessMessage: boolean = false;
  public isUpdateMode: boolean = false;
  public brand : any ={};
  constructor(public dialogRef: MatDialogRef<BrandDialogComponent>,public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: UntypedFormBuilder, public appService : AppService, private router: Router){}
  ngOnInit(): void {
    this.isUpdateMode = !!this.data.brand;

    this.form = this.fb.group({
      id: [this.isUpdateMode ? this.data.brand.id : null],
      libelle: [this.isUpdateMode ? this.data.brand.libelle : null, Validators.required],
      description: [this.isUpdateMode ? this.data.brand.description : null, Validators.required],
      logo: this.isUpdateMode ? this.data.brand.logo : null, // Ajout de la valeur de l'image existante

    });
    if (this.isUpdateMode) {
      this.form.patchValue(this.data.brand);
    }
  }


  onFileSelected(event) {
    this.selectedImage = event.target.files[0] as File;
  }
    public onSubmit() {
      if (this.form.valid) {
          const values: Brand = this.form.value;
          console.log("Ma brand : ",values);

          if (values.id) {
              this.appService.updateBrand(values.id,values.libelle, values.description, this.selectedImage).subscribe(
                  response => {
                      console.log('Bran mise à jour avec succès:', response);
                      console.log("logo : ", values.logo);
                      this.showSuccessMessage = true;
                      setTimeout(() => {
                          this.dialogRef.close();
                      }, 3000);
                  },
                  error => {
                      console.error('Erreur lors de la mise à jour du brand:', error);
                  }
              );
          } else {
              this.appService.addBrand(values, this.selectedImage).subscribe(
                  response => {
                      console.log('Brand ajoutée avec succès:', response);
                       console.log('Mon logo : ', this.selectedImage);
                      this.showSuccessMessage = true;
                      setTimeout(() => {
                          this.dialogRef.close();
                      }, 3000);
                  },
                  error => {
                      console.error('Erreur lors de l\'ajout du brand:', error);
                  }
              );
          }
      }
    }

}
