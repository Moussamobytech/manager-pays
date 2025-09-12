import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from 'src/app/models/user.models';
import { StringMatchValidators } from 'src/app/shared/confirmed.validator';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  public form: UntypedFormGroup;
  public user: User | null;
  public action: string;

  public userTypes: any[] = [
    { value: 'admin', viewValue: 'Admin' },
    { value: 'manager', viewValue: 'Manager' },
    { value: 'commercial', viewValue: 'Commercial' },
    { value: 'vendeur', viewValue: 'Vendeur' },
    { value: 'client', viewValue: 'Client' }
  ];

  // Liste de pays pour formulaire ET filtre
  public countries: string[] = [
    'Mali', 'France', 'Sénégal', 'Côte d’Ivoire', 'Maroc',
    'Algérie', 'Tunisie', 'États-Unis', 'Canada'
  ];

  public hide: boolean = true;
  public hide2: boolean = true;

  constructor(
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
  ) {
    this.user = data?.user ?? null;
    this.action = data?.action ?? 'add';

    if (this.action === "add") {
      this.form = this.fb.group({
        firstname: [null, Validators.required],
        lastname: [null, Validators.required],
        type: this.fb.group({
          name: [null, Validators.required],
        }),
        contacts: this.fb.group({
          country: [null, Validators.required],
          email: [null, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
          phoneNumber: [null, [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.minLength(8)]],
          address: null,
        }),
        auth: this.fb.group({
          password1: [null, [Validators.required, Validators.minLength(6)]],
          password2: [null, [Validators.required, Validators.minLength(6)]],
        }, { validators: StringMatchValidators.MatchValidator('password1', 'password2') }),
      });
    } else if (this.action === "update") {
      this.form = this.fb.group({
        firstname: [this.user?.firstname, Validators.required],
        lastname: [this.user?.lastname, Validators.required],
        type: this.fb.group({
          name: this.user?.profiles ? this.user.profiles[0].name : 'client',
        }),
        contacts: this.fb.group({
          country: [this.user?.country, Validators.required],
          email: [this.user?.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
          phoneNumber: [this.user?.phoneNumber, [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.minLength(8)]],
          address: this.user?.adresse,
        }),
      });
    } else {
      this.form = this.fb.group({}); // inutile en delete
    }
  }

  ngOnInit() { }

  close(): void {
    this.dialogRef.close();
  }

  end(userId?: any, formVal?: any) {
    if (this.action === "update") {
      return [{ user: formVal, id: userId }];
    } else if (this.action === "add") {
      return formVal;
    } else if (this.action === "delete") {
      return this.user?.id ?? userId;  // ✅ corrige bouton delete
    }
  }
}