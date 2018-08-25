import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { CourseService } from '../../../services/course.service';

import { ToastService } from '../../../services/toast.service';
import { MongoIdService } from '../../../services/mongo-id.service';
/**
 * Generated class for the CourseManagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-course-manage',
  templateUrl: 'course-manage.html',
})
export class CourseManagePage {
  course;
  constructor(
    public navCtrl: NavController,
    public courseService: CourseService,
    public alertCtrl: AlertController,
    public toastService: ToastService,
    public navParams: NavParams,
    public mongoIdService: MongoIdService, ) {

    this.course = navParams.get('course');
  }

  done() {
    this.updateCourse(this.course);
  }
  cancel() {
    this.navCtrl.pop();
  }

  updateCourse(course) {
    let alert = this.alertCtrl.create({
      title: 'Bestätigen',
      message: 'Änderung speichern?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Ok',
          handler: () => {
            this.courseService.updateCourse(course).subscribe(
            course => {
              this.course = course;
              this.toastService.showToast('Änderung erfolgreich gespeichert.');
              this.navCtrl.pop();
            },
            error => {
                this.toastService.showToast('Fehler beim Speichern.');
            });
          }
        }
      ]
    });
    alert.present();
  }


}
