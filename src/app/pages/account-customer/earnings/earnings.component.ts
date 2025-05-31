import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.models';

@Component({
  selector: 'app-earnings',
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.scss']
})
export class EarningsComponent implements OnInit {

  balance: number = 0;
  referralHistory: any[] = [];
  showWithdrawalPopup: boolean = false;

<<<<<<< HEAD
  currentUser!: User;
=======
  currentUser: User;
>>>>>>> origin/adama_Gaoussou_maquette
  idUser: string;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.currentUser();
    this.idUser = this.currentUser.id;
   // this.loadBalance();
    this.loadReferralHistory();
  }

  loadReferralHistory() {
    this.authService.gainList(this.idUser).subscribe(
      (data) => {
        this.referralHistory = data;
        for (let i = 0; i < this.referralHistory.length; i++) {
          this.balance += this.referralHistory[i].montant;
        }}
    );
  }

  checkWithdrawal() {
    this.showWithdrawalPopup = true;
  }

  closePopup() {
    this.showWithdrawalPopup = false;
  }

  proceedWithdrawal() {
    // TODO: Implémenter la logique de retrait
    this.closePopup();
  }
}
