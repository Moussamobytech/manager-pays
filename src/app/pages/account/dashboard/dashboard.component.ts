import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
// import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('popupTemplate') popupTemplate: TemplateRef<any>;
  rechargeForm: FormGroup;
  rechargeAmount: number;
  public form: UntypedFormGroup;
  public username : any;
  points: any = 0;
  currentUser: any;
  statsNumber: any = {
    total: 0,
    actif: 0,
    inactif: 0,
    pending: 0,
    contact:0,

  }
  constructor(private auth: AuthenticationService, private productService: ProductService,
    private router: Router, public dialog: MatDialog, private fb: FormBuilder, private snackBar:MatSnackBar) {

  }

  ngOnInit() {
    this.currentUser = this.auth.currentUser()
    //this.username = this.auth.currentUser();
   // this.points = this.currentUser.points

    // console.log("currentUser :::::::: ", this.currentUser)
    if (this.currentUser == null || this.currentUser.profiles == null || this.currentUser.profiles == undefined) {
      this.router.navigate(["/sign-in"]);
    }
    this.stats(this.currentUser.username)

    this.form = this.fb.group({
      amount: ['', Validators.required]

    });
    this.getUserById()
  }

  public add(){
    this.router.navigate(["/account/products-seller/add-product"])
  }

  currentProfile(roles) {
    // console.log("roles :::::::: ",roles)
    if (!roles) {
      return 'N/A'
    }
    let key = roles.name
    // console.log("key :::::::: ",key)
    let profil = ""
    switch (key) {
      case "ROLE_PARTICULIER":
        profil = "particulier"
        break;
      case "ROLE_BOUTIQUE":
        profil = "Boutique"
        break
      case "ROLE_ADMIN":
        profil = "Administrateur"
        break;
      case "ROLE_USER":
        profil = "Utilisateur"
        break;

      default:
        profil = "N/A"
        break;
    }
    return profil
  }

  public stats(id) {
    this.productService.stats(id).then((data: any) => {
      // console.log(data)
      this.statsNumber.total = data.total
      this.statsNumber.actif = data.actif
      this.statsNumber.inactif = data.inactif
      this.statsNumber.pending = data.pending
      this.statsNumber.contact = data.contact
    })
  }
  onNoClick(): void {
    this.dialog.closeAll();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.popupTemplate, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
      this.router.navigate(["/account/dashboard"])

    });
  }

  getUserById(){
    this.auth.info(this.currentUser.username).then((data: any) => {
      // console.log("Username ",data)
     this.username= data;
     this.points = data.points

    //  console.log("Username ",data)


    })
  }
  onRecharge() {
    if (this.form.valid) {
      const amount: number = +this.form.get('amount').value; // Ensure amount is a number
      // console.log('Amount to recharge:', amount); // Debugging line


      this.auth.recharge(amount, this.currentUser.id).subscribe(
        response => {
          // console.log('Recharge successful:', response);
          this.points = response.points

          setTimeout(() => {
            this.dialog.closeAll();
          }, 3000);
          if (amount != null) {
            // console.log("MES POINT ", this.points);

            //   this.router.navigate(["/account/dashboard"])
          }

        },
        error => {
          this.snackBar.open('Une erreur lors de la connexion, merci de réessayer !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
          console.error('Error during recharge:', error);
        }
      );
    }
  }


}
