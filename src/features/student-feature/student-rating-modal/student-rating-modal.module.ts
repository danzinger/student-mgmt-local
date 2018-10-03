import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StudentRatingModalPage } from './student-rating-modal';

@NgModule({
  declarations: [
    StudentRatingModalPage,
  ],
  imports: [
    IonicPageModule.forChild(StudentRatingModalPage),
  ],
})
export class StudentRatingModalPageModule {}
