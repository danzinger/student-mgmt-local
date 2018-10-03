import { Component} from '@angular/core';
import { IonicPage} from 'ionic-angular';

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

// By default, the first tab will be selected 
// upon navigation to the Tabs page. We can
// change the selected tab by using 
// selectedIndex on the <ion-tabs> element (IN TEMPLATE):

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
    if($ev.tabTitle == "Daten" && $ev.getActive().id != 'SettingsPage'){
      $ev.setRoot('SettingsPage');
    }
  }
  
}
