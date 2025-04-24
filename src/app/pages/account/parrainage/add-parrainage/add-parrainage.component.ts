import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormArray, AbstractControl, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { ImageCompressService } from 'src/app/services/image-compress.servive';
import { ProductService } from 'src/app/services/product.service';
import { User } from 'src/app/models/user.models';
import { CampagneService } from 'src/app/services/campagne.service';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-add-parrainage',
  templateUrl: './add-parrainage.component.html',
  styleUrl: './add-parrainage.component.scss'
})
export class AddParrainageComponent implements OnInit {
  form: FormGroup;
  private currentUser: User;
  public id: any;
  public products: any = []
  public username:string;
  sub: any;
  typePromo: any;


 isPromo: boolean = false;
isParrainage: boolean = false;
isOffre: boolean = false;
isLivraison: boolean = false;

typePromoSelect(typepromo: any) {
  let res = ""  

  this.isPromo = this.isParrainage = this.isOffre = this.isLivraison = false;
  res = typepromo.name
  switch (res) {
    case 'OFFRE_BIENVENUE':
      this.isOffre = true;
      this.isLivraison = false;
      this.isPromo = false;
      this.form.get('commission').clearValidators();
      break;
    case 'LIVRAISON_GRATUITE':
      this.isLivraison = true;
      this.isPromo = false;
      this.isOffre = false;
      this.form.get('commission').clearValidators();
      break;
    case 'PARRAINAGE':
      this.isParrainage = true;
      this.form.get('commission').setValidators([
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.min(1)
      ]);
      break;
    case 'PROMOTION':
      this.isPromo = true;
      this.isLivraison = false;
      this.isOffre = false;
      this.form.get('commission').clearValidators();
      break;
  }
  this.form.get('commission').updateValueAndValidity();
}


  typeOffre = [
    {nom:'Reduction en %', value:'REDUCTION'},
    {nom:'Cadeau produit', value:'CADEAUX'}
  ]
   // Liste des pays avec leurs régions
   countries:any
  
   // FormControls pour les selects
   selectedCountry = new FormControl('');
   selectedRegion = new FormControl('');
   selectedCountries = new FormControl([]);

   // Liste des régions dynamiques
   regions: string[] = [];
   selectedRegions = new FormControl([]);

    // Met à jour les régions lorsqu'un pays est sélectionné
    onCountryChange() {
      const country = this.countries.find(c => c.name === this.selectedCountry.value);
      this.regions = country ? country.regions : [];
    //  this.selectedRegions = []; // Réinitialise la sélection
    }
   // Ajoute ou enlève une région à la sélection
 

     // Vérifie si toutes les régions sont sélectionnées
  isAllSelected(): boolean {
    return this.selectedRegions.value?.length === this.regions.length;
  }

  // Vérifie si au moins une région est cochée mais pas toutes
  isIndeterminate(): boolean {
    return this.selectedRegions.value?.length > 0 && !this.isAllSelected();
  }

  // Gère l'option "Tout sélectionner"
  toggleAllSelection() {
    if (this.isAllSelected()) {
      this.selectedRegions.setValue([]);
    } else {
      this.selectedRegions.setValue([...this.regions]);
    }
  }

  // Met à jour la sélection quand une région est cochée/décochée
  updateSelection(region: string) {
    const selected = this.selectedRegions.value || [];
    if (selected.includes(region)) {
      this.selectedRegions.setValue(selected.filter(r => r !== region));
    } else {
      this.selectedRegions.setValue([...selected, region]);
    }
  }

  constructor(
    public appService: AppService, 
    public formBuilder: UntypedFormBuilder, 
    private commonService: CommonMessageService,
    private auth: AuthenticationService, 
    private productService: ProductService, 
    private campagneService: CampagneService,
    private countryService: CountryService,
    
    private router: Router,private activatedRoute: ActivatedRoute,
    private fb: FormBuilder) {
      this.form = this.fb.group({
        products: this.fb.array([], Validators.required)
      });
  
     }

   

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser()
    this.username = this.currentUser.username; 
    this.getAllPromo();  
    this.form = this.formBuilder.group({
      'nom': [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      'reduction': [null],
      'commission': null,
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

    // S'abonner aux changements de typePromo
    this.form.get('typePromo').valueChanges.subscribe(value => {
      if (value) {
        const selectedType = this.typePromo.find(type => type.id === value);
        if (selectedType) {
          this.typePromoSelect(selectedType);
        }
      }
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

  selectedProducts = new FormControl([]);
  selectedProducts2 = new FormControl([]);

  toggleCountry(pays: any, event: any) {
    const selected = this.selectedCountries.value || [];
    if (event.checked) {
      this.selectedCountries.setValue([...selected, pays]);
    } else {
      this.selectedCountries.setValue(selected.filter(id => id !== pays));
    }
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

    let res = await this.productService.productUser(this.currentUser.username)
    this.products = res
    
  }
  //Controle pour la saisie de 0
  nonZeroValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = parseFloat(control.value);
    if (value === 0) {
      return { nonZero: true };
    }
    return null;
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
              this.router.navigate(["/account-seller/parrainage"]);
           
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
   //   console.log(error);
      this.commonService.errorToast("Erreur inattendue, merci de réessayer !");
    }
  }
  

  async edit() {

    console.log(";;;;;;;;;;;TYPE ::::::::::::PRO = ",this.form.value.produitIds);
    

    let size = 0;
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
          zoneLivraison:this.selectedCountries.value,
          cadeauxProduit:this.selectedProducts2.value
        };

      
        this.campagneService.edit(this.id,data).subscribe({
          next: (datas) => {           
              this.commonService.successToast(datas.message);
              this.router.navigate(["/account-seller/parrainage"]);
           
          },
          error: (err) => {
            if (err && err.statusCode == "BAD_REQUEST") {
              this.commonService.errorToast(err.body.message);
            }
            else if(err && err.statusCode == "OK"){
              this.commonService.successToast("Campagne modifiée avec succès !");
              this.router.navigate(["/account-seller/parrainage"]);
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
     // console.log(error)
    }
  }


  public getCampagneById(){
    this.campagneService.find(this.id).then((data : any) =>{
      console.log("ME CAMPAGNE +++",data.produitPromos)
      this.form.patchValue(data);
      this.form.controls.typePromo.patchValue(data.typePromo.id); 
     // this.form.controls.produitIds.patchValue(data.produitPromos.id);
     
     // this.form.controls.images.setValue(images);
    })
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

}
