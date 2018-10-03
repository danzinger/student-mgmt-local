import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StudentsListPage } from './students-list';

import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    StudentsListPage,
  ],
  imports: [
    DirectivesModule,
    IonicPageModule.forChild(StudentsListPage),
  ],
  providers:[
  ]
})
export class StudentsListPageModule {}
