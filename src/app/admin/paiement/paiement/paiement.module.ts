import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InputFileModule } from 'src/app/theme/components/input-file/input-file.module';
import { SwiperModule } from 'src/app/theme/components/swiper/swiper.module';
import { PipesModule } from 'src/app/theme/pipes/pipes.module';
import { UsersData } from '../../users/users.data';
import { PaiementComponent } from './paiement.component';

export const routes: Routes = [
  { path: '', component: PaiementComponent, pathMatch: 'full' },
 // { path: 'commande', component: CommandeListComponent, data: { breadcrumb: 'Commande ' } },
 // { path: 'commande-details/:id/:code', component: CommandeDetailsComponent, data: { breadcrumb: 'Commande info' } },
  //  { path: 'seller-info/:id', component: SellerInfoComponent, data: { breadcrumb: 'Seller info' } },
];

@NgModule({
  declarations: [
    PaiementComponent
  ],
  imports: [
    NgxPaginationModule,
    SwiperModule,
    InputFileModule,
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    NgxChartsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    InMemoryWebApiModule.forRoot(UsersData, { delay: 500 }),
    PipesModule,
  ],
})




export class PaiementModule { }
