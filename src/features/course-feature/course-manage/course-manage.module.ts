import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CourseManagePage } from './course-manage';
import { Ng2FileInputModule } from 'ng2-file-input';

@NgModule({
  declarations: [
    CourseManagePage,
  ],
  imports: [
    IonicPageModule.forChild(CourseManagePage),
    Ng2FileInputModule.forRoot()
  ],
})
export class CourseManagePageModule {}
