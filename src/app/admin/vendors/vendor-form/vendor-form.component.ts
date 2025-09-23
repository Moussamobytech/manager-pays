import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VendorsService } from '../vendors.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-vendor-form',
  templateUrl: './vendor-form.component.html',
  styleUrls: ['./vendor-form.component.scss']
})
export class VendorFormComponent implements OnInit {
  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;
  form!: FormGroup;
  countries = ['Sénégal','Maroc','Côte d\'Ivoire','Ghana','Nigeria','Mali','Cameroun','Kenya','Tunisie','Algérie','Égypte'];

  // controls for password visibility
  showPassword = false;
  showConfirmPassword = false;

  // vendor types options
  vendorTypeOptions = ['Grossiste', 'Détaillant', 'Revendeur'];

  // multi-step state
  currentStep = 1;
  editingId: number | null = null;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private vendorsService: VendorsService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      shopName: ['', [Validators.minLength(2)]],
      city: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', [Validators.required]],
      country: ['', [Validators.required]],
  password: ['', [Validators.minLength(6)]],
  confirmPassword: [''],
      hasShop: [false],
      vendorTypes: this.fb.array([]),
      logo: [null]
    }, { validators: this.passwordsMatchValidator });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      const existing = this.vendorsService.getVendorsValue().find(v => v.id === id);
      if (existing) {
        this.editingId = id;
  // show full form when editing
  this.currentStep = 2;
        this.form.patchValue({
          firstName: existing.firstName,
          lastName: existing.lastName,
          shopName: existing.shopName,
          city: existing.city,
          address: existing.address,
          phone: existing.phone,
          country: existing.country
        });
  // when editing, password is optional: clear validators and re-validate
  this.form.get('password')?.clearValidators();
  this.form.get('confirmPassword')?.clearValidators();
  this.form.get('password')?.updateValueAndValidity();
  this.form.get('confirmPassword')?.updateValueAndValidity();
      }
    }
  }

  // Helper to get vendorTypes FormArray
  get vendorTypesFormArray(): FormArray {
    return this.form.get('vendorTypes') as FormArray;
  }

  onVendorTypeChange(event: any, type: string) {
    if (event.checked) {
      this.vendorTypesFormArray.push(new FormControl(type));
    } else {
      const idx = this.vendorTypesFormArray.controls.findIndex(c => c.value === type);
      if (idx >= 0) this.vendorTypesFormArray.removeAt(idx);
    }
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.form.get('logo')?.setValue(file);
    }
  }

  // Validator to ensure password and confirmPassword match
  passwordsMatchValidator(group: AbstractControl) {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  // allow empty passwords (no change) when editing
  if (!password && !confirm) return null;
  return password === confirm ? null : { passwordMismatch: true };
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  triggerLogoInput() {
    this.logoInput?.nativeElement.click();
  }

  hasVendorType(type: string): boolean {
    return this.vendorTypesFormArray.controls.some(c => c.value === type);
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      this.cancel();
    }
  }

  submit() {
    // if on first step, validate step1 controls and move to step 2
    if (this.currentStep === 1) {
      const step1Controls = ['firstName', 'lastName', 'country', 'phone'];
      let invalid = false;
      step1Controls.forEach(name => {
        const c = this.form.get(name);
        if (c) {
          c.markAsTouched();
          if (c.invalid) invalid = true;
        }
      });
      if (invalid) return;
      this.currentStep = 2;
      return;
    }

    // final submission on step 2
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { firstName, lastName, shopName, city, address, phone, country } = this.form.value;
    const vendorPayload = { firstName, lastName, shopName, city, address, phone, country };
    if (this.editingId) {
      this.vendorsService.updateVendor(this.editingId, vendorPayload);
      this.snack.open('Vendeur mis à jour', 'Fermer', { duration: 2500, panelClass: ['snack-success'] });
    } else {
      this.vendorsService.addVendor(vendorPayload);
      this.snack.open('Vendeur enregistré avec succès', 'Fermer', { duration: 3000, panelClass: ['snack-success'] });
    }
    this.router.navigate(['/admin/vendors']);
  }

  cancel() {
    this.router.navigate(['/admin/vendors']);
  }
}