import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CourseDetailPage } from './course-detail';

import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    CourseDetailPage
  ],
  imports: [
    IonicPageModule.forChild(CourseDetailPage),
    DirectivesModule
  ],
  providers: []
})
export class CourseDetailPageModule {}
