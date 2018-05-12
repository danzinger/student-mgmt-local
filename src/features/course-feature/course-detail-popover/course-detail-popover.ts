import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the CourseDetailPopoverPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-course-detail-popover',
  templateUrl: 'course-detail-popover.html',
})
export class CourseDetailPopoverPage {
  course;
  view;
  registerMode;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController) {
      
      this.course = navParams.get('course');
      this.view = navParams.get('view');
  }

  close(data?) {
    this.viewCtrl.dismiss(data);
  }

  manageCourse() {
    this.navCtrl.push('CourseManagePage', {
      course: this.course
    });
    this.close();
  }
  printCourse(){
    this.close({function:'printCourse'})
  }
}
