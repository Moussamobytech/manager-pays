import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { Campagne, Product } from 'src/app/app.models';
import moment from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';


@Component({
  selector: 'app-campagne-dialog',
  templateUrl: './campagne-dialog.component.html',
  styleUrl: './campagne-dialog.component.scss'
})
export class CampagneDialogComponent implements OnInit {
  public products: Array<Product> = [];
  isAddingCampaign: boolean = true;
  productList: any[]; // Assurez-vous que le type correspond à vos données de productList

  public form: UntypedFormGroup;
  public selectedImage: File;
  public campagnes: Campagne[] = [];

  public campagne: any = {};
  public showSuccessMessage: boolean = false;
  public isUpdateMode: boolean = false;
  public id: any;
  selectedProduct: any; // Variable pour stocker les détails du produit sélectionné
  startDate: any;
  dateDebut: any;
  dateFin: any;
  @ViewChild('pickerStart') pickerStart: MatDatepicker<Date>;


  constructor(public dialogRef: MatDialogRef<CampagneDialogComponent>, public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: UntypedFormBuilder, private formBuilder: FormBuilder,
    public appService: AppService, private router: Router) {

  }
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
    // console.log("DATA 1",moment(this.data.campagne.dateDebut).toDate())

    this.isUpdateMode = !!this.data.campagne;
    this.form = this.fb.group({
      id: [this.isUpdateMode ? this.data.campagne.id : null],
      libelle: [this.isUpdateMode ? this.data.campagne.libelle : null, Validators.required],
      username: [this.isUpdateMode ? this.data.campagne.username : null, Validators.required],
      type: [this.isUpdateMode ? this.data.campagne.type : null, Validators.required],

     //  dateDebut: [this.isUpdateMode ? moment(this.data.campagne.dateDebut).format('l') : null, Validators.required],
      // dateDebut: [this.isUpdateMode ? this.data.campagne.dateDebut: null, Validators.required],
      dateDebut: [this.isUpdateMode ? moment(this.data.campagne.dateDebut).toDate() : null, Validators.required],
      // dateDebut: new FormControl(new Date()),

      dateFin: [this.isUpdateMode ? this.data.campagne.dateFin : null, Validators.required],
      // dateFin: [this.isUpdateMode ? moment(this.data.campagne.dateFin).format('l') : null, Validators.required],
      // dateDebut: [this.isUpdateMode ? moment(this.data.campagne.dateDebut).format('l') : null],
      // dateFin: [this.isUpdateMode ? this.data.campagne.dateFin : null, Validators.required],
      // produit: [this.isUpdateMode ? this.data.campagne.produit : null, Validators.required],
      produit: [],

      image: null,
      //image: this.isUpdateMode ? this.data.campagne.image : null, // Ajout de la valeur de l'image existante

    });

    // const selectedProductIds = this.productList.map(product => product.id); // Récupérer les ID des produits dans productList
    // this.form = this.fb.group({
    //   produit: [selectedProductIds] // Initialiser la valeur du contrôle de formulaire produit avec les ID des produits sélectionnés
    // });

    if (this.isUpdateMode) {
      this.form.patchValue(this.data.campagne);
    }

    this.getAllProducts();
    this.form.get('produit').patchValue(this.products
      .filter(campagne => campagne.nom)
      .map(produit => produit.id)
    );
this.getSelectedProductsNames()

  }

  public getAllProducts() {
    this.appService.getAllProducts().subscribe(data => {
      this.products = data;
      //for show more product
      // for (var index = 0; index < 3; index++) {
      //   this.products = this.products.concat(this.products);
      // }
    });
  }


  onFileSelected(event) {
    this.selectedImage = event.target.files[0] as File;
  }


  public onSubmit() {
    if (this.form.valid) {
      const values: Campagne = this.form.value;
      console.log("Ma campagne : ", values);

      if (values.id) {
        this.appService.updateCampagne(values.id, values.libelle,
          values.username, values.type, values.dateDebut, values.dateFin, values.produit, this.selectedImage).subscribe(
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
        if (this.selectedImage == null) {
          alert("Veuillez ajouter une image");
          return;
        }
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
  getSelectedProductsNames() {
    const selectedProductIds = this.form.value.produit; // Obtenez les ID des produits sélectionnés
    console.log('IDs of selected products: ' + JSON.stringify(selectedProductIds));
    const selectedProducts = this.products.filter(product => selectedProductIds.includes(product.id)); // Filtrer les produits sélectionnés
    console.log('All Products: ' + JSON.stringify(selectedProducts));
    return selectedProducts.map(product => product.nom).join(', '); // Renvoyer les noms des produits séparés par une virgule

        // Get the selected product IDs from the form

  }

  onProductSelectionChange(event: any) {
    const selectedProductId = event.value;
    const selectedProduct = this.products.find(product => product.id === selectedProductId);

    if (selectedProduct) {
      this.form.patchValue({ username: selectedProduct.user });
      console.log("Username ", selectedProduct)

    }
  }

  onProductSelectionChangeForAdd(event: any) {
    const selectedProductId = event.value;
    const selectedProduct = this.products.find(product => product.id === selectedProductId);
    console.log(" Produit  ", selectedProductId);

    if (selectedProduct) {
      this.form.patchValue({ username: selectedProduct });
      console.log(" Produit selectionner ", this.selectedProduct);

    }
  }


}
