import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsPage } from './settings';
import { Ng2FileInputModule } from 'ng2-file-input';

@NgModule({
  declarations: [
    SettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsPage),
    Ng2FileInputModule.forRoot()
  ],
})
export class SettingsPageModule {}
