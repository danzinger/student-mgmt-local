import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { Settings } from '../../../app/models/settings';
import { SettingsService } from '../../../services/settings.service';
import { CourseService } from '../../../services/course.service';
import { ToastService } from '../../../services/toast.service';

/**
 * Generated class for the CourseSettingsModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-course-settings-modal',
  templateUrl: 'course-settings-modal.html',
})
export class CourseSettingsModalPage {

course;
app_wide_settings = new Settings;
course_specific_settings_exist;
settings_from_coursedetail = new Settings;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public settingsService: SettingsService,
    public courseService: CourseService,
    public toastService: ToastService,) {

    this.course = navParams.get('course');
    this.settings_from_coursedetail = navParams.get('settings_from_coursedetail');
    this.course_specific_settings_exist = this.course.course_settings ? true : false;

  }

  ionViewDidEnter() {
    this.settingsService.getAllSettings().subscribe((s) => {
      this.app_wide_settings = s;
    });
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  done(){
    if(this.course_specific_settings_exist){
      this.settings_from_coursedetail = this.settingsService.mergeCourseSettings(this.settings_from_coursedetail,this.course.course_settings)
    }
    this.courseService.updateCourse(this.course).subscribe(
      data => {
        this.toastService.showToast('Speichern erfolgreich!');
      },
      error => {
        this.toastService.showToast('Speichern fehlgeschlagen!');
      });
    this.viewCtrl.dismiss({course: this.course, settings: this.settings_from_coursedetail});
  }

  toggleCourseSettings(set_value, key) {
    if(set_value == true){
      this.course.course_settings = {
        SHOW_MARK: this.settings_from_coursedetail.SHOW_MARK,
        MARK_STRING: this.settings_from_coursedetail.MARK_STRING,
        AUTOSORT: this.settings_from_coursedetail.AUTOSORT,
        MINIMUM_THRESHOLD_CALCULATION: this.settings_from_coursedetail.MINIMUM_THRESHOLD_CALCULATION,
        MINIMUM_VALUE: this.settings_from_coursedetail.MINIMUM_VALUE,
        THRESHOLD_VALUE: this.settings_from_coursedetail.THRESHOLD_VALUE,
      };
    }
    if(set_value == false){
      this.settings_from_coursedetail = this.app_wide_settings;
      delete this.course.course_settings;
    }
  }

  updateSetting(set_value, key){
    this.course.course_settings[key] = set_value;
  }

  checkMarkString() {
    //TODO: fix type-error by using proper class definition
    let mark_string = this.course.course_settings.MARK_STRING ? this.course.course_settings.MARK_STRING : "";
    let array = mark_string.split("|")
    let resultstring = "";
    for (let mark_range of array) {
      let sub = mark_range.split(",")
      resultstring += "<pre>" + Number(sub[0]) + " &le; x < " + Number(sub[1]) + " : " + sub[2] + "<br></pre>"
    }
    let alert = this.alertCtrl.create({
      title: 'Notendefinition:',
      subTitle: resultstring,
      buttons: ['Verstanden']
    });
    alert.present();
  }

  printInfo() {
    console.log(
      'this.course: ', this.course,
      '\nthis.settings: ', this.settings_from_coursedetail)
  }

}
