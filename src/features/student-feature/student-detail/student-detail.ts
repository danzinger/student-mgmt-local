import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { CourseService } from '../../../services/course.service';
import { ToastService } from '../../../services/toast.service';
import { StudentService } from '../../../services/student-service';
import { Student } from '../../../app/models/student';
import { Course } from '../../../app/models/course';
import { SettingsService } from '../../../services/settings.service';

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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public courseService: CourseService,
    public modalCtrl: ModalController,
    public toastService: ToastService,
    public studentService: StudentService,
    public alertCtrl: AlertController,
    public settingsService: SettingsService) {

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

  ionViewDidEnter() {
    this.final_grade = this.calculateGrade();
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
      student: this.student
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
          text: 'Cancel',
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
        this.final_grade = this.calculateGrade();
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
          text: 'Cancel',
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
  // ─── TOTAL GRADE COMPUTATION FEATURE ────────────────────────────────────────────
  //

  submarks;
  final_grade;
  partialGradings = [];

  calculateGrade(partialGradingForGroup?) {
    this.submarks = [];
    let final_grade;
    //start by iterating through the gradings of the student
    if (this.student.computed_gradings.length > 0 && this.selected_course && this.selected_course.performanceCategories) {
      this.student.computed_gradings.map((grading) => {
        // find and calculate the weighted percentage-points for each grading in the computed_gradings array, write then into an array and add them to obtain the final grade
        // each rating in the 
        //and also by the points. How they are added depends on the category (max_and_weight) or "incremental"
        //the incremental points are also weightned, when they reside in a group.
        this.findWeightedPercentagePoints(grading.category_id, grading.total_points, partialGradingForGroup)
        //sum up these points, which is the final grading
        if (this.submarks.length > 0) {
          final_grade = this.submarks.reduce((a, b) => { return a + b; });
          if (!final_grade) final_grade = 0;
        } else {
          final_grade = 0
        }
      })
    } else {
      final_grade = 0
    }
    return this.precisionRound(final_grade * 100, 2)
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  findWeightedPercentagePoints(query_id, total_points, partialGradingForGroup?) {
    //iterate through the toplevel performance categories
    let group;
    //let group = partialGradingForGroup ? partialGradingForGroup : this.selected_course.performanceCategories;
    if(partialGradingForGroup){
     group = partialGradingForGroup
    }else{
     group = this.selected_course.performanceCategories;
    }
    group.map((category) => {
      //in this array, all weights are written that the searchbot encounters on its way to the final category
      let weight_array = [];
      //if the toplevel is a (nonempty)group, first collect the weight of this group
      if (this.categoryHasChildren(category)) {
        if (category.category_weight) {
          weight_array.push(category.category_weight);
        }
        // then go one level deeper. A group cannot be our search result, since it must be a grading
        // where points might be written into, which is not possible in a group
        return this.digDeeper(category, query_id, weight_array, total_points);
      } else {
        //this means the group is empty or . There cannot be any rating in an empty category of type == "group".
        //If this is the category we searched for (a toplevel-category) add the corresponding submark to the submark_array, if not just continue the search
        if (category._id == query_id) {
          weight_array = [];
          return this.addSubmarksToSubmarksArray(category, weight_array, total_points)
        }
      }
    })

  }

  digDeeper(category, query_id, weigth_array, total_points) {
    //this function searches the tree of subchildren recursively. The recursion stopps when an e
    category.children.map((subgroup) => {
      //if the first,second,third,... child is also a group, go deeper recursivly
      if (this.categoryHasChildren(subgroup)) {
        if (subgroup.category_weight) {
          weigth_array.push(subgroup.category_weight);
        }
        this.digDeeper(subgroup, query_id, weigth_array, total_points)
      } else {
        //not of type "group" (a potential candiate), or an empty group (which cannot have any ratings)
        if (subgroup._id == query_id) {
          //this.search_result = subgroup;
          return this.addSubmarksToSubmarksArray(subgroup, weigth_array, total_points)
        }
      }
    })
  }

  addSubmarksToSubmarksArray(subgroup, weight_array, total_points) {
    if (subgroup.type == "max_and_weight") {
      weight_array.push(subgroup.category_weight);
      //multiply all vales in the weigth array
      let calculated_weight_for_submark = weight_array.length > 0 ? weight_array.reduce(function (a, b) { return a * b; }) : 1;
      //calculate the weightened percentage of the total points in a category in relation to the maximum points that can be reached
      let weighted_percentage = calculated_weight_for_submark * (total_points / Number(subgroup.point_maximum))
      this.submarks.push(weighted_percentage);
    }
    if (subgroup.type == "incremental") {
      let calculated_weight_for_submark = weight_array.length > 0 ? weight_array.reduce(function (a, b) { return a * b; }) : 1;
      let weighted_percentage = calculated_weight_for_submark * Number(subgroup.percentage_points_per_unit) * total_points;
      this.submarks.push(weighted_percentage);
    }
  }

  categoryHasChildren(category) {
    return category.children.length > 0 && category.type == "group"
  }

  //
  // ─── PARTIAL GRADE COMPUTATION FEATURE ──────────────────────────────────────────
  //



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

  //helper function, so that the correct value is autoselected, 
  //if user navigates to the view from the course-detail-page.
  //Function is called in the [compareWith]="compareFn". https://ionicframework.com/docs/api/components/select/Select/

  compareFn(e1, e2): boolean {
    return e1 && e2 ? e1.name === e2.name : e1 === e2;
  }

  printInfo() {
    console.log(
      'this.student: ', this.student,
      '\n\n this.final_grade: ', this.final_grade,
      '\n\n this.courses: ', this.courses,
      '\n\n this.selected_course: ', this.selected_course,
    )
  }

  onCourseSelect(selected_course) {
    this.final_grade = 0;
    this.final_grade = this.calculateGrade();
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
