import { ManagerComponent } from './manager-pays/manager.compnent';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { InputFileConfig, InputFileModule } from 'src/app/theme/components/input-file/input-file.module';
const config: InputFileConfig = {
  fileAccept: '*'
};

import { AdminComponent } from './admin.component';
import { MenuComponent } from './components/menu/menu.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { FullScreenComponent } from './components/fullscreen/fullscreen.component';
import { MessagesComponent } from './components/messages/messages.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { AdminGuard } from '../helpers/admin.guard';
import { CountryComponent } from './country/country.component';

export const routes = [
  {
    path: '',
    canActivate: [AdminGuard],
    canLoad: [AdminGuard],
    component: AdminComponent, children: [
      { path: '', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'products', loadChildren: () => import('./products/products.module').then(m => m.ProductsModule) },
      { path: 'sales', loadChildren: () => import('./sales/sales.module').then(m => m.SalesModule) },
      { path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersModule), data: { breadcrumb: 'Users' } },
      { path: 'customers', loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule), data: { breadcrumb: 'Customers' } },
      { path: 'coupons', loadChildren: () => import('./coupons/coupons.module').then(m => m.CouponsModule), data: { breadcrumb: 'Coupons' } },
      { path: 'withdrawal', loadChildren: () => import('./withdrawal/withdrawal.module').then(m => m.WithdrawalModule), data: { breadcrumb: 'Withdrawal' } },
      { path: 'analytics', loadChildren: () => import('./analytics/analytics.module').then(m => m.AnalyticsModule), data: { breadcrumb: 'Analytics' } },
      { path: 'refund', loadChildren: () => import('./refund/refund.module').then(m => m.RefundModule), data: { breadcrumb: 'Refund' } },
      { path: 'followers', loadChildren: () => import('./followers/followers.module').then(m => m.FollowersModule), data: { breadcrumb: 'Followers' } },
      { path: 'support', loadChildren: () => import('./support/support.module').then(m => m.SupportModule), data: { breadcrumb: 'Support' } },
      { path: 'reviews', loadChildren: () => import('./reviews/reviews.module').then(m => m.ReviewsModule), data: { breadcrumb: 'Reviews' } },
      { path: 'campagne', loadChildren: () => import('./campagne/campagne.module').then(m => m.CampagneModule), data: { breadcrumb: 'Campagne' } },
      { path: 'brand', loadChildren: () => import('./brands/brand.module').then(m => m.BrandModule), data: { breadcrumb: 'Brand' } },
      { path: 'caracteristiques', loadChildren: () => import('./caracteristiques/caracteristiques.module').then(m => m.CaracteristiquesModule), data: { breadcrumb: 'Caracteristique' } },
      { path: 'influencer', loadChildren: () => import('./influencer/influencer.module').then(m => m.InfluencerModule), data: { breadcrumb: 'Influencer' } },
      { path: 'contact', loadChildren: () => import('./contact/contact.module').then(m => m.ContactModule), data: { breadcrumb: 'Contact' } },
      { path: 'newsletter', loadChildren: () => import('./newsletter/newsletter.module').then(m => m.NewsletterModule), data: { breadcrumb: 'Newsletter' } },
      { path: 'information', loadChildren: () => import('./information/information.module').then(m => m.InformationModule), data: { breadcrumb: 'Information' } },
      { path: 'commande', loadChildren: () => import('./commande/commande.module').then(m => m.CommandeModule), data: { breadcrumb: 'Commande' } },
      { path: 'country', loadChildren: () => import('./country/county.module').then(m => m.CountryModule), data: { breadcrumb: 'Pays' } },
      { path: 'paiement', loadChildren: () => import('./paiement/paiement/paiement.module').then(m => m.PaiementModule), data: { breadcrumb: 'Les paiements effectués' } },
      { path: 'search-terme', loadChildren: () => import('./search-terme/search-terme.module').then(m => m.SearchTermeModule), data: { breadcrumb: 'Termes de recherche' } },
      { 
  path: 'manager-pays', 
  loadChildren: () => import('./manager-pays/manager.module').then(m => m.ManagerModule), 
  data: { breadcrumb: 'Manager Pays' } 
},
{ path: 'vendors', loadChildren: () => import('./vendors/vendors.module').then(m => m.VendorsModule), data: { breadcrumb: 'Vendeurs' } }


    ]
  }
];

@NgModule({
  declarations: [
    AdminComponent,
    MenuComponent,
    UserMenuComponent,
    FullScreenComponent,
    MessagesComponent,
    BreadcrumbComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    InputFileModule.forRoot(config),
  ]
})
export class AdminModule { }
