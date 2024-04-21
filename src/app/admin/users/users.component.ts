import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppSettings, Settings } from '../../app.settings';
import { UsersService } from './users.service';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService } from 'src/app/services/auth.service';
import { Observable, catchError, first, lastValueFrom, map } from 'rxjs';
import { json } from 'stream/consumers';
import { User } from 'src/app/models/user.models';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UserAddForm, UserEditForm } from 'src/app/models/userForm.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ UsersService ]
})
export class UsersComponent implements OnInit {
    public users: User[];
    public searchText: string;
    public page:any;
    public settings: Settings;
    domHandlerService = inject(DomHandlerService);
    isAboveSmSize$: Observable<boolean>;
    isAboveMdSize$: Observable<boolean>;

    constructor(
      public appSettings: AppSettings,
      public dialog: MatDialog,
      private authService:AuthenticationService,
      public usersService: UsersService,
      private breakpointObserver:BreakpointObserver,
      private ngxSpinnerService: NgxSpinnerService,
      private auth: AuthenticationService
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
      return this.authService.signup(userInfo).subscribe((user:any) => this.getUsers());
    }

    public async updateUser(id:string,userFormData:UserEditForm){
      let userInfo:any = {
        type        : (userFormData.type.name),
        // username    : (userFormData.username),
        firstname   : (userFormData.firstname),
        lastname    : (userFormData.lastname),
        email       : (userFormData.contacts.email)||null,
        phoneNumber : (userFormData.contacts.phoneNumber),
        adresse     : (userFormData.contacts.address)||null,
        // password    : (userFormData.auth.password2)||null,
      };
        return await this.authService.updateUser(id,userInfo).then(user => this.getUsers());
    }
    public deleteUser(id:any){
      console.log(id)
      //  this.usersService.deleteUser(user.id).subscribe(user => this.getUsers());
    }


    public onPageChanged(event){
        this.page = event;
        this.getUsers();
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

}
