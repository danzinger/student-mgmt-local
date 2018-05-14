import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsPage } from './settings';
import { Ng2FileInputModule } from 'ng2-file-input';

//PLUGINS:
import { File } from '@ionic-native/file';

//DIRECTIVES
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    SettingsPage,
  ],
  providers:[
    File
  ],
  imports: [
    IonicPageModule.forChild(SettingsPage),
    Ng2FileInputModule.forRoot(),
    DirectivesModule
  ],
})
export class SettingsPageModule {}
