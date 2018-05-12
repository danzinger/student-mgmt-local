import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StudentAddPage } from './student-add';
import { Ng2FileInputModule } from 'ng2-file-input';

@NgModule({
  declarations: [
    StudentAddPage,
  ],
  imports: [
    IonicPageModule.forChild(StudentAddPage),
    Ng2FileInputModule.forRoot()
  ],
})
export class StudentAddPageModule {}
