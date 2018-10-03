import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController, IonicPage } from 'ionic-angular';
import { StudentService } from '../../../services/student-service';
import { ToastService } from '../../../services/toast.service';

import { MongoIdService } from '../../../services/mongo-id.service';

// export class Rating {
//   //student_id: String;
//   course_id: String;
//   //category_name: String;
//   category_id: String;
//   date_readable: String;
//   points: Number = 0;
//   remarks: String;
// }

@IonicPage()
@Component({
  selector: 'page-student-rating-modal',
  templateUrl: 'student-rating-modal.html',
})
export class StudentRatingModalPage {
  @ViewChild('input') myInput;

  rating;
  //newRating: Rating;
  rating_details;
  student;
  category_name;

  points;
  remarks;

  constructor(
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public studentService: StudentService,
    public toastService: ToastService,
    public mongoIdService: MongoIdService) {

    this.rating = navParams.get('rating_details');
    this.student = navParams.get('student');
    this.category_name = this.rating.category_name;

  }

  ionViewDidEnter() {
    //https://forum.ionicframework.com/t/setting-focus-to-an-input-in-ionic/62789
    setTimeout(() => {
      this.myInput.setFocus();
    }, 10);

  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  addPoint(point: any) {
    this.points = this.points ? Number(this.points) : 0;
    this.points += point;
  }

  done() {
    this.rating.points = Number(this.points);
    if (this.remarks != '') {
      this.rating.remarks = this.remarks
    } else {
      delete this.rating.remarks;
    }
    this.presentConfirm(this.student, this.rating);
  }

  presentConfirm(student, rating) {
    let alert = this.alertCtrl.create({
      title: 'Bestätigen',
      message: 'Bewertung speichern?',
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
            if (!student.gradings) student.gradings = [];
            this.studentService.addGradingToStudent(student, rating).then(
                data => {
                  this.toastService.showToast('Eintragung erfolgreich');
                  this.viewCtrl.dismiss();
                },
                error => {
                  this.toastService.showToast('Fehler beim Anlegen');
                });
          }
        }
      ]
    });
    alert.present();
  }



}

