import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CourseDetailPage } from './course-detail';

import { DirectivesModule } from '../../../directives/directives.module';
//PLUGINS:
import { File } from '@ionic-native/file';

@NgModule({
  declarations: [
    CourseDetailPage
  ],
  providers:[
    File
  ],
  imports: [
    IonicPageModule.forChild(CourseDetailPage),
    DirectivesModule
  ]
})
export class CourseDetailPageModule {}
