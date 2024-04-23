import { Component, OnInit } from '@angular/core';
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

  currentUser : User;
  statsNumber : any = {
    total : 0,
    actif : 0,
    inactif : 0,
    pending : 0
  }
  constructor(private auth : AuthenticationService, private productService : ProductService, private router: Router) { }

  ngOnInit() {

    this.currentUser = this.auth.currentUser()
    console.log("currentUser :::::::: ",this.currentUser)
    if (this.currentUser == null || this.currentUser.profiles == null ||this.currentUser.profiles == undefined) {
      this.router.navigate(["/sign-in"]);
    }
    this.stats(this.currentUser.username)
  }

  currentProfile(roles){
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

  public stats(id){
    this.productService.stats(id).then((data : any) =>{
      console.log(data)
      this.statsNumber.total = data.total
      this.statsNumber.actif = data.actif
      this.statsNumber.inactif = data.inactif
      this.statsNumber.pending = data.pending
    })
  }
}
