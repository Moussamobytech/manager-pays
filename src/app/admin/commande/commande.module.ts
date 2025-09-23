import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Import correct du composant
import { CommandeListComponent } from './commande-list/commande-list.component';

export const routes: Routes = [
  {
    path: '',
    component: CommandeListComponent,
    pathMatch: 'full'
  },
  {
    path: 'commande',
    component: CommandeListComponent,
    data: { breadcrumb: 'Commande' }
  },
];

@NgModule({
  declarations: [
    CommandeListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    CommandeListComponent
  ]
})
export class CommandeModule {}