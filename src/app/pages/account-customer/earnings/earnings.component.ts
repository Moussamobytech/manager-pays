import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-earnings',
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.scss']
})
export class EarningsComponent implements OnInit {

  balance = '2000FCFA';
  referralHistory = [
  { firstName: 'Gaoussou', lastName: 'Diarra', type: 'Client', gain: '1000F', date: '5/2/2025' },
  { firstName: 'Fanta', lastName: 'Kone', type: 'Vendeur', gain: '1000F', date: '15/1/2025' }
  ];

  constructor() { }

  ngOnInit() {
  }


}
