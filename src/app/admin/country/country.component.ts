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
  editIndex: number | null = null;

  constructor(
    private router: Router,
    public formBuilder: UntypedFormBuilder,
    private commonService: CommonMessageService,
    private countryService: CountryService,
    public appService: AppService,
    public fb: FormBuilder,
    public domHandlerService: DomHandlerService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public appSettings: AppSettings
  ) {
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
    });
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
      this.getBrands();
    });
  }

  public setEtatBrand(id: string, event: MatSlideToggleChange): void {
    const brand = this.brand.find(c => c.id === id);
    if (brand) {
      brand.etat = event.checked;
      this.appService.setEtatBrand(id, event.checked).subscribe(
        () => {},
        error => {
          console.error("Erreur lors du réglage d'état du brand:", error);
        }
      );
    }
  }

  submitForm() {
    if (this.id != null) {
      this.Modifier(this.id);
    } else {
      this.AddPays();
    }
  }

  submitRegionForm() {
    this.addRegion();
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
            if (datas.message === "Pays ajouté avec succès") {
              this.commonService.successToast(datas.message);
              this.dialog.closeAll();
              this.getAllPays();
              this.router.navigate(["/admin/country"]);
            }
          },
          error: (err) => {
            if (err && err.statusCode === "BAD_REQUEST") {
              this.commonService.errorToast(err.body.message);
            } else if (err.status === "400") {
              this.commonService.errorToast(err.message);
            } else {
              this.commonService.errorToast("Une erreur interne est survenue, merci de réessayer !");
            }
          }
        });
      } else {
        this.commonService.warnToast("Merci de vérifier si tous les champs sont remplis");
      }
    } catch (error) {
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
    } else {
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
            if (datas.message === "Pays modifier avec succès") {
              this.commonService.successToast(datas.message);
              this.dialog.closeAll();
              this.getAllPays();
              this.router.navigate(["/admin/country"]);
              this.id = null;
            }
          },
          error: (err) => {
            if (err && err.statusCode === "BAD_REQUEST") {
              this.commonService.errorToast(err.body.message);
            } else if (err.status === "400") {
              this.commonService.errorToast(err.message);
            } else {
              this.commonService.errorToast("Une erreur interne est survenue, merci de réessayer !");
            }
          }
        });
      } else {
        this.commonService.warnToast("Merci de vérifier si tous les champs sont remplis");
      }
    } catch (error) {
      this.commonService.errorToast("Erreur inattendue, merci de réessayer !");
    }
  }

  getAllPays() {
    this.countryService.getAllCountries().subscribe(datas => {
      this.allCountries = datas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });
  }

  getAllRegions() {
    this.countryService.getAllRegions().subscribe(datas => {
      this.allRegions = datas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });
  }

  // Nouvelle méthode pour basculer l'état du toggle
  toggleStatus(id: any, newStatus: boolean) {
    const country = this.allCountries.find((c: any) => c.id === id);
    if (country) {
      country.etat = newStatus;
      this.updateState(id, newStatus ? 'true' : 'false');
    }
  }

  public updateState(id: any, state: string) {
    this.countryService.updateState(id, state).then((data: any) => {
      // Gérer la réponse si nécessaire
    });
  }

  public remove(country: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Vous êtes sûr de supprimer ce pays ?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.countryService.delete(country.id).subscribe(
          () => {
            const index: number = this.allCountries.findIndex((us: any) => us.id === country.id);
            if (index !== -1) {
              this.allCountries.splice(index, 1);
            }
          },
          (error) => {
            console.error("Error deleting produit:", error);
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
        this.form.patchValue(datas);
      });
    }

    dialogRef.afterClosed().subscribe(result => {
      this.form.reset({
        nom: '',
        indicatif: '',
        description: ''
      });
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
    this.countryService.getAllRegionsByCountrie(pays.id).subscribe(datas => {
      this.allRegions = datas;
    });
  }

  onNoClick(): void {
    this.dialog.closeAll();
  }

  editRegion(index: number) {
    this.editIndex = index;
  }

  saveRegion(index: number) {
    const region = this.allRegions[index];
    this.countryService.updateRegion(region.id, region).subscribe(() => {
      this.editIndex = null;
    });
  }

  deleteRegion(index: number): void {
    const region = this.allRegions[index];
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette région ?");
    if (confirmDelete) {
      this.countryService.deleteR(region.id).subscribe(() => {
        this.editIndex = null;
      });
      this.allRegions.splice(index, 1);
    }
  }

  cancelEdit() {
    this.editIndex = null;
  }

  sortCountry(keyWord: string) {
    const ascKey = `asc${keyWord.charAt(0).toUpperCase() + keyWord.slice(1)}`;
    if (this[ascKey] === undefined) {
      this[ascKey] = true;
    }

    const isAscending = this[ascKey];
    const sortOrder = isAscending ? 1 : -1;

    this.sortedCountries = [...this.allCountries].sort((a, b) => {
      const valueA = this.getSortValue(a, keyWord);
      const valueB = this.getSortValue(b, keyWord);

      if (typeof valueA === "string" && typeof valueB === "string") {
        return valueA.localeCompare(valueB, 'fr', { sensitivity: 'base' }) * sortOrder;
      }

      if (valueA < valueB) return -sortOrder;
      if (valueA > valueB) return sortOrder;
      return 0;
    });

    this[ascKey] = !isAscending;
  }

  getSortValue(country: any, keyWord: string): any {
    switch (keyWord) {
      case "nom":
        return country.nom?.trim().toLowerCase() || '';
      case "description":
        return country.description?.trim().toLowerCase() || '';
      case "indicatif":
        return country.indicatif?.toLowerCase() || '';
      case "createdAt":
        return new Date(country.createdAt).getTime() || 0;
      default:
        return '';
    }
  }

  limitDescription(description: string, limit: number): string {
    if (!description) return '';
    if (description.length <= limit) return description;
    return description.substring(0, limit) + '...';
  }

  limitIndicatif(indicatif: string, limit: number = 10): string {
    if (!indicatif) return '';
    if (indicatif.length <= limit) return indicatif;
    return indicatif.substring(0, limit) + '...';
  }
}