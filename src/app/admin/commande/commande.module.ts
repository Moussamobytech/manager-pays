import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { SwiperModule } from 'src/app/theme/components/swiper/swiper.module';
import { InputFileModule } from 'src/app/theme/components/input-file/input-file.module';
import { CommandeListComponent } from './commande-list/commande-list.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { PipesModule } from 'src/app/theme/pipes/pipes.module';
import { UsersData } from '../users/users.data';
import { CommandeDetailsComponent } from './commande-details/commande-details.component';

export const routes: Routes = [
    { path: '', component: CommandeListComponent, pathMatch: 'full' },
    { path: 'commande', component: CommandeListComponent, data: { breadcrumb: 'Commande ' } },
    { path: 'commande-details/:id/:code', component: CommandeDetailsComponent, data: { breadcrumb: 'Commande info' } },
    //  { path: 'seller-info/:id', component: SellerInfoComponent, data: { breadcrumb: 'Seller info' } },
];

@NgModule({
    declarations: [
        CommandeListComponent,
        CommandeDetailsComponent,
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
    ]
})
export class CommandeModule { }
