import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ViewController } from 'ionic-angular';
import { ToastService } from '../../../services/toast.service';
import { StudentService } from '../../../services/student-service';

/**
 * Generated class for the StudentNewnoteModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-student-newnote-modal',
  templateUrl: 'student-newnote-modal.html',
})
export class StudentNewnoteModalPage {

  student;
  note = {
    header: '',
    content: ''
  };
  selected_course;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public toastService: ToastService,
    public studentService: StudentService) {
    this.student = navParams.get('student');
    this.selected_course = navParams.get('course');

  }

  cancel() {
    this.viewCtrl.dismiss();
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
            if(!this.student.notes) this.student.notes = []
            this.student.notes.push(this.note);
            this.studentService.updateStudent(this.student).subscribe(
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
