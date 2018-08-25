import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { StudentService } from '../../../services/student-service';
import { ToastService } from '../../../services/toast.service';

/**
 * Generated class for the StudentUpdateModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-student-update-modal',
  templateUrl: 'student-update-modal.html',
})
export class StudentUpdateModalPage {
  student;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl:ViewController,
    public alertCtrl:AlertController,
    public studentService:StudentService,
    public toastService:ToastService) {

    this.student = navParams.get('student');
    console.log(this.student)
  }


  cancel() {
    this.viewCtrl.dismiss();
  }


  done() {
    this.presentConfirm(this.student);
  }

  presentConfirm(student) {
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
             this.studentService.updateStudent(student).subscribe(
              student => {
                this.toastService.showToast('Änderung erfolgreich gespeichert.');
                this.viewCtrl.dismiss();
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
