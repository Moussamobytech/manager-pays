import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {
  public userImage = 'assets/images/others/admin.jpg';
  currentUser : User;
  constructor(private auth : AuthenticationService) { }

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser()
    console.log("currentUser :::::::: ",this.currentUser)

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

}
