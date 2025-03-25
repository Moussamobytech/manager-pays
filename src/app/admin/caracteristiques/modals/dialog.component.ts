import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { Caracteristiques } from 'src/app/app.models';
import { CaracteristiquesService } from 'src/app/services/caracteristiques.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent implements OnInit {

  public form: UntypedFormGroup;
  public selectedImage: File;
  public showSuccessMessage: boolean = false;
  public isUpdateMode: boolean = false;
  public caracteristique : any ={};
  constructor(public dialogRef: MatDialogRef<DialogComponent>,public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: UntypedFormBuilder, public appService : CaracteristiquesService, private router: Router){}
  ngOnInit(): void {
    this.isUpdateMode = !!this.data.caracteristique;

    this.form = this.fb.group({
      id: [this.isUpdateMode ? this.data.caracteristique.id : null],
      libelle: [this.isUpdateMode ? this.data.caracteristique.libelle : null, Validators.required],
      description: [this.isUpdateMode ? this.data.caracteristique.description : null],
      type: [this.isUpdateMode ? this.data.caracteristique.type : null, Validators.required],
      unite: [this.isUpdateMode ? this.data.caracteristique.unite : null],

    });
    if (this.isUpdateMode) {
      this.form.patchValue(this.data.caracteristique);
    }
  }


  public onSubmit() {
      if (this.form.valid) {
          const values: Caracteristiques = this.form.value;
          console.log("Ma Caracteristiques : ",values);

          if (values.id) {
              this.appService.updateCaracteristiques(values.id, values).subscribe(
                  response => {
                      console.log('Caracteristiques mise à jour avec succès:', response);
                      
                      this.showSuccessMessage = true;
                      setTimeout(() => {
                          this.dialogRef.close();
                      }, 3000);
                  },
                  error => {
                      console.error('Erreur lors de la mise à jour du caracteristique:', error);
                  }
              );
          } else {
              this.appService.addCaracteristiques(values).subscribe(
                  response => {
                      console.log('Caracteristiques ajoutée avec succès:', response);
                       console.log('Mon logo : ', this.selectedImage);
                      this.showSuccessMessage = true;
                      setTimeout(() => {
                          this.dialogRef.close();
                      }, 3000);
                  },
                  error => {
                      console.error('Erreur lors de l\'ajout du caracteristique:', error);
                  }
              );
          }
      }
    }

}
