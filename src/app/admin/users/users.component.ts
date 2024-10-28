import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppSettings, Settings } from '../../app.settings';
import { UsersService } from './users.service';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ConnectableObservable, Observable, catchError, first, lastValueFrom, map } from 'rxjs';
import { json } from 'stream/consumers';
import { User } from 'src/app/models/user.models';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UserAddForm, UserEditForm } from 'src/app/models/userForm.model';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { UserSessionService } from 'src/app/services/user-session.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ UsersService ]
})
export class UsersComponent implements OnInit {
    public users: User[];
    public sortedUsers: User[]=null;
    public searchText: string;
    public page:any;
    public settings: Settings;
    domHandlerService = inject(DomHandlerService);
    isAboveSmSize$: Observable<boolean>;
    isAboveMdSize$: Observable<boolean>;
    ascFirstname: boolean = true;
    ascLastname: boolean = true;
    ascType: boolean = true;
    ascMember: boolean = true;

    constructor(
      public appSettings: AppSettings,
      public dialog: MatDialog, private commonService: CommonMessageService,
      private authService:AuthenticationService,
      public usersService: UsersService,
      private breakpointObserver:BreakpointObserver,
      private ngxSpinnerService: NgxSpinnerService,
      private auth: AuthenticationService,
      private sessionStorage: UserSessionService,
    ){
        this.settings = this.appSettings.settings;
    }

    ngOnInit() {
        // request a size event in order to get availble screen size | Check Small size
        this.isAboveSmSize$ = this.breakpointObserver.observe([Breakpoints.Small,Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
        .pipe(
          map(result => result.matches)
        );
        // request a size event in order to get availble screen size | Check Medium size
        this.isAboveMdSize$ = this.breakpointObserver.observe([Breakpoints.Large, Breakpoints.XLarge])
        .pipe(
          map(result => result.matches)
        );
        // fetch all the users from the server
        this.getUsers();
    }

    public async getUsers(){
      await this.auth.getAllUsers().pipe(
        map((user: any) => {
          // As user.enabled comes out form server in a string format, we need to convert it into boolean
          user.enabled = (user.enabled === 'true') ? true : false;
          return user;
        }),
        catchError((error: any) => {
          console.log("Erreur lors de la transformation des données users: " + error);
          throw error;
        })
      ).subscribe(
        (data: any) => {
          // store the result in the local varibale 'users'
          this.users = data;
          // Stop the Spinner (Loader)
          this.ngxSpinnerService.hide();
        }
      );
    }


    // public getUsers(): void {
    //     this.users = null; //for show spinner each time
    //     this.usersService.getUsers().subscribe({
    //         next: (users) => {
    //             this.users = users
    //         },
    //         error: () => {
    //             this.users = [];
    //             this.ngxSpinnerService.hide()
    //         }
    //     });
    // }


    public addUser(userFormData:UserAddForm){
      let userInfo:any = {
        role:[userFormData.type.name],
        username    : (userFormData.contacts.email || userFormData.contacts.phoneNumber),
        firstname   : userFormData.firstname,
        lastname    : userFormData.lastname,
        email       : userFormData.contacts.email,
        phoneNumber : userFormData.contacts.phoneNumber,
        adresse     : userFormData.contacts.address,
        password    : userFormData.auth.password2,
        typeofUser  : (userFormData.contacts.email)? 'email'  : 'tel'
      }
      console.log(userInfo);
      return this.authService.signup(userInfo).subscribe((user:any) => {
        this.getUsers();
        this.sortUsers(this.sessionStorage.getItem("userListFilter"));
      });
    }

    public async updateUser(id:string,userFormData:UserEditForm){
      let userInfo:any = {
        type        : (userFormData.type.name),
        role:[userFormData.type.name],
        // username    : (userFormData.username),
        firstname   : (userFormData.firstname),
        lastname    : (userFormData.lastname),
        email       : (userFormData.contacts.email)||null,
        phoneNumber : (userFormData.contacts.phoneNumber),
        adresse     : (userFormData.contacts.address)||null,
        // password    : (userFormData.auth.password2)||null,
      };
      console.log("userInfo ::::: ",userInfo);

      return await this.authService.updateUser(id,userInfo).then(user =>{
        this.getUsers();
        this.sortUsers(this.sessionStorage.getItem("userListFilter"));
      });
    }
    // public deleteUser(id:any){
    //   console.log(id)
    //    this.authService.supprimerUser(id).subscribe(user => this.getUsers());
    // }

    public async deleteUser(username : any){
      try {
        console.log("::::::::::",username)
          let res : any = await this.authService.delete(username).toPromise()
          console.log("::::::RESSSSSSSSSSSS::::",res)

          this.commonService.successToast(`${res.data.message || 'Utilisateur supprimer avec succès'}.`)

          this.getUsers()
          this.sortUsers(this.sessionStorage.getItem("userListFilter"));
          return res
      } catch (error : any) {
          console.log(error);
          return "KO"
      }
    }

    public async reset(username : any){
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: "400px",
        data: {
          title: "Reinitialisation",
          message: "Vous etes sur de vouloir reinitialiser le mot de passe de cet utilisateur : "+username+" ?"
        }
      });

      dialogRef.afterClosed().subscribe(async dialogResult => {
        if (dialogResult) {
          console.log("reset ::::")

          try {
            console.log("::::::::::",username)
              let res : any = await this.authService.reset(username).toPromise()
              console.log("::::::RESSSSSSSSSSSS::::",res)
              this.commonService.successToast(`${res.message}.`)
              let link = this.createWhatsAppLink(username, res.message)
              alert(res.message)

              return res
          } catch (error : any) {
              console.log(error);
              return "KO"
          }
        }
      });


    }

