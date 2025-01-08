import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PagesComponent } from './pages/pages.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { UserAuthSessionComponent } from './pages/session/user-auth-session/user-auth-session.component';
import { AdminConnectionComponent } from './pages/admin-connection/admin-connection.component';
import { SearchResultsComponent } from './pages/search-results/search-results.component';

const routes: Routes = [
  {
      path: '',
      component: PagesComponent, children: [
          { path: '', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
          { path: 'account', loadChildren: () => import('./pages/account/account.module').then(m => m.AccountModule), data: { breadcrumb: 'Paramètres du compte' } },
          { path: 'compare', loadChildren: () => import('./pages/compare/compare.module').then(m => m.CompareModule), data: { breadcrumb: 'Compare' } },
          { path: 'wishlist', loadChildren: () => import('./pages/wishlist/wishlist.module').then(m => m.WishlistModule), data: { breadcrumb: 'Wishlist' } },
          { path: 'cart', loadChildren: () => import('./pages/cart/cart.module').then(m => m.CartModule), data: { breadcrumb: 'Cart' } },
          { path: 'checkout', loadChildren: () => import('./pages/checkout/checkout.module').then(m => m.CheckoutModule), data: { breadcrumb: 'Checkout' } },
          { path: 'contact', loadChildren: () => import('./pages/contact/contact.module').then(m => m.ContactModule), data: { breadcrumb: 'Contact' } },
          // { path: 'search', loadChildren: () => import('./pages/search/search.module').then(m => m.SearchModule), data: { breadcrumb: 'Search' } },
          { path: 'sign-in', loadChildren: () => import('./pages/session/sign-in/sign-in.module').then(m => m.SignInModule), data: { breadcrumb: 'Se connecter' } },
          { path: 'sign-up', loadChildren: () => import('./pages/sign-up/sign-up.module').then(m => m.SignUpModule), data: { breadcrumb: 'S\'inscrire ' } },
          { path: 'brands', loadChildren: () => import('./pages/brands/brands.module').then(m => m.BrandsModule), data: { breadcrumb: 'Brands' } },
          { path: 'products', loadChildren: () => import('./pages/products/products.module').then(m => m.ProductsModule), data: { breadcrumb: 'Produits' } },
          { path: 'sellers', loadChildren: () => import('./pages/seller/seller.module').then(m => m.SellerModule), data: { breadcrumb: 'Boutiques' } },
          { path: 'faq', loadChildren: () => import('./theme/faq/faq.module').then(m => m.FaqModule), data: { breadcrumb: 'FAQ' } },
          // { path: 'search-results', loadChildren: () => import('./pages/search-results/search-results.module').then(m => m.SearchResultsModule), data: { breadcrumb: 'search-results' } },
          { path: 'search-results', component: SearchResultsComponent }, // Ajouter cette ligne pour la route de recherche

      ]
  },
  { path: 'landing', loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule) },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  {
    path: '',
    component: UserAuthSessionComponent,
    children: [
      {
      path: 'authentication',
      loadChildren: () => import('./pages/session/session.module').then(m => m.SessionModule)
      },
    ]
  },
  { path: 'sign-in', loadChildren: () => import('./pages/session/sign-in/sign-in.module').then(m => m.SignInModule), data: { breadcrumb: 'Sign In ' } },

  { path: 'admin-connection', component: AdminConnectionComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
