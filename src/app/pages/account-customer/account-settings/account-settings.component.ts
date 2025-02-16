import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  settingForm: UntypedFormGroup;
  selectedCountry: any;
  phoneMask: string = '00 00 00 00'; // Default mask for Mali
  hidePassword = true;
  hideConfirm = true;
  countries = [
    { code: 'ML', name: 'Mali', phoneCode: '+223', placeholder: 'XX XX XX XX', mask: '00 00 00 00' },
    { code: 'CI', name: 'Côte d’Ivoire', phoneCode: '+225', placeholder: 'XX XX XX XXXX', mask: '00 00 00 0000' }
  ];
  constructor(public formBuilder: UntypedFormBuilder) { }

  ngOnInit() {
    this.selectedCountry = this.countries.find(c => c.code === 'ML');

    this.settingForm = this.formBuilder.group({
      firstname: [''],
      lastname: [''],
      country: ['ML'],
      username: [''],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['', [Validators.minLength(6)]],
    });
  }

  get settingFormControls() { return this.settingForm.controls; }

  onSettingFormSubmit(value: any) {
    console.log(value);
  }

}
