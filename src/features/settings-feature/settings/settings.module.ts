import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsPage } from './settings';
import { Ng2FileInputModule } from 'ng2-file-input';

//PLUGINS:
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';

//DIRECTIVES
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    SettingsPage
  ],
  providers:[
    File,
    FileChooser,
    FilePath
  ],
  imports: [
    IonicPageModule.forChild(SettingsPage),
    Ng2FileInputModule.forRoot({
      showPreviews:false
    }),
    DirectivesModule
  ],
})
export class SettingsPageModule {}
