import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { GoogleMapsModule } from '@angular/google-maps';

import { environment } from 'src/environments/environment';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, environment.url +'/assets/i18n/', '.json');
}

import { SharedModule } from './shared/shared.module';
import { PagesComponent } from './pages/pages.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { TopMenuComponent } from './theme/components/top-menu/top-menu.component';
// import { MenuComponent } from './theme/components/menu/menu.component';
import { SidenavMenuComponent } from './theme/components/sidenav-menu/sidenav-menu.component';
import { BreadcrumbComponent } from './theme/components/breadcrumb/breadcrumb.component';
import { OptionsComponent } from './theme/components/options/options.component';
import { FooterComponent } from './theme/components/footer/footer.component';
import { AppSettings } from './app.settings';
import { AppService } from './app.service';
import { Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { CustomOverlayContainer } from './theme/utils/custom-overlay-container';
import { MAT_MENU_SCROLL_STRATEGY } from '@angular/material/menu';
import { menuScrollStrategy } from './theme/utils/scroll-strategy';
import { AppInterceptor } from './theme/utils/app-interceptor';
import { UserSessionService } from './services/user-session.service';
import { CommonService } from './services/common.service';
import { ToastrModule } from 'ngx-toastr';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AuthenticationService } from './services/auth.service';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { ApiService } from './services/api.service';
import { CampagneService } from './services/campagne.service';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminConnectionComponent } from './pages/admin-connection/admin-connection.component';
// import { SearchResultsComponent } from './pages/search-results/search-results.component';
import { AnalyticsService } from './services/analitycs.service';
import { InfluencerService } from './services/influencer.service';
import { CaracteristiquesService } from './services/caracteristiques.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { SearchResultsModule } from './pages/search-results/search-results.module';
import { HeaderComponent } from './shared/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    PagesComponent,
    NotFoundComponent,
    AdminConnectionComponent,
    TopMenuComponent,
    // MenuComponent,
    SidenavMenuComponent,
    BreadcrumbComponent,
    OptionsComponent,
    FooterComponent,
    HeaderComponent,
    // SearchResultsComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    GoogleMapsModule,
    ShareButtonsModule,
    ShareIconsModule,
    ToastrModule.forRoot(), // ToastrModule added
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    SharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    SearchResultsModule
  ],
  providers: [
    // provideClientHydration(),
    // provideHttpClient(withFetch()),
    AppSettings,
    AppService,
    CommonService,
    UserSessionService,
    // provideHttpClient(withFetch()),
    AuthenticationService,
    ProductService,
    CategoryService,
    CampagneService,
    InfluencerService,
    CaracteristiquesService,
    ApiService,
    AnalyticsService,
    { provide: OverlayContainer, useClass: CustomOverlayContainer },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: MAT_MENU_SCROLL_STRATEGY, useFactory: menuScrollStrategy, deps: [Overlay] },
    { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
