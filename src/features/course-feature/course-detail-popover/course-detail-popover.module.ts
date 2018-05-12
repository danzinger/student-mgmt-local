import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CourseDetailPopoverPage } from './course-detail-popover';

@NgModule({
  declarations: [
    CourseDetailPopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(CourseDetailPopoverPage),
  ],
})
export class CourseDetailPopoverPageModule {}
