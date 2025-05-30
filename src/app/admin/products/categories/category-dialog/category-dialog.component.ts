import { Component, OnInit, Inject, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
// import { Category } from 'src/app/app.models';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Category } from 'src/app/models/category.models';

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrls: ['./category-dialog.component.scss']
})
export class CategoryDialogComponent implements OnInit {
  @Output() categorySubmitted: EventEmitter<any> = new EventEmitter<any>();

  public form: UntypedFormGroup;
  public selectedImage: File;
  public selectedIcon: File;
  public categories: Category[] = [];

  public category: any = {};
  public showSuccessMessage: boolean = false;
  public isUpdateMode: boolean = false; // Nouvelle propriété pour indiquer le mode de formulaire

  constructor(public dialogRef: MatDialogRef<CategoryDialogComponent>,public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public fb: UntypedFormBuilder, public appService : AppService, private router: Router) { }



  ngOnInit(): void {
    this.isUpdateMode = !!this.data.category; // Déterminer le mode en fonction de la présence de données de catégorie
    this.categories = this.data.list
    
    // Initialiser le formulaire en fonction du mode
    this.form = this.fb.group({
      id: this.isUpdateMode ? this.data.category.id : 0,
      nom: [this.isUpdateMode ? this.data.category.nom : null, Validators.required],
      hasSubCategory: this.isUpdateMode ? this.data.category.hasSubCategory : false,
      parentId: this.isUpdateMode ? this.data.category.parentId : null,
      poids: this.isUpdateMode ? this.data.category.poids : 1,
      icon: null,
      image: null,
    });
    
    if (this.isUpdateMode) {
      this.form.patchValue(this.data.category);
    }

  }

  onFileSelected(event) {
    this.selectedImage = event.target.files[0] as File;
    console.log(this.selectedImage);
  }

  onIconSelected(event) {
    this.selectedIcon = event.target.files[0] as File;
    console.log(this.selectedIcon);
  }

  
  public onSubmit() {
    if (this.form.valid) {
      const values: Category = this.form.value;

      if (values.id) {
          this.appService.updateCategory(values.id, values.nom, values.parentId, this.selectedImage, this.selectedIcon).subscribe(
              response => {
                  console.log('Catégorie mise à jour avec succès:', response);
                  console.log("Image : ", values.image);
                  this.showSuccessMessage = true;
                  setTimeout(() => {
                      this.dialogRef.close();
                  }, 3000);
                  
                  this.router.navigate(['/admin/products/categories']);
              },
              error => {
                  console.error('Erreur lors de la mise à jour de la catégorie:', error);
              }
          );
      } else {
          this.appService.addCategory(values, this.selectedImage, this.selectedIcon).subscribe(
              response => {
                  console.log('Catégorie ajoutée avec succès:', response);
                  // console.log('Modification de la catégorie : ', this.selectedImage);
                  this.showSuccessMessage = true;
                  setTimeout(() => {
                      this.dialogRef.close();
                  }, 3000);
              },
              error => {
                  console.error('Erreur lors de l\'ajout de la catégorie:', error);
              }
          );
      }
  }
}



}
