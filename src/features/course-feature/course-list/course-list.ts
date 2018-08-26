import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, ItemSliding } from 'ionic-angular';
import { CourseService } from '../../../services/course.service';
import { MongoIdService } from '../../../services/mongo-id.service';
import { SettingsService } from '../../../services/settings.service';
import { ToastService } from '../../../services/toast.service';
import { Course } from '../../../app/models/course';

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
    public mongoIdService: MongoIdService,
    public settingsService: SettingsService,
    public toastService:ToastService
  ) {
  }

  ionViewDidEnter() {
    this.courseService.getCourses().subscribe(courses => this.courses = courses);
  }
  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //

  createCourse(course) {
    this.courseService.createCourse(course).subscribe(
      data => {
        this.courses = data;
        this.toastService.showToast('Kurs erfolgreich angelegt');
      },
      error => {
        this.toastService.showToast('Fehler bei Anlegen');
      });
  }

  
  addCourse() {
    let addModal = this.modalCtrl.create('CourseCreatePage');
    addModal.onDidDismiss((data) => {
      if (data) this.courses = data;
    })
    addModal.present();
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

  copyCourse(old_course){
    let new_course = {
      _id: this.mongoIdService.newObjectId(),
      performanceCategories: old_course.performanceCategories,
      name: old_course.name+" (Kopie)",
      time: '',
      location: '',
      institution: old_course.institution,
      participants: [],
      notes: []
    }

    if (new_course.performanceCategories.length > 0) new_course.performanceCategories.map((toplevel_category) => {
      toplevel_category._id = this.mongoIdService.newObjectId();
      if (this.categoryHasChildren(toplevel_category)) {
        toplevel_category.children.map((first_level_child) => {
          first_level_child._id = this.mongoIdService.newObjectId();
          if (this.categoryHasChildren(first_level_child)) {
            first_level_child.children.map((second_level_child) => {
              second_level_child._id = this.mongoIdService.newObjectId();
              if (this.categoryHasChildren(second_level_child)) {
                second_level_child.children.map((third_level_child) => {
                  third_level_child._id = this.mongoIdService.newObjectId();
                })
              }
            })
          }
        })
      }
    })
    new_course.participants = [];
    this.createCourse(new_course)
  }
  categoryHasChildren(category) {
    return category.children && category.children.length > 0 && category.type == "group"
  }
  //
  // ─── READ ───────────────────────────────────────────────────────────────────────
  //

  openCourse(course) {
    this.navCtrl.push('CourseDetailPage', {
      courses: this.courses,
      course: course
    });
  }

  //
  // ─── UPDATE ─────────────────────────────────────────────────────────────────────
  //
  manageCourse(course) {
    //this.navCtrl.push('CourseManagePage', { course: course })
    let manageModal = this.modalCtrl.create('CourseManagePage', { course: course });
    // manageModal.onDidDismiss()
    manageModal.present();
  }
  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //

  deleteCourse(course) {
    this.presentdeleteStudentConfirm(course);
  }

  presentdeleteStudentConfirm(course) {
    let alert = this.alertCtrl.create({
      title: 'Achtung',
      message: course.name + ' wird gelöscht. Bist du sicher?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Löschen',
          handler: () => {
            this.courseService.deleteCourse(course._id).subscribe(
              data => {
                this.courses = data;
                this.toastService.showToast('Löschen erfolgreich'); }
              ,error => {
                this.toastService.showToast('Löschen fehlgeschlagen');
              });
          }
        }
      ]
    });
    alert.present();
  }

//
// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────────
//

  closeSlidingItem(slidingItem: ItemSliding) {
    slidingItem.close();
  }


}
