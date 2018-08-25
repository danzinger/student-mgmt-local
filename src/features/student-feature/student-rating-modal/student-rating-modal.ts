import { Component } from '@angular/core';
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

  rating;
  //newRating: Rating;
  rating_details;
  student;
  tmp = {
    points: 0,
    remarks: ''
  };
  category_name;
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

  cancel() {
    this.viewCtrl.dismiss();
  }

  addPoint(point: any) {
    this.tmp.points = Number(this.tmp.points);
    this.tmp.points += point;
  }

  done() {
    this.rating.points = Number(this.tmp.points);
    if (this.tmp.remarks != '') {
      this.rating.remarks = this.tmp.remarks
    } else {
      delete this.rating.remarks;
    }
    this.presentConfirm();
  }

  addGradingToStudent() {
    this.student.gradings.push(this.rating)
  }

  tmp_index;
  addToComputedGradings() {
    //adds a grading to the computed gradings. if no computed_gradings object exists it creates one and inserts the first value.
    //if the grading sum is 0 the computed gradings objects gets removed from the array
    this.tmp_index = -1;
    if (!this.student.computed_gradings || this.student.computed_gradings.length == 0) {
      //if this is the first rating in this category
      this.student.computed_gradings = []
      this.addNewComputedGrading();
    } else {
      //else if there are already computed gradings avalible
      let found = false;
      this.student.computed_gradings.forEach((computed_grading) => {
        if (computed_grading.category_id == this.rating.category_id) {
          computed_grading.total_points += this.rating.points;
          found = true;
          if(computed_grading.total_points == 0){
            this.tmp_index = this.student.computed_gradings.indexOf(computed_grading);
          }
        }
      })
      if (found == false) {
        this.addNewComputedGrading();
      }
      found = false;
      if (this.tmp_index > -1) this.student.computed_gradings.splice(this.tmp_index, 1);
      this.tmp_index = -1;
    }
  }

  addNewComputedGrading() {
    this.student.computed_gradings.push({
      category_id: this.rating.category_id,
      category_name: this.category_name,
      total_points: this.rating.points
    })
  }

  presentConfirm() {
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
            if (!this.student.gradings) this.student.gradings = [];
            this.addGradingToStudent();
            this.addToComputedGradings();
            this.studentService.updateStudent(this.student).subscribe(
              data => {
                this.toastService.showToast('Eintragung erfolgreich!');
                this.viewCtrl.dismiss();
              },
              error => {
                this.toastService.showToast('Fehler beim Anlegen. Server meldet: ' + error._body);
              });
          }
        }
      ]
    });
    alert.present();
  }



}

