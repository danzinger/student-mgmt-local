import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StudentNewnoteModalPage } from './student-newnote-modal';

@NgModule({
  declarations: [
    StudentNewnoteModalPage,
  ],
  imports: [
    IonicPageModule.forChild(StudentNewnoteModalPage),
  ],
})
export class StudentNewnoteModalPageModule {}
