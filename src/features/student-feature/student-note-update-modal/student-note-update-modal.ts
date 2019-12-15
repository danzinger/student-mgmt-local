import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ViewController } from 'ionic-angular';
import { StudentService } from '../../../services/student-service';
import { ToastService } from '../../../services/toast.service';
import { Student } from '../../../app/models/student';


/**
 * Generated class for the StudentNoteUpdateModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-student-note-update-modal',
  templateUrl: 'student-note-update-modal.html',
})
export class StudentNoteUpdateModalPage {
  note_id;
  note;
  student: Student;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    public studentService: StudentService,
    public toastService: ToastService) {
    this.note_id = this.navParams.get('note_id');
    this.student = this.navParams.get('student');
    this.note = this.student.newnotes[this.note_id];
  }

  cancel() {
    this.viewCtrl.dismiss()
  }
  done() {
    this.presentConfirm();
  }

  presentConfirm() {

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
            this.student.newnotes[this.note_id] = this.note;
            this.studentService.updateStudent(this.student).subscribe(
              data => {
                this.toastService.showToast('Notiz gespeichert');
                this.viewCtrl.dismiss();
              },
              error => {
                this.toastService.showToast('Fehler beim Speichern der Notiz');
                this.viewCtrl.dismiss();
              });
          }
        }
      ]
    });
    alert.present();
  }
}
