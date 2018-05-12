import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';
import { CourseService } from '../../../services/course.service';

/**
 * Generated class for the CourseNewnoteModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-course-newnote-modal',
  templateUrl: 'course-newnote-modal.html',
})
export class CourseNewnoteModalPage {

  note;
  course;
  private form: FormGroup;
  isReadyToSave: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    public toastService: ToastService,
    public courseService: CourseService) {

    this.course = this.navParams.get('course');

    this.form = this.formBuilder.group({
      header: ['', Validators.required],
      content: ['']
    })
    // Watch the form for changes
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }
  cancel(){
  this.viewCtrl.dismiss()
  }
  done() {
    this.presentConfirm();
  //   this.course.notes.push(this.form.value);
  //   this.courseService.updateCourse(this.course).subscribe(
  //     data => {
  //       this.toastService.showToast('Notiz eingetragen')
  //     },
  //     error => {
  //       this.toastService.showToast('Fehler beim Eintragen der Notiz')
  //     });
  //   this.viewCtrl.dismiss();
  // }
  // cancel() {
  //   this.viewCtrl.dismiss()
  }

  presentConfirm() {

    let alert = this.alertCtrl.create({
      title: 'Bestätigen',
      message: 'Notiz speichern?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.viewCtrl.dismiss();
          }
        },
        {
          text: 'Ok',
          handler: () => {
            this.course.notes.push(this.form.value);
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
