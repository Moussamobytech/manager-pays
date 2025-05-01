import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, Router } from '@angular/router';
// import { Campagne, Product } from 'src/app/app.models';
import moment from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { CampagneService } from 'src/app/services/campagne.service';
import { Product } from 'src/app/models/product.models';
import { Campagne } from 'src/app/app.models';
import { User } from 'src/app/models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { ProductService } from 'src/app/services/product.service';
import { CountryService } from 'src/app/services/country.service';
@Component({
  selector: 'app-campagne-dialog',
  templateUrl: './campagne-dialog.component.html',
  styleUrl: './campagne-dialog.component.scss'
})
export class CampagneDialogComponent implements OnInit {

  form: FormGroup;
  private currentUser: User;
  public id: any;
  public products: any = []
  public username:string;
  sub: any;
  typePromo: any;
  selectedProducts = new FormControl([]);
  selectedProducts2 = new FormControl([]);

  selectedCountries = new FormControl([]);


isPromo: boolean = false;
isParrainage: boolean = false;
isOffre: boolean = false;
isLivraison: boolean = false;
  countries: any;


constructor(
    public appService: AppService, 
    public formBuilder: UntypedFormBuilder, 
    private commonService: CommonMessageService,
    private auth: AuthenticationService, 
    private productService: ProductService, 
    private campagneService: CampagneService,
    private countryService:CountryService,
    private router: Router,private activatedRoute: ActivatedRoute,
    private fb: FormBuilder) {
      this.form = this.fb.group({
        products: this.fb.array([], Validators.required)
      });
  
     }

     typeOffre = [
      {nom:'Reduction en %', value:'REDUCTION'},
      {nom:'Cadeau produit', value:'CADEAUX'}
    ]
     // Liste des pays avec leurs régions
  

   

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser()
    this.username = this.currentUser.username; 
    this.getAllPromo();
    this.loadData();
    this.form = this.formBuilder.group({
      'nom': [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      'reduction': [null],
      'commission': [null,Validators.required],
      'nombreUtilisation':null,
      'montantMinAchat': [null, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(3)]],
      'montantMaxAchat': [null],
      "dateDebut":[null,Validators.required],
      "dateFin":[null,Validators.required],
      "description": null,
      'username':this.username,
      'seuilRetrait':null,
      'typePromo':[null, Validators.required],
      'produitPromos':[],
      'zoneLivraison':[],
      'typeOffre':[],
      'cadeauxProduit':[]

    });


    

    this.loadData()
    this.sub = this.activatedRoute.params.subscribe(params => {
      if(params['id']){
        this.id = params['id'];
        this.getCampagneById();
      }
    });
    this.getAllPays();
  }

  getAllPays() {
    this.countryService.getAllCountries().subscribe(datas => {
      this.countries = datas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    })
  }


public async onSubmit() {
  if (this.id) {
    this.edit()
  } else {
    this.save()
  }

}

