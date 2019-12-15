import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { Course } from '../../../app/models/course';
import { CourseService } from '../../../services/course.service';
import { ToastService } from '../../../services/toast.service';

/**
 * Generated class for the CourseNoteUpdateModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-course-note-update-modal',
  templateUrl: 'course-note-update-modal.html',
})
export class CourseNoteUpdateModalPage {
  note_id;
  note;
  course: Course;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    public courseService: CourseService,
    public toastService: ToastService) 
    {
      this.note_id = this.navParams.get('note_id');
      this.course = this.navParams.get('course');
      this.note = this.course.newnotes[this.note_id];

  }
  cancel(){
  this.viewCtrl.dismiss()
  }
  done() {
    this.presentConfirm();
  }

  presentConfirm(){

    let alert = this.alertCtrl.create({
      title: 'Bestätigen',
      message: 'Notiz speichern?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => {
            this.viewCtrl.dismiss();
          }
        },
        {
          text: 'Ok',
          handler: () => {
            this.course.newnotes[this.note_id] = this.note;
            this.courseService.updateCourse(this.course).subscribe(
              data => {
                this.toastService.showToast('Notiz eingetragen');
                this.viewCtrl.dismiss();
              },
              error => {
                this.toastService.showToast('Fehler beim Eintragen der Notiz');
                this.viewCtrl.dismiss();
              });
          }
        }
      ]
    });
    alert.present();
  }


}
