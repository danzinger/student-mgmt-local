import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { CourseService } from '../../../services/course.service';
import { ToastService } from '../../../services/toast.service';
import { StudentService } from '../../../services/student-service';
import { Student } from '../../../app/models/student';
import { Course } from '../../../app/models/course';
import { SettingsService } from '../../../services/settings.service';
import { PerfCat } from '../../../app/models/performance-category';
import { Settings } from '../../../app/models/settings';
import { GradeCalculationService } from '../../../services/gradeCalculation.service';

@IonicPage()
@Component({
  selector: 'page-student-detail',
  templateUrl: 'student-detail.html',
})
export class StudentDetailPage {
  student: Student;
  selected_course: Course;
  courses: Course[] = [];
  view = "grade";
  computedGradings = [];
  notes;
  settings = new Settings;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public courseService: CourseService,
    public modalCtrl: ModalController,
    public toastService: ToastService,
    public studentService: StudentService,
    public alertCtrl: AlertController,
    public settingsService: SettingsService,
    public gradeCalculationService: GradeCalculationService) {

    //STUDENT must always be avalible (not matter from which view we come from)
    this.student = this.navParams.get('student');
    //course is only avalible when we come from the course-detail view
    if (navParams.get('course')) {
      this.selected_course = navParams.get('course');
      this.courses = navParams.get('courses');
    } else {
      //if we come from the student list view, we fetch the courses from the service
      this.getCourses();
    }
  }

  ionViewWillEnter() {
    //this.final_grade = this.calculateGrade(this.selected_course.performanceCategories[0].children);
    this.settingsService.getAllSettings().subscribe(s => this.settings = s);
  }

  getCourses() {
    this.courseService.getCourses().subscribe((courses) => {
      this.courses = courses;
      if (!this.selected_course && this.courses && this.courses[0]) this.selected_course = this.courses[0];
    });
  }
  //
  // ──────────────────────────────────────────────────────────────────── I ──────────
  //   :::::: R A T I N G   F E A T U R E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────
  //

  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //

  addNewRating(category_id, category_name) {
    let rating_details = {
      course_id: this.selected_course._id,
      category_name: category_name,
      category_id: category_id,
      date_readable: this.getReadableDate(),
    }
    this.presentRatingModal(rating_details);
  }

  presentRatingModal(rating_details) {
    let ratingModal = this.modalCtrl.create('StudentRatingModalPage', {
      rating_details: rating_details,
      student: this.student,
      course_id: this.selected_course._id
    });
    ratingModal.onDidDismiss(data => {
      //this.final_grade = this.calculateGrade();

    });
    ratingModal.present();
  }

  //
  // ─── READ ───────────────────────────────────────────────────────────────────────
  //



  //
  // ─── UPDATE ─────────────────────────────────────────────────────────────────────
  //



  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //

  presentGradingDeleteConfirm(grading) {
    let alert = this.alertCtrl.create({
      title: 'Bestätigen',
      message: 'Bewertung löschen?',
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
            this.deleteGrading(grading)
          }
        }
      ]
    });
    alert.present();
  }

  deleteGrading(grading) {
    this.updateComputedGradings(grading);
    let index = this.student.gradings.indexOf(grading);
    if (index > -1) this.student.gradings.splice(index, 1);
    this.studentService.updateStudent(this.student).subscribe(
      student => {
        this.toastService.showToast('Löschen erfolgreich!');
      },
      error => {
        this.toastService.showToast('Löschen fehlgeschlagen!')
      });
  }

  updateComputedGradings(grading) {
    let tmp_index;
    ///search the corresponding computed grading
    this.student.computed_gradings.forEach(computed_grading => {
      if (computed_grading.category_id == grading.category_id) {
        //ok found a corresponding computed grading
        computed_grading.total_points -= grading.points;
        if (computed_grading.total_points == 0) {
          tmp_index = this.student.computed_gradings.indexOf(computed_grading);
        }
      }
    });
    if (tmp_index > -1) this.student.computed_gradings.splice(tmp_index, 1);
  }
  //
  // ──────────────────────────────────────────────────────────────── II ──────────
  //   :::::: N O T E   F E A T U R E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────
  //

  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //

  addNewNote() {
    this.presentNewNoteModal();
  }

  presentNewNoteModal() {
    let newNoteModal = this.modalCtrl.create('StudentNewnoteModalPage', {
      student: this.student,
      course: this.selected_course
    });
    newNoteModal.present();
  }

  //
  // ─── READ ───────────────────────────────────────────────────────────────────────
  //



  //
  // ─── UPDATE ─────────────────────────────────────────────────────────────────────
  //



  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //

  deleteNote(note) {
    this.presentNoteDeleteConfirm(note)
  }
  presentNoteDeleteConfirm(note) {
    let alert = this.alertCtrl.create({
      title: 'Bestätigen',
      message: 'Notiz löschen?',
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
            let index = this.student.notes.indexOf(note);
            if (index > -1) this.student.notes.splice(index, 1);
            this.studentService.updateStudent(this.student).subscribe(
              data => {
                this.toastService.showToast('Löschen erfolgreich!');
              },
              error => {
                this.toastService.showToast('Löschen fehlgeschlagen!');
              });
          }
        }
      ]
    });
    alert.present();
  }

  //
  // ────────────────────────────────────────────────────────────────────────────────────────── III ──────────
  //   :::::: G R A D E   C O M P U T A T I O N   F E A T U R E : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────────────────────────────────────────
  //

  //
  // ─── GRADE COMPUTATION FEATURE ────────────────────────────────────────────
  //

  calculateGrade(partialGradingForGroup?) {
    return (this.settings && this.settings.GRADE_CALCULATION_FEATURE) ? this.gradeCalculationService.calculateGrade(this.selected_course.performanceCategories, this.student.computed_gradings, this.settings, partialGradingForGroup, true) : "";
  }

  //
  // ──────────────────────────────────────────────────────────────────────────────────── IV ──────────
  //   :::::: S T U D E N T   F E A T U R E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────────────────────
  //

  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //



  //
  // ─── READ ───────────────────────────────────────────────────────────────────────
  //


  //
  // ─── UPDATE ─────────────────────────────────────────────────────────────────────
  //

  presentStudentUpdateModal() {
    let ratingModal = this.modalCtrl.create('StudentUpdateModalPage', {
      student: this.student
    });
    ratingModal.present();
  }

  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //

  //
  // ──────────────────────────────────────────────────────────────────────── C ──────────
  //   :::::: H E L P E R   F U N C T I O N S : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────────
  //

  //
  // ─── GET STUDENTS RATING IN A CATEGORY FROM COMPUTED GRADINGS ARRAY IN THE STUDENT OBJECT ──────────
  //

  getStudentsRatingInACat(cat_id, stud_id) {
    //return number of total_points of student with stud_id in the category with cat_id if found, 0 otherwise.
    let student = this.student;
    let grading = student.computed_gradings.find((grading) => {
      return grading.category_id == cat_id
    });
    return (grading && grading.total_points) ? grading.total_points : 0;
  }

  getCategoryInfo(category: PerfCat): string {
    if (category.type == 'max_and_weight' && category.point_maximum) {
      return ' / ' + category.point_maximum;
    }
    if (category.type == 'incremental' && category.percentage_points_per_unit && this.settings && this.settings.GRADE_CALCULATION_FEATURE) {
      return ' (' + Number(category.percentage_points_per_unit) * 100 + ')'
    }
    if (!category.type || category.type == 'group') {
      return ''
    }
  }

  //helper function, so that the correct value is autoselected, 
  //if user navigates to the view from the course-detail-page.
  //Function is called in the [compareWith]="compareFn". https://ionicframework.com/docs/api/components/select/Select/

  compareFn(e1, e2): boolean {
    return e1 && e2 ? e1.name === e2.name : e1 === e2;
  }

  printInfo() {
    console.log(
      'this.student: ', this.student,
      '\n\n this.courses: ', this.courses,
      '\n\n this.selected_course: ', this.selected_course,
    )
  }

  onCourseSelect(selected_course) {
    // this.final_grade = 0;
    // this.final_grade = this.calculateGrade();
  }

  extround(x, n) {
    var a = Math.pow(10, n);
    return (Math.round(x * a) / a);
  }

  studentRegistered(course) {
    if (this.student && this.student.course_registrations && this.student.course_registrations.includes(course._id)) {
      return true;
    } else {
      return false
    };
  }

  getReadableDate() {
    var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
    return utc;
  }

}
