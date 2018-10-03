import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StudentDetailPage } from './student-detail';

import { DirectivesModule } from '../../../directives/directives.module';


@NgModule({
  declarations: [
    StudentDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(StudentDetailPage),
    DirectivesModule
  ],
})
export class StudentDetailPageModule {}
