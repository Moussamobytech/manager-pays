import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { catchError, map } from 'rxjs';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-vendeur-select-dialog-component',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './vendeur-select-dialog-component.component.html',
  styleUrl: './vendeur-select-dialog-component.component.scss'
})
export class VendeurSelectDialogComponentComponent {
  vendeurs: any[] = [];
  selectedUsername: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private auth: AuthenticationService,
  ) {}

  ngOnInit(): void {
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
        // store the result in the 
        // local varibale 'users'
        //this.vendeurs = data;

        this.vendeurs = data.filter(user =>
          user.profiles?.some((profile: any) => profile.name === 'ROLE_BOUTIQUE')
        );

        // Stop the Spinner (Loader)
       // this.ngxSpinnerService.hide();
      }
    );
  }
}
