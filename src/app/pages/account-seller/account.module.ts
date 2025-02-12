import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AccountComponent } from './account.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InformationComponent } from './information/information.component';
import { AddressesComponent } from './addresses/addresses.component';
import { OrdersComponent } from './orders/orders.component';
import { ProductsComponent } from './products/products.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { AddProductComponent } from './add-product/add-product.component';
import { SwiperModule } from 'src/app/theme/components/swiper/swiper.module';
import { InputFileConfig, InputFileModule } from 'src/app/theme/components/input-file/input-file.module';
import { AuthGuard } from 'src/app/helpers/auth.guard';
import { HowWorksComponent } from './how_works/how_works.component';
import { OrdersManageComponents } from './orders-manage/orders-manage.components';
import { ParrainageComponent } from './parrainage/parrainage.component';
import { AddParrainageComponent } from './add-parrainage/add-parrainage.component';
const config: InputFileConfig = {
  fileAccept: '*'
};

export const routes: Routes = [
  {
      path: '',
      canActivate: [AuthGuard],
      canLoad: [AuthGuard],
      component: AccountComponent, children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: DashboardComponent, data: {  breadcrumb: 'Dashboard' } },
          { path: 'information', component: InformationComponent, data: {  breadcrumb: 'Information' } },
          { path: 'products-seller', component: ProductsComponent, data: {  breadcrumb: 'Produits' } },
          { path: 'products-seller/add-product', component: AddProductComponent, data: { breadcrumb: 'Ajouter un Produit' } },
          { path: 'products-seller/edit-product/:id', component: AddProductComponent, data: { breadcrumb: 'Modifier un Produit' } },
          { path: 'how_works', component: HowWorksComponent, data: { breadcrumb: 'Comment ca marche ?' } },
          { path: 'addresses', component: AddressesComponent, data: {  breadcrumb: 'Addresses' } },
          { path: 'customers', loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule), data: {  breadcrumb: 'Clients' } },
          { path: 'orders', component: OrdersComponent, data: {  breadcrumb: 'Mes achats' } },
          { path: 'orders-manage', component: OrdersManageComponents, data: {  breadcrumb: 'Gestion commandes' } },
          { path: 'parrainage', component: ParrainageComponent, data: {  breadcrumb: 'Gestion commandes' } },
          { path: 'add-parrainage', component: AddParrainageComponent, data: {  breadcrumb: 'Ajouter un parrainage' } },
      ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    NgxPaginationModule,
    SwiperModule,
    InputFileModule.forRoot(config),
    InputFileModule,
    // CustomersModule
  ],
  declarations: [
    AccountComponent,
    DashboardComponent,
    InformationComponent,
    AddressesComponent,
    AddProductComponent,
    ProductsComponent,
    HowWorksComponent,
    OrdersComponent,
    OrdersManageComponents,
    ParrainageComponent,
    AddParrainageComponent
    //OrdersManageComponent
  ]
})
export class AccountSellerModule { }
