import { Component } from '@angular/core';

@Component({
  selector: 'app-tiles',
  templateUrl: './tiles.component.html',
  styleUrls: ['./tiles.component.scss']
})
export class TilesComponent {
  stats = [
    { label: 'Commandes en attente', value: 12 },
    { label: 'Commandes validées', value: 28 },
    { label: 'Commandes livrées', value: 19 },
    { label: 'Commandes annulées', value: 3 },
    { label: 'Ventes du mois (CFA)', value: '250 000' },
    { label: 'Ventes totales (CFA)', value: '1 200 000' }
  ];
}
