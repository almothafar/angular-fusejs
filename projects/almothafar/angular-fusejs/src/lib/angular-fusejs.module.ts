import { NgModule } from '@angular/core';
import { AngularFuseJsPipe } from './angular-fusejs.pipe';
import { AngularFuseJsService } from './angular-fusejs.service';


@NgModule({
  providers: [
    AngularFuseJsService
  ],
  declarations: [
    AngularFuseJsPipe
  ],
  exports: [
    AngularFuseJsPipe
  ]
})
export class AngularFuseJsModule {
}
