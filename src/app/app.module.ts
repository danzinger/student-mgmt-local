import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';


//SERVICES:
import { StudentService } from '../services/student-service';
import { CourseService } from '../services/course.service';
import { ToastService } from '../services/toast.service';
import { MongoIdService } from '../services/mongo-id.service';
import { PapaParseService } from 'ngx-papaparse';

//PLUGINS:
import { File } from '@ionic-native/file';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    StudentService,
    CourseService,
    ToastService,
    MongoIdService,
    PapaParseService,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
