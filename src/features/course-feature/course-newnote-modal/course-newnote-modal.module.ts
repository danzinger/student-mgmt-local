import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CourseNewnoteModalPage } from './course-newnote-modal';

@NgModule({
  declarations: [
    CourseNewnoteModalPage,
  ],
  imports: [
    IonicPageModule.forChild(CourseNewnoteModalPage),
  ],
})
export class CourseNewnoteModalPageModule {}
