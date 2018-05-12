import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StudentUpdateModalPage } from './student-update-modal';

@NgModule({
  declarations: [
    StudentUpdateModalPage,
  ],
  imports: [
    IonicPageModule.forChild(StudentUpdateModalPage),
  ],
})
export class StudentUpdateModalPageModule {}
