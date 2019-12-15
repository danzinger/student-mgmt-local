import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, ItemSliding } from 'ionic-angular';
import { CourseService } from '../../../services/course.service';
import { MongoIdService } from '../../../services/mongo-id.service';
import { SettingsService } from '../../../services/settings.service';
import { ToastService } from '../../../services/toast.service';
import { Settings } from '../../../app/models/settings';
import { StudentService } from '../../../services/student-service';

@IonicPage()
@Component({
  selector: 'page-course-list',
  templateUrl: 'course-list.html',
})
export class CourseListPage {
  courses = [];
  ENV = 'dev';
  settings = new Settings;
  
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public courseService: CourseService,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public mongoIdService: MongoIdService,
    public settingsService: SettingsService,
    public studentService: StudentService,
    public toastService: ToastService,

  ) { 
  }

  ionViewWillEnter() {
    this.settingsService.getAllSettings().subscribe((s) => this.settings = s);
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
      performanceCategories: [],
      notes: []
    }
    this.createCourse(course)
  }

  copyCourse(old_course) {
    let new_course = {
      _id: this.mongoIdService.newObjectId(),
      performanceCategories: old_course.performanceCategories,
      name: old_course.name + " (Kopie)",
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
    let manageModal = this.modalCtrl.create('CourseManagePage', { course: course });
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
      message: course.name + ' löschen? Es werden alle Bewertungen aller Studenten in diesem Kurs ebenfalls gelöscht!',
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
            if (course.performanceCategories.length > 0) {
              let deletion_array = []
              course.performanceCategories.forEach(category => {
                deletion_array = deletion_array.concat(this.courseService.initializeDeletionArray(category))
              })
              this.studentService.deleteAllGradingsInPerfcatsFromAllStudents(deletion_array)
            }      
            this.courseService.deleteCourse(course).subscribe(
              courses => {
                this.courses = courses;
              }, error => {
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
