import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CourseNoteUpdateModalPage } from './course-note-update-modal';

@NgModule({
  declarations: [
    CourseNoteUpdateModalPage,
  ],
  imports: [
    IonicPageModule.forChild(CourseNoteUpdateModalPage),
  ],
})
export class CourseNoteUpdateModalPageModule {}
