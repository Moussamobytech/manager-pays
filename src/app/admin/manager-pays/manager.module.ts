import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerComponent } from './manager.compnent';
import { TilesComponent } from './tiles/tiles.component';

@NgModule({
  declarations: [ManagerComponent, TilesComponent],
  imports: [CommonModule],
  exports: [ManagerComponent]
})
export class ManagerModule {}
