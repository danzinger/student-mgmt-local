import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StudentAddPage } from './student-add';
import { Ng2FileInputModule } from 'ng2-file-input';

//PLUGINS:
import { File } from '@ionic-native/file';

@NgModule({
  declarations: [
    StudentAddPage,
  ],
  providers:[
    File
  ],
  imports: [
    IonicPageModule.forChild(StudentAddPage),
    Ng2FileInputModule.forRoot({
      showPreviews:false,
    })
  ],
})
export class StudentAddPageModule {} 
