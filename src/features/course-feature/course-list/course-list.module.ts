import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CourseListPage } from './course-list';

import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    CourseListPage,
  ],
  imports: [
    IonicPageModule.forChild(CourseListPage),
    DirectivesModule,
  ]
})
export class CourseListPageModule {}
