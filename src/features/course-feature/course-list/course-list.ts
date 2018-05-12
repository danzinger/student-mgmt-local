import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, ItemSliding } from 'ionic-angular';
import { CourseService } from '../../../services/course.service';
import { MongoIdService } from '../../../services/mongo-id.service';

@IonicPage()
@Component({
  selector: 'page-course-list',
  templateUrl: 'course-list.html',
})
export class CourseListPage {
  courses = [];
  ENV = 'dev';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public courseService: CourseService,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public mongoIdService: MongoIdService
  ) {
  }

  ionViewDidEnter() {
    this.courseService.getCourses().subscribe(courses => this.courses = courses);
  }


  addCourse() {
    let addModal = this.modalCtrl.create('CourseCreatePage');
    addModal.onDidDismiss(data => this.courses = data)
    addModal.present();
  }

  deleteCourse(course) {
    this.presentdeleteStudentConfirm(course);
  }

  closeSlidingItem(slidingItem: ItemSliding) {
    slidingItem.close();
  }

  presentdeleteStudentConfirm(course) {
    let alert = this.alertCtrl.create({
      title: 'Achtung',
      message: course.name + ' wird gelöscht. Bist du sicher?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Ok',
          handler: () => {
            this.courseService.deleteCourse(course._id).subscribe(data => this.courses = data);
            //this.toastCtrl.showToast('Löschen erfolgreich'); 

            // }, (error) => {
            //   this.toastCtrl.showToast('Löschen fehlgeschlagen');
            // });
          }
        }
      ]
    });
    alert.present();
  }

  manageCourse(course) {
    //this.navCtrl.push('CourseManagePage', { course: course })
    let manageModal = this.modalCtrl.create('CourseManagePage', { course: course });
    // manageModal.onDidDismiss()
    manageModal.present();
  }

  openCourse(course) {
    this.navCtrl.push('CourseDetailPage', {
      courses: this.courses,
      course: course
    });
  }

  createCourse(course) {
    this.courseService.createCourse(course).subscribe(
      data => {
        this.courses = data;
      },
      error => {
      });
  }

  addMockCourse() {
    let course = {
      _id: this.mongoIdService.newObjectId(),
      name: 'Testkurs ' + Math.floor((Math.random() * 10) + 1),
      time: '',
      location: '',
      institution: 'BOKU',
      participants: [],
      notes: []
    }
    this.createCourse(course)
  }
}
