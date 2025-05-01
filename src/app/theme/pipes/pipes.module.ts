import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilterByIdPipe } from './filter-by-id.pipe';
import { FilterBrandsPipe } from './filter-brands.pipe';
import { BrandSearchPipe } from './brand-search.pipe';
import { ProfilePicturePipe } from './profilePicture.pipe';
import { UserSearchPipe } from './user-search.pipe';
import { CapitalCasePipe } from './capitalCase.pipe';
import { RoundNamePipe } from './roundName.pipe';
import { UserTypePipe } from './userType.pipe';
import { SafePipe } from './safe.pipe';
import { ExportButtonShowPipe } from './export-button-show.pipe';
import { CommandeSearchPipe } from './commandeSearche.pipe';
import { OrderSearchPipe } from './orderSearch.pipe';
import { CustomerSearchPipe } from './customer-search.pipe';
import { DiscountConverterPipe } from './discountConverter.pipe';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
      FilterByIdPipe,
      FilterBrandsPipe,
      BrandSearchPipe,
      ProfilePicturePipe,
      UserSearchPipe,
      CapitalCasePipe,
      RoundNamePipe,
      UserTypePipe,
      SafePipe,
      ExportButtonShowPipe,
      CustomerSearchPipe,
      DiscountConverterPipe,
      CommandeSearchPipe,
      OrderSearchPipe
   ],
    exports: [
      FilterByIdPipe,
      FilterBrandsPipe,
      BrandSearchPipe,
      ProfilePicturePipe,
      UserSearchPipe,
      CapitalCasePipe,
      RoundNamePipe,
      UserTypePipe,
      SafePipe,
      ExportButtonShowPipe,
      CustomerSearchPipe,
      DiscountConverterPipe,
      CommandeSearchPipe,
      OrderSearchPipe
    ]
})
export class PipesModule { }
