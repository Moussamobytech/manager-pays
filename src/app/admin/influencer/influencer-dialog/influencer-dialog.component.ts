import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { Influencer } from 'src/app/app.models';
import { InfluencerService } from 'src/app/services/influencer.service';

@Component({
  selector: 'app-influencer-dialog',
  templateUrl: './influencer-dialog.component.html',
  styleUrl: './influencer-dialog.component.scss'
})
export class InfluencerDialogComponent implements OnInit {

  public form: UntypedFormGroup;
  public selectedImage: File;
  public showSuccessMessage: boolean = false;
  public isUpdateMode: boolean = false;
  public influencer : any ={};
  constructor(public dialogRef: MatDialogRef<InfluencerDialogComponent>,public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: UntypedFormBuilder, public appService : AppService,  public influencerService : InfluencerService, private router: Router){}
  ngOnInit(): void {
    this.isUpdateMode = !!this.data.influencer;

    this.form = this.fb.group({
      id: [this.isUpdateMode ? this.data.influencer.id : null],
      nomComplet: [this.isUpdateMode ? this.data.influencer.nomClomplet : null, Validators.required],
      code: [this.isUpdateMode ? this.data.influencer.code : null, Validators.required],
      email: [this.isUpdateMode ? this.data.influencer.email : null, Validators.required],
      
      // description: [this.isUpdateMode ? this.data.influencer.description : null, Validators.required],
     // logo: null
      logo: this.isUpdateMode ? this.data.influencer.logo : null,

    });
    if (this.isUpdateMode) {
      this.form.patchValue(this.data.influencer);
    }
  }


  onFileSelected(event) {
    this.selectedImage = event.target.files[0] as File;
  }
    public onSubmit() {
      if (this.form.valid) {
          const values: Influencer = this.form.value;
          console.log("Ma influencer : ",values);

          if (values.id) {
              this.influencerService.update(values.id,values).subscribe(
                  response => {
                      console.log('Bran mise à jour avec succès:', response);
                      // console.log("logo : ", values.logo);
                      this.showSuccessMessage = true;
                      setTimeout(() => {
                          this.dialogRef.close();
                      }, 3000);
                  },
                  error => {
                      console.error('Erreur lors de la mise à jour du influencer:', error);
                  }
              );
          } else {
              this.influencerService.add(values).subscribe(
                  response => {
                      console.log('Influencer ajoutée avec succès:', response);
                      //  console.log('Mon logo : ', this.selectedImage);
                      this.showSuccessMessage = true;
                      setTimeout(() => {
                          this.dialogRef.close();
                      }, 3000);
                  },
                  error => {
                      console.error('Erreur lors de l\'ajout du influencer:', error);
                  }
              );
          }
      }
    }

}
