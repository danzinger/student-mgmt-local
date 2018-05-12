import { Component} from '@angular/core';
import { IonicPage} from 'ionic-angular';

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = 'CourseListPage';
  tab2Root = 'StudentsListPage';
  tab3Root = 'SettingsPage';

  constructor() { 

  }
  tabChanged($ev){
    if($ev.tabTitle == "Kurse" && $ev.getActive().id != 'CourseListPage'){
      $ev.setRoot('CourseListPage');
    }
    if($ev.tabTitle == "Studenten" && $ev.getActive().id != 'StudentsListPage'){
      $ev.setRoot('StudentsListPage');
    }
    if($ev.tabTitle == "Einstellungen" && $ev.getActive().id != 'SettingsPage'){
      $ev.setRoot('SettingsPage');
    }
  }
  
}