async save() {    
  try {
    if (this.form.valid) {
      const data = {
        nom: this.form.value.nom,
        description: this.form.value.description,
        reduction: this.form.value.reduction,
        commissionParrain: this.form.value.commission,
        nombreUtilisation: this.form.value.nombreUtilisation,
        montantMinAchat: this.form.value.montantMinAchat,
        montantMaxAchat: this.form.value.montantMaxAchat,
        dateDebut: this.form.value.dateDebut,
        dateFin: this.form.value.dateFin,
        username: this.form.value.username,
        seuilRetrait: this.form.value.seuilRetrait,
        typePromo:this.form.value.typePromo,
        typeOffre:this.form.value.typeOffre,
        produitPromos:this.selectedProducts.value,
        zoneLivraison:this.selectedCountries.value,
        cadeauxProduit:this.selectedProducts2.value

      };
      

      this.campagneService.add(data).subscribe({
        next: (datas) => {           
        
            this.commonService.successToast(datas.message);
            this.router.navigate(["/admin/campagne/campagne-list"]);
         
        },
        error: (err) => {
          if (err && err.statusCode == "BAD_REQUEST") {
            this.commonService.errorToast(err.body.message);
          }
          if(err.status == "400"){
            this.commonService.errorToast(err.message);

          }
          
          else {
            this.commonService.errorToast("Une erreur interne est survenue, merci de réessayer !");
          }
        }
      });

    } else {
      this.commonService.warnToast("Merci de vérifier si tous les champs sont remplis");
    }
  } catch (error) {
    console.log(error);
    this.commonService.errorToast("Erreur inattendue, merci de réessayer !");
  }
}
async edit() {
  console.log("EDIT == ",this.form.value.zoneLivraison);
  
  try {
    if (this.form.valid) {
      const data = {
        nom: this.form.value.nom,
        description: this.form.value.description,
        reduction: this.form.value.reduction,
        commissionParrain: this.form.value.commission,
        nombreUtilisation: this.form.value.nombreUtilisation,
        montantMinAchat: this.form.value.montantMinAchat,
        montantMaxAchat: this.form.value.montantMaxAchat,
        dateDebut: this.form.value.dateDebut,
        dateFin: this.form.value.dateFin,
        username: this.form.value.username,
        seuilRetrait: this.form.value.seuilRetrait,
        typePromo:this.form.value.typePromo,
        typeOffre:this.form.value.typeOffre,
        produitIds:this.selectedProducts.value,
        zoneLivraison:this.form.value.zoneLivraison,
        cadeauxProduit:this.selectedProducts2.value
      };

    
      this.campagneService.edit(this.id,data).subscribe({
        next: (datas) => {           
            this.commonService.successToast(datas.message);
            this.router.navigate(["/admin/campagne/campagne-list"]);
         
        },
        error: (err) => {
          if (err && err.statusCode == "BAD_REQUEST") {
            this.commonService.errorToast(err.body.message);
          }
          else if(err && err.statusCode == "OK"){
            this.commonService.successToast("Campagne modifiée avec succès !");
            this.router.navigate(["/admin/campagne/campagne-list"]);
          }
           else {
            this.commonService.errorToast("Une erreur interne est survenue, merci de réessayer !");
          }
        }
      });

    } else {
      this.commonService.warnToast("Merci de vérifier si les champs sont toutes remplis")
    }


  } catch (error) {
    console.log(error)
  }
}
getAllPromo() {
  this.campagneService.getAllTypePromo().subscribe({
    next: (datas) => {
      this.typePromo = datas;
    },
    error: (err) => {
      if (err && err.statusCode == "BAD_REQUEST") {
        this.commonService.errorToast(err.body.message);
      } else {
        this.commonService.errorToast("Une erreur interne est survenue, merci de réessayer !");
      }
    }
  });
}
public getCampagneById(){
  this.campagneService.find(this.id).then((data : any) =>{
    console.log(data)
    this.form.patchValue(data);
   
   // this.form.controls.images.setValue(images);
  })
}
public promo(key) {
  let res = ""
  switch (key) {
    case "PROMOTION":
      res = "Promotion"
      break;

    case "OFFRE_BIENVENUE":
      res = "Offre bienvenue"
      break;

    case "LIVRAISON_GRATUITE":
      res = "Livraison gratuite"
      break;

    case "PARRAINAGE":
      res = "Parrainage"
      break;

    default:
      res = "N/A"
      break;
  }
  return res
}
toggleSelection(productId: number, event: any) {
  const selected = this.selectedProducts.value || [];
  if (event.checked) {
    this.selectedProducts.setValue([...selected, productId]);
  } else {
    this.selectedProducts.setValue(selected.filter(id => id !== productId));
  }
}
async loadData() {
  let res = await this.productService.getAllProducts()
  this.products = res
}
typePromoSelect(typepromo: any) {
  // Réinitialisation des valeurs
  this.isPromo = this.isParrainage = this.isOffre = this.isLivraison = false;

  const promoType = typepromo.name;

  const promoStates = {
    'OFFRE_BIENVENUE': () => this.isOffre = true,
    'LIVRAISON_GRATUITE': () => this.isLivraison = true,
    'PARRAINAGE': () => this.isParrainage = true,
    'PROMOTION': () => this.isPromo = true
  };

  // Exécuter la fonction correspondante si elle existe
  promoStates[promoType]?.();
}





















  /*
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
    public appService: AppService, public campagneService: CampagneService, private router: Router) {

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
    console.log("data ",this.isUpdateMode)
    // console.log("Date  ",this.data.campagne.dateDebut)
    // console.log("moment ",moment(this.data.campagne.dateDebut).format('DD MMM, YYYY'));
    // console.log("moment ",moment(this.data.campagne.dateDebut).format('LT'));
    // console.log("Date new ",new Date(this.data.campagne.dateDebut))
    this.form = this.fb.group({
      id: [this.isUpdateMode ? this.data.campagne.id : null],
      nom: [this.isUpdateMode ? this.data.campagne.nom : null, Validators.required],
      username: [this.isUpdateMode ? this.data.campagne.username : null, Validators.required],
      createdByUser:[this.isUpdateMode ? this.data.campagne.createdByUser : null, Validators.required],
      type: [this.isUpdateMode ? this.data.campagne.type : null, Validators.required],
      typePromo:[this.isUpdateMode ? this.data.campagne.typePromo : null, Validators.required],

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


  public async onSubmit() {
    if (this.form.valid) {
      const values: Campagne = this.form.value;
      console.log("Ma campagne : ", values);

      if (values.id) {
        try {
          let response = await this.campagneService.updateCampagne(values.id, values.libelle,
            values.username, values.type, values.dateDebut, values.dateFin, values.produit, this.selectedImage);
          console.log('Campagne mise à jour avec succès:', response);
          console.log('image : ', values.image);
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.dialogRef.close();
          }, 3000);
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la campagne:', error);
        }

      } else {
        if (this.selectedImage == null) {
          alert("Veuillez ajouter une image");
          return;
        }

        try {
          let response = await this.campagneService.addCampagne(values, this.selectedImage);
          console.log('Campagne ajoutée avec succès:', response);
          console.log('Mon image : ', this.selectedImage);
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.dialogRef.close();
          }, 3000);
        } catch (error) {
          console.error('Erreur lors de l\'ajout de la campagne:', error);
        }
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

*/
}
