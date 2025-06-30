import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AppSettings, Settings } from 'src/app/app.settings';
import { Brand } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { BrandDialogComponent } from '../brands/brand-dialog/brand-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { CountryService } from 'src/app/services/country.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrl: './country.component.scss'
})
export class CountryComponent implements OnInit {

  allRegions: any;
 

  @ViewChild('addCountry') addCountry: TemplateRef<any>;
  @ViewChild('addRegions') addRegions: TemplateRef<any>;
  @ViewChild('paysDetails') paysDetails: TemplateRef<any>;





  public form: UntypedFormGroup;
  public formRegion: UntypedFormGroup;

  public brand: Brand[] = [];
  public page: any;
  public count = 5;
  public settings: Settings;
  allCountries: any[];
  public id: any;
  sub: any;
  sortedCountries: any[];
  monPays: any;

  constructor(
    private router: Router,
    public formBuilder: UntypedFormBuilder,
    private commonService: CommonMessageService,
    private countryService: CountryService,
    public appService: AppService, public fb: FormBuilder,
    public domHandlerService: DomHandlerService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog, public appSettings: AppSettings) {
    this.settings = this.appSettings.settings;

  }
  ngOnInit(): void {
    this.getBrands();
    this.getAllPays();


    this.form = this.formBuilder.group({
      'nom': [null, Validators.required],
      'indicatif': [null, Validators.required],
      'description': [null],
    });
    this.formRegion = this.formBuilder.group({
      'nom': [null, Validators.required],
      'pays': [null, Validators.required],
      'description': [null],
      'capitale': [0, Validators.required]
    });
    this.getAllRegions();
    this.getAllCountries();

    this.sub = this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.id = params['id'];
      }
    });
  }
  getAllCountries() {
    this.countryService.getAllCountries().subscribe(datas => {
      this.allCountries = datas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    })
  }
  public onPageChanged(event) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }
  public getBrands() {
    this.appService.getBrands().subscribe((data) => {

      this.brand = data;
    });
  }

  public openBrandDialog(data: any) {
    const dialogRef = this.dialog.open(BrandDialogComponent, {
      data: {
        brand: data,
        brands: this.brand
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(brands => {
      this.getBrands()
      // if (brands) {
      //   const index: number = this.brand.findIndex(x => x.id === brands.id);
      //   if (index !== -1) {
      //     // Si le brand existe déjà, mettez à jour ses données
      //     this.brand[index] = brands;
      //   } else {
      //     // Si le brand n'existe pas, ajoutez-la à la liste
      //     const lastBrand = this.brand[this.brand.length - 1];
      //     brands.id = lastBrand.id + 1;
      //     this.brand.push(brands);
      //   }
      // }
    });
  }

  public setEtatBrand(id: string, event: MatSlideToggleChange): void {
    // Trouver le brand correspondant dans la liste
    const brand = this.brand.find(c => c.id === id);
    if (brand) {
      // Mettre à jour l'état du brand
      brand.etat = event.checked;
      // Appeler le service ou effectuer d'autres actions nécessaires pour sauvegarder les modifications
      this.appService.setEtatBrand(id, event.checked).subscribe(
        () => {
       //   console.log(`Etat du brand ${id} modifié avec succès à ${event.checked}.`);
          // Mettre à jour l'état du brand dans votre application si nécessaire
        },
        error => {
          console.error("Erreur lors du réglage d'etat du brand:", error);
          // Traiter les erreurs éventuelles lors de la modification d'etat du brand
        }
      );
    }
  }


  submitForm() {
    if (this.id != null) {
      this.Modifier(this.id);
    }
    else {
    this.AddPays();
    }
  }
  submitRegionForm() {
    this.addRegion();
   /*#addCountry if (this.id != null) {
      this.Modifier(this.id);
    }
    else {
      this.addRegion()
    }*/
  }

  
  AddPays() {

    try {
      if (this.form.valid) {
        const data = {
          nom: this.form.value.nom,
          indicatif: this.form.value.indicatif,
          description: this.form.value.description
        };

        this.countryService.addCountries(data).subscribe({
          next: (datas) => {
            if (datas.message = "Pays ajouté avec succès") {
              this.commonService.successToast(datas.message);
              this.dialog.closeAll();
              this.getAllPays()
              this.router.navigate(["/admin/country"]);

            }
          },
          error: (err) => {
            if (err && err.statusCode == "BAD_REQUEST") {
              this.commonService.errorToast(err.body.message);
            }
            if (err.status == "400") {
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
     // console.log(error);
      this.commonService.errorToast("Erreur inattendue, merci de réessayer !");
    }

  }
  addRegion() {
    if (this.formRegion.valid) {
      const data = {
        nom: this.formRegion.value.nom,
        idCountrie: this.formRegion.value.pays,
        description: this.formRegion.value.description,
        capitale: this.formRegion.value.capitale 
      };
      this.countryService.addRegion(data).subscribe({
        next: (datas) => {
          this.commonService.successToast(datas.message);
          this.dialog.closeAll();
          this.getAllRegions();
          this.router.navigate(["/admin/country"]);
        },
        error: (err) => {
          this.commonService.errorToast(err.message);
        }
      });
    }
    else {
      this.commonService.warnToast("Merci de vérifier si tous les champs sont remplis");
    }
  }

  Modifier(id: any) {

    try {
      if (this.form.valid) {
        const data = {
          nom: this.form.value.nom,
          indicatif: this.form.value.indicatif,
          description: this.form.value.description

        };

        this.countryService.updateCountries(id, data).subscribe({
          next: (datas) => {
            if (datas.message = "Pays modifier avec succès") {
              this.commonService.successToast(datas.message);
              this.dialog.closeAll();
              this.getAllPays()
              this.router.navigate(["/admin/country"]); 
              this.id = null;

            }
          },
          error: (err) => {
            if (err && err.statusCode == "BAD_REQUEST") {
              this.commonService.errorToast(err.body.message);
            }
            if (err.status == "400") {
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
    //  console.log(error);
      this.commonService.errorToast("Erreur inattendue, merci de réessayer !");
    }

  }


  getAllPays() {
    this.countryService.getAllCountries().subscribe(datas => {
      this.allCountries = datas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    })
  }

  getAllRegions() {
    this.countryService.getAllRegions().subscribe(datas => {
      this.allRegions = datas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    })
  }

  setStatus(id: string, event: MatSlideToggleChange): void {
    this.updateState(id, event.checked ? 'true' : 'false')
  }
  public updateState(id, state) {
    this.countryService.updateState(id, state).then((data: any) => {
    })
  }

  public remove(country: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Vous etes sur de supprimer ce pays ?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.countryService.delete(country.id).subscribe(
          () => {
            // Supprimer la catégorie localement après avoir été supprimée avec succès sur le serveur
            const index: number = this.allCountries.findIndex((us: any) => us.id === country.id);
            if (index !== -1) {
              this.allCountries.splice(index, 1);
            }
           // console.log("Pays successfully deleted.");
          },
          (error) => {
            console.error("Error deleting produit:", error);
            // Traiter les erreurs éventuelles lors de la suppression de la catégorie
          }
        );
      }
    });
  }


  openDialog(id: any): void {
    const dialogRef = this.dialog.open(this.addCountry, {
      width: '400px',
    });
    if (id != null) {
      this.id = id;
      this.countryService.getById(id).subscribe(datas => {
        this.form.patchValue(datas)
      });
    }

    dialogRef.afterClosed().subscribe(result => {
      // Reset form fields after the dialog is closed
      this.form.reset({
        nom: '',
        indicatif: '',
        description: ''
      });

      // Navigate to the desired route
      this.router.navigate(['/admin/country']);
    });
  }
  openRegionDialog(id: any): void {
    const dialogRef = this.dialog.open(this.addRegions, {
      width: '400px',
    });
  } 


  openPaysDetails(pays: any) {
        const dialogRef = this.dialog.open(this.paysDetails, {
      width: '400px',
    });
    this.monPays = pays;
    this.countryService.getAllRegionsByCountrie(pays.id).subscribe( datas =>{
    //  console.log("My Regions List ",datas);
      this.allRegions = datas;
    //  dialogRef.componentInstance.allRegions = datas;
    })
    }

  onNoClick(): void {
    this.dialog.closeAll();
  }



  sortCountry(keyWord: string) {

    const ascKey = `asc${keyWord.charAt(0).toUpperCase() + keyWord.slice(1)}`;
    if (this[ascKey] === undefined) {
      this[ascKey] = true; // Initialize to ascending on the first sort
    }

    const isAscending = this[ascKey];
    const sortOrder = isAscending ? 1 : -1;

    this.sortedCountries = [...this.allCountries].sort((a, b) => {
      const valueA = this.getSortValue(a, keyWord);
      const valueB = this.getSortValue(b, keyWord);

      if (typeof valueA === "string" && typeof valueB === "string") {
        // This sorting way allows us to account every french characters even accentuated ones
        return valueA.localeCompare(valueB, 'fr', { sensitivity: 'base' }) * sortOrder;
      }

      if (valueA < valueB) return -sortOrder;
      if (valueA > valueB) return sortOrder;
      return 0;
    });

    // Toggle the direction for the next sort dynamically
    this[ascKey] = !isAscending;
  }
  // function to get the sortable value based on 'keyWord'
  getSortValue(country: any, keyWord: string): any {

    switch (keyWord) {
      case "nom":
        return country.nom?.trim().toLowerCase() || '';
      case "description":
        return country.description?.trim().toLowerCase() || '';
      case "indicatif":
        return country.indicatif.toLowerCase() || '';
      case "createdAt":
        return new Date(country.createdAt).getTime() || 0;
      default:
        return '';
    }
  }
}
