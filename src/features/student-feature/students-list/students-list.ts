import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ItemSliding, ModalController, AlertController} from 'ionic-angular';

import { StudentService } from '../../../services/student-service';
import { CourseService } from '../../../services/course.service';
import { ToastService } from '../../../services/toast.service';
import { Student } from '../../../app/models/student';

@IonicPage()
@Component({
  selector: 'page-students-list',
  templateUrl: 'students-list.html',
})
export class StudentsListPage {

  students: Student[];
  term;
  ENV = 'prod';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public studentService: StudentService,
    public courseService: CourseService,
    public toastService: ToastService,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController) {
    if (this.selected_course) this.selected_course = this.selected_course;
  }

  ionViewWillEnter() {
    this.studentService.getStudents().subscribe(students => {
      this.students = students;
      if (!students) {
        //if registerMode is ON and the students are deleted/updated in the meantime, weired behavior would result. therefore this is needed:
        this.registerMode = false;
      }
    });
    this.courseService.getCourses().subscribe(
      courses => {
        if (this.courses !== courses) this.courses = courses;
        if(!this.selected_course && this.courses && this.courses[0]) this.selected_course = this.courses[0]
        //if registerMode is ON and the courses are deleted/updated in the meantime, weired behavior would result. therefore this is needed:
        if (!courses) this.registerMode = false;
      });
      
  }

  ionViewWillLeave() {
    this.selected_course = null;
    //turn off register mode when leaving the view (because selected_course does not stay selected and its hard to fix at least for me)
    if(this.registerMode) this.toggleRegisterMode(this.registerMode);
  }

  //
  // ──────────────────────────────────────────────────────────────────────────────── I ──────────
  //   :::::: P A R T I C I P A N T S   F E A T U R E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────────────────
  //

  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //

  addStudents() {
    this.navCtrl.push('StudentAddPage');
  }

  //
  // ─── READ ───────────────────────────────────────────────────────────────────────
  //

  goToStudentDetail(student) {
    this.navCtrl.push('StudentDetailPage', { student: student });
  }

  //
  // ─── UPDATE ─────────────────────────────────────────────────────────────────────
  //

  presentStudentUpdateModal(student) {
    let ratingModal = this.modalCtrl.create('StudentUpdateModalPage', {
      student: student
    });
    ratingModal.present();
  }

  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //

  deleteStudent(student) {
    let alert = this.alertCtrl.create({
      title: 'Achtung',
      message: student.firstname + " " + student.lastname + ' wird gelöscht. Bist du sicher?',
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
            this.studentService.deleteStudent(student).subscribe(
              data => {
                let index = this.students.indexOf(student);
                if (index > -1) this.students.splice(index, 1);
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
  // ────────────────────────────────────────────────────────────────────────────────────────────── II ──────────
  //   :::::: C O U R S E   R E G I S T R A T I O N   F E A T U R E : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────────────────────────────────────────────
  //

  registerMode: Boolean = false;
  courses = [];
  selected_course;

  toggleStudentsCourseRegistration(student) {
    if (!student.registered) {
      this.selected_course.participants.push(student._id);
      student.course_registrations.push(this.selected_course._id);
      //this.toastService.showToast(student.firstname + ' ' + student.lastname + ' für ' + this.selected_course.name + ' registriert');
    } else {
      let index = this.selected_course.participants.indexOf(student._id);
      if (index > -1) this.selected_course.participants.splice(index, 1);
      let index2 = student.course_registrations.indexOf(this.selected_course._id);
      if (index2 > -1) student.course_registrations.splice(index2, 1);
      //this.toastService.showToast(student.firstname + ' ' + student.lastname + ' von ' + this.selected_course.name + ' abgemeldet');
    }
    this.studentService.updateStudent(student).subscribe(students => this.students = students);
    if (this.selected_course) this.courseService.updateCourse(this.selected_course).subscribe(courses => this.courses = courses);
  }

  toggleRegisterMode(RegisterModeOn) {
    if (RegisterModeOn) {
      //turn off register mode
      this.registerMode = !this.registerMode;
      //delete the student.registered temporary entry for each student
      this.deleteTmpData();
    } else {
      //if register mode is OFF turn it on
      this.registerMode = !this.registerMode;
    }
  }

  onCourseSelect(selected_course) {
    this.deleteTmpData();
  }

  deleteTmpData() {
    if (this.students && this.students.length > 0) {
      this.students.forEach(student => {
        delete student.registered;
      });
    }
  }

  studentRegistered(student) {
    if (this.selected_course && this.selected_course.participants) {
      if (this.selected_course.participants.includes(student._id)) {
        student.registered = true;
        return true;
      } else {
        student.registered = false;
        return true
      };
    }
  }

  //
  // ──────────────────────────────────────────────────────────────────────── C ──────────
  //   :::::: H E L P E R   F U N C T I O N S : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────────
  //
  compareFn(e1, e2): boolean {
    return e1 && e2 ? e1.name === e2.name : e1 === e2;
  }

  printInfo() {
    console.log('this.students: ', this.students, '\nthis.courses: ', this.courses, '\nthis.selected_course: ', this.selected_course);
  }

  closeSlidingItem(slidingItem: ItemSliding) {
    slidingItem.close();
  }


}
