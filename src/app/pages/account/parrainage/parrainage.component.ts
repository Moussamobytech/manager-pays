import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-parrainage',
 // standalone: true,
//  imports: [],
  templateUrl: './parrainage.component.html',
  styleUrl: './parrainage.component.scss'
})
export class ParrainageComponent {

constructor(private router: Router){

}



add() {
  this.router.navigate(["/account/add-parrainage"])}

}
