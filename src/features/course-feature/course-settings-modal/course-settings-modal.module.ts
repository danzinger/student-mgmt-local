import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CourseSettingsModalPage } from './course-settings-modal';

@NgModule({
  declarations: [
    CourseSettingsModalPage,
  ],
  imports: [
    IonicPageModule.forChild(CourseSettingsModalPage),
  ],
})
export class CourseSettingsModalPageModule {}
