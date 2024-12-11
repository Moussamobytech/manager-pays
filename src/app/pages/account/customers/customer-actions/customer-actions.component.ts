import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from 'src/app/models/customers.model';
import { ExcelOperationService } from 'src/app/services/excel-operation.service';
import { CustomersService } from '../customers.service';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-customer-actions',
  templateUrl: './customer-actions.component.html',
  styleUrls: ['./customer-actions.component.scss'],
})
export class CustomerActionsComponent implements OnInit {
  form: FormGroup;
  action: string;
  customer: Customer
  customerId: any;
  boutiqueName: string;
  SelectedExlFileName:any;
  selectedExFile: File|null = null;
  generalError:string = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private exlService: ExcelOperationService,
    private customerService: CustomersService,
    private auth: AuthenticationService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.action = this.route.snapshot.paramMap.get('action')!;
    this.customerId = this.route.snapshot.paramMap.get('id')!;
    this.boutiqueName = this.auth.currentUser().username;
    this.initializeForm();
  }

  initializeForm(){
    this.form = this.fb.group({
      prenom: [null, Validators.required],
      nom: [null],
      contacts: this.fb.group({
        email: [null, [Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
        numero: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
        adresse: [null],
      }),
      exldata: [null],
    });

    if (this.action === 'update') {
      this.loadCustomerData();
    }

    if (this.action === 'delete') {
      this.customerService.getCustomerById(this.customerId).then((data) => {
        this.customer = data;
        // console.log(this.customer)
      });
    }
  }

  loadCustomerData() {
    this.customerService.getCustomerById(this.customerId).then((data) => {
      const customerData = {
        prenom: data.prenom,
        nom: data.nom,
        contacts: {
          email: data.email,
          numero: data.numero,
          adresse: data.adresse,
        },
      };
      // console.log(customerData)
      this.form.patchValue(customerData);
    });
  }


  submitForm(): void {
    if (this.action === 'add') {
      // console.log('Add Customer: ', this.form.value);

      if (this.selectedExFile) {
        this.exlService.importCustomerFromExcel(this.selectedExFile)
          .then((customers: Customer[]) => {

            const allCustomersHaveRequiredFields = customers.every(customer =>
              customer.prenom && customer.numero
            );
            if (!allCustomersHaveRequiredFields) {
              this.generalError = "Les colonnes 'Prénom' et 'Numero' du fichier exel sont requis. Veuillez les revoirs puis réesayer.";
              return;
            }
            // const allEmailsAreValid = customers.every(customer =>
            //   !customer.email || /^[\w.-]+@[\w-]+\.[\w-]{2,4}$/.test(customer.email)
            // );

            // if (!allEmailsAreValid) {
            //   this.generalError = "Une ou plusieurs adresses e-mail ne sont pas valides. Veuillez les corriger ou les enlever car elles ne sont pas obligatoires.";
            //   return;
            // }

            console.log(customers);
            // this.customerService.addMultipleCustomers(customers);
            // this.snackBar.open("Les clients ont été ajoutés avec succès.",'x',{ panelClass: 'success', verticalPosition: 'top', duration: 3500 });
            // this.router.navigate(['account/customers']);
          })
          .catch(error => {
            if(error.name)
            this.generalError = "Le nom de colonne '"+error.name+"' n'est pas reconnu. Veuillez utiliser le format correct en téléchargeant le modèle de base et réessayez.";
            else if(error.FileEmpty)
            this.generalError = "Le fichier Excel est vide. Veuillez vous assurer qu'il contient des données."
            else
            console.error("Erreur lors de l'importation du fichier Excel: ", error);
          });
      } else {
        if (this.form.valid) {
          const formData = this.form.value;
          let customer = {
            prenom: formData.prenom,
            nom: formData.nom,
            email: formData.contacts.email,
            numero: formData.contacts.numero,
            adresse: formData.contacts.adresse,
            boutique: this.boutiqueName,
          }
          this.customerService.addCustomer(customer);
          this.snackBar.open("Le client a été ajouté avec succès.",'x',{ panelClass: 'success', verticalPosition: 'top', duration: 3500 });
          this.router.navigate(['account/customers']);
        } else {
          this.snackBar.open("Veuillez vérifier les champs puis réessayer !",'x',{ panelClass: 'error', verticalPosition: 'top', duration: 3500 });
        }
      }

    } else if (this.action === 'update') {
      if (this.form.valid) {
        const formData = this.form.value;
        let customer = {
          prenom: formData.prenom,
          nom: formData.nom,
          email: formData.contacts.email,
          adresse: formData.contacts.adresse,
        }
        this.customerService.updateCustomer(customer,this.customerId);
        this.snackBar.open("Le client a été mis à jour avec succès.",'x',{ panelClass: 'success', verticalPosition: 'top', duration: 3500 });
        this.router.navigate(['account/customers']);
      } else {
        this.snackBar.open("Veuillez vérifier les champs puis réessayer !",'x',{ panelClass: 'error', verticalPosition: 'top', duration: 3500 });
      }
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.toggleValidators(false);
      const file = input.files[0];
      this.selectedExFile = file;
      if(file.name.length>20){
        this.SelectedExlFileName = file.name.substring(0,12)+'...'+file.name.substring(file.name.length-4);
      }else{
        this.SelectedExlFileName = file.name;
        this.toggleValidators(true);
      }
    }
  }

  private toggleValidators(enable: boolean): void {
    const controls = this.form.controls;

    if (enable) {
      controls['prenom'].setValidators([Validators.required]);

      const contactControls = this.form.get('contacts') as FormGroup;
      contactControls.controls['email'].setValidators([
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      ]);
      contactControls.controls['numero'].setValidators([
        Validators.required,
        Validators.pattern(/^\d+$/),
      ]);
    } else {
      controls['prenom'].clearValidators();

      const contactControls = this.form.get('contacts') as FormGroup;
      contactControls.controls['email'].clearValidators();
      contactControls.controls['numero'].clearValidators();
    }

    // Update validity after modifying validators
    this.form.updateValueAndValidity();
  }

  exportXlsCustomerTemplate(event: Event){
    event.preventDefault();
    let template = [{
      Prénom: '',
      Nom: '',
      Email: '',
      Numéro: '',
      Adresse: '',
    }];
    this.exlService.exportToExcel(template,'modele_dimport_client');
  }

  triggerImportInput(event: MouseEvent): void {
    event.preventDefault();
    const inputElement = document.querySelector<HTMLInputElement>('input[formControlName="exldata"]');
    inputElement?.click();
  }

  removeSelectedFile(event:Event){
    event.preventDefault();
    this.selectedExFile = null;
    this.generalError = null;
  }

  confirmDelete(): void {
    this.customerService.deleteCustomer(this.customerId);
    this.snackBar.open("Le client a supprimé avec succès.",'x',{ panelClass: 'success', verticalPosition: 'top', duration: 3500 });
    this.router.navigate(['account/customers']);
  }

  cancel(): void {
    this.router.navigate(['account/customers']);
  }
}
