import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StudentNoteUpdateModalPage } from './student-note-update-modal';

@NgModule({
  declarations: [
    StudentNoteUpdateModalPage,
  ],
  imports: [
    IonicPageModule.forChild(StudentNoteUpdateModalPage),
  ],
})
export class StudentNoteUpdateModalPageModule {}