    createWhatsAppLink(phone: string, password: string): string {
      const link = `https://wa.me/${phone}?text=Your%20new%20password%20is:%20${encodeURIComponent(password)}`;
      console.log('WhatsApp Link:', link);  // Affichez le lien dans la console pour le débogage
      console.log(`Sending WhatsApp message to ${phone}: ${password}`);
      return link;
    }

    public remove(user: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Suppression",
        message: "Vous etes sur de supprimer cet utilisateur : "+user.username+" ?"
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        console.log("verify ::::")
        this.deleteUser(user.username)
        // Si l'utilisateur confirme la suppression dans la boîte de dialogue
        // this.authService.supprimerUser(user.id).subscribe(
        //   () => {
        //     // Supprimer la catégorie localement après avoir été supprimée avec succès sur le serveur
        //     const index: number = this.users.findIndex((us: any) => us.id === user.id);
        //     if (index !== -1) {
        //       this.users.splice(index, 1);
        //     }
        //     console.log("Category successfully deleted.");
        //   },
        //   (error) => {
        //     console.error("Error deleting category:", error);
        //     // Traiter les erreurs éventuelles lors de la suppression de la catégorie
        //   }
        // );
      }
    });
  }
    public onPageChanged(event){
        this.page = event;
        this.getUsers();
        this.sortUsers(this.sessionStorage.getItem("userListFilter"));
        this.domHandlerService.winScroll(0, 0);
    }

    public openUserDialog(user: User,action:string){
      if(action == "add"){
        let dialogRef = this.dialog.open(UserDialogComponent, {
          data:{
            action: action
          }
        });
        dialogRef.afterClosed().subscribe(async (user: UserAddForm) => {
          if (user) {
            await this.addUser(user);
          }
        });
      }else if(action == "update"){
        let dialogRef = this.dialog.open(UserDialogComponent, {
          data:{
            user   : user,
            action : action
          }
        });
        dialogRef.afterClosed().subscribe( (data: any) => {
            if (data) {
              this.updateUser(data[0].id,data[0].user);
            }
        });
      }else if(action == "delete"){
        let dialogRef = this.dialog.open(UserDialogComponent, {
          data:{
            user   : user,
            action : action
          }
        });
        dialogRef.afterClosed().subscribe( (id: any) => {
            if (id) {
              this.deleteUser(id);
            }
        });
      }
    }

    setStatus(id: string, event: MatSlideToggleChange): void {
      // Trouver la campagne correspondante dans la liste
      const user = this.users.find(c => c.id === id);
      if (user) {
        // Mettre à jour l'état de la campagne
        user.enabled = event.checked;
        // Appeler le service ou effectuer d'autres actions nécessaires pour sauvegarder les modifications
        this.auth.setStatus(id, event.checked ? 'actif' : 'inactif').subscribe(
          () => {
            console.log(`Statut de la user ${id} modifié avec succès à ${event.checked}.`);
            this.commonService.successToast(`Statut de la user ${id} modifié avec succès à ${event.checked}.`)
            // Mettre à jour l'état de la campagne dans votre application si nécessaire
          },
          error => {
            console.error("Erreur lors du réglage du statut de user:", error);
            this.commonService.errorToast("Merci de vérifier si les champs sont toutes remplis")
            // Traiter les erreurs éventuelles lors de la modification du statut de la campagne
          }
        );
      }
    }

    sortUsers(keyWord:any){
      this.sessionStorage.setItem("userListFilter",keyWord)
      const {users} = this;
      switch(keyWord){
        case "firstname":
            if(this.ascFirstname){
              this.sortedUsers = users.sort((a, b) =>
                a.firstname.trim().localeCompare(b.firstname.trim(),
                undefined, { sensitivity: 'base' })
              );
            }else{
              this.sortedUsers = users.sort((a, b) =>
                b.firstname.trim().localeCompare(a.firstname.trim(),
                undefined, { sensitivity: 'base' })
              );
            }
            this.ascFirstname = !this.ascFirstname;
          break;
        case "lastname":
          if(this.ascLastname){
            this.sortedUsers = users.sort((a, b) =>
              a.lastname.trim().localeCompare(b.lastname.trim(),
              undefined, { sensitivity: 'base' })
            );
          }else{
            this.sortedUsers = users.sort((a, b) =>
              b.lastname.trim().localeCompare(a.lastname.trim(),
              undefined, { sensitivity: 'base' })
            );
          }
          this.ascLastname = !this.ascLastname;
          break;
        case "type":
          if(this.ascType){
            this.sortedUsers = users.sort((a, b) =>
              a.profiles[0].name.localeCompare(b.profiles[0].name,
              undefined, { sensitivity: 'base' })
            );
          }else{
            this.sortedUsers = users.sort((a, b) =>
              b.profiles[0].name.localeCompare(a.profiles[0].name,
              undefined, { sensitivity: 'base' })
            );
          }
          this.ascType = !this.ascType;
          break;
        case "member_since":
          if(this.ascMember){
            this.sortedUsers = users.sort((a, b) =>
              new Date(a.createdAt).getTime()
                -
              new Date(b.createdAt).getTime()
            );
          }else{
            this.sortedUsers = users.sort((a, b) =>
              new Date(b.createdAt).getTime()
                -
              new Date(a.createdAt).getTime()
            );
          }
          this.ascMember = !this.ascMember;
          break;
        default:
          this.sortedUsers = users;
          break;
      }
    }

}
