import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { CourseService } from '../../../services/course.service';
import { ToastService } from '../../../services/toast.service';
import { StudentService } from '../../../services/student-service';
import { Student } from '../../../app/models/student';
import { Course } from '../../../app/models/course';
import { SettingsService } from '../../../services/settings.service';
import { PerfCat } from '../../../app/models/performance-category';

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
    //this.final_grade = this.calculateGrade(this.selected_course.performanceCategories[0].children);
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

    /*
    This Function computes the overall grade and the partial gradings for a student.
    If a subgroup is passed, a partial grading will be returned and if not, the overall grade is computed.
    The functions iterates over the performance_categories of the course, or a subgroup of these (to compute a partial grading).
    For each category, the corresponding weight is computed and some information is stored (slightly different "max_and_weight" or "incremental" grading types)
    We obtain a datastructure like this:
    {
    PERFORMANCE-CATEGORY-1-ID : [WEIGHT, TYPE, POINT-MAXIMUM, PERFENTAGE-PPU]
    PERFORMANCE-CATEGORY-2-ID : [WEIGHT, TYPE, POINT-MAXIMUM, PERFENTAGE-PPU]
    PERFORMANCE-CATEGORY-3-ID : [WEIGHT, TYPE, POINT-MAXIMUM, PERFENTAGE-PPU]
    ...
    }
    Then it is easily possible to compute the final/partial grade.
    */

    let table = {};
    let submarks = [];
    let grade = 0;
    let group = partialGradingForGroup ? partialGradingForGroup : this.selected_course.performanceCategories;

    //first the table is generated:
    if (group.length > 0) group.map((toplevel_category) => {
      table[toplevel_category._id] = [Number(toplevel_category.category_weight), toplevel_category.type, toplevel_category.point_maximum, toplevel_category.percentage_points_per_unit]
      if (this.categoryHasChildren(toplevel_category)) {
        toplevel_category.children.map((first_level_child) => {
          table[first_level_child._id] = [Number(toplevel_category.category_weight * first_level_child.category_weight), first_level_child.type, first_level_child.point_maximum, first_level_child.percentage_points_per_unit]
          if (this.categoryHasChildren(first_level_child)) {
            first_level_child.children.map((second_level_child) => {
              table[second_level_child._id] = [Number(toplevel_category.category_weight * first_level_child.category_weight * second_level_child.category_weight), second_level_child.type, second_level_child.point_maximum, second_level_child.percentage_points_per_unit]
              if (this.categoryHasChildren(second_level_child)) {
                second_level_child.children.map((third_level_child) => {
                  table[third_level_child._id] = [Number(toplevel_category.category_weight * first_level_child.category_weight * second_level_child.category_weight * third_level_child.category_weight), third_level_child.type, third_level_child.point_maximum, third_level_child.percentage_points_per_unit]
                })
              }
            })
          }
        })
      }
    })

    //then the grade is computed
    this.student.computed_gradings.map((grading) => {
      if (table[grading.category_id] && table[grading.category_id][1] == "max_and_weight") {
        submarks.push(table[grading.category_id][0] * (grading.total_points / table[grading.category_id][2]))
      }
      if (table[grading.category_id] && table[grading.category_id][1] == "incremental") {
        submarks.push(table[grading.category_id][0] * grading.total_points * table[grading.category_id][3])
      }
    })
    grade = (submarks.length > 0) ? submarks.reduce((a, b) => { return a + b; }) : 0;

    let grade_object = {
      grade: 0,
      mark: 0
    }
    grade_object.grade = this.precisionRound(grade * 100, 2);
    grade_object.mark = this.getMarkFromPercentage(grade);
    let returnvalue;
    if(this.settingsService.SHOW_MARK){
      returnvalue = this.settingsService.SHOW_PERCENT_SIGN ? grade_object.grade + ' % ' + '(' + grade_object.mark + ')' : grade_object.grade + ' ' + '(' + grade_object.mark + ')';
    }else{
      returnvalue = this.settingsService.SHOW_PERCENT_SIGN ? grade_object.grade + ' %' : grade_object.grade;
    }
    return returnvalue
  }

  //
  // ─── HELPER FUNCTIONS ────────────────────────────────────────────
  //

  getMarkFromPercentage(percentage_value){
    let mark;
    let mark_string = this.settingsService.MARK_STRING;
    let array = mark_string.split("|")
    for(let mark_range of array){
      let sub = mark_range.split(",")
      if (percentage_value >= Number(sub[0]) && percentage_value < Number(sub[1])) {
        mark = sub[2];
      }
    }
    return mark;
  }

  // getMarkFromPercentage(percentage_value) {
  //   let mark;
  //   if (percentage_value < 0.5) {
  //     mark = '5';
  //   }
  //   if (percentage_value >= 0.5 && percentage_value < 0.5416) {
  //     mark = '4-';
  //   }
  //   if (percentage_value >= 0.5416 && percentage_value < 0.5833) {
  //     mark = '4'
  //   }
  //   if (percentage_value >= 0.5833 && percentage_value < 0.625) {
  //     mark = '4+';
  //   }
  //   if (percentage_value >= 0.625 && percentage_value < 0.6666) {
  //     mark = '3-'
  //   }
  //   if (percentage_value >= 0.6666 && percentage_value < 0.7083) {
  //     mark = '3'
  //   }
  //   if (percentage_value >= 0.7083 && percentage_value < 0.75) {
  //     mark = '3+'
  //   }
  //   if (percentage_value >= 0.750 && percentage_value < 0.7916) {
  //     mark = '2-'
  //   }
  //   if (percentage_value >= 0.7916 && percentage_value < 0.8333) {
  //     mark = '2'
  //   }
  //   if (percentage_value >= 0.8333 && percentage_value < 0.875) {
  //     mark = '2+'
  //   }
  //   if (percentage_value >= 0.875) {
  //     mark = '1'
  //   }
  //   return mark;
  // }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  categoryHasChildren(category) {
    return category.children && category.children.length > 0 && category.type == "group"
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
    if (category.type == 'incremental' && category.percentage_points_per_unit) {
      return ' (' + Number(category.percentage_points_per_unit)*100 + ')'
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
      //'\n\n this.final_grade: ', this.calculateGrade(this.selected_course.performanceCategories[0]),
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

  //
  // ─── OLD FUNCTIONS ──────────────────────────────────────────────────────────────
  //


  // calculateGradeOLD(partialGradingForGroup?) {
  //   this.submarks = [];
  //   let final_grade;
  //   if (this.student.computed_gradings.length > 0 && this.selected_course && this.selected_course.performanceCategories) {
  //     this.student.computed_gradings.map((grading) => {
  //       this.findWeight(grading.category_id, grading.total_points, partialGradingForGroup)
  //       if (this.submarks.length > 0) {
  //         final_grade = this.submarks.reduce((a, b) => { return a + b; });
  //         if (!final_grade) final_grade = 0;
  //       } else {
  //         final_grade = 0
  //       }
  //     })
  //   } else {
  //     final_grade = 0
  //   }
  //   return this.precisionRound(final_grade * 100, 2)
  // }

  // findWeight(query_id, total_points, partialGradingForGroup?) {
  //   let group;
  //   //let group = partialGradingForGroup ? partialGradingForGroup : this.selected_course.performanceCategories;
  //   if (partialGradingForGroup) {
  //     group = partialGradingForGroup
  //   } else {
  //     group = this.selected_course.performanceCategories;
  //   }
  //   if (group.length > 0) group.map((category) => {
  //     let weight_array = [];
  //     if (this.categoryHasChildren(category)) {
  //       weight_array.push(category.category_weight);
  //       this.digDeeper(category, query_id, weight_array, total_points);
  //     } else {
  //       if (category._id == query_id) {
  //         if (category.category_weight) weight_array.push(category.category_weight)
  //         //if(this.print) console.log("Toplevel-Category "+category.name+" with id: "+query_id+" has weight_array: "+weight_array);
  //         this.addSubmarksToSubmarksArray(category, weight_array, total_points)
  //       }
  //     }
  //   })
  // }

  // tmp_weight_array = []
  // digDeeper(category, query_id, weight_array, total_points) {
  //   category.children.map((subgroup) => {
  //     //if the first,second,third,... child is also a group, go deeper recursivly
  //     if (this.categoryHasChildren(subgroup)) {
  //       if (subgroup.category_weight) {
  //         this.tmp_weight_array.push(subgroup.category_weight);
  //       }
  //       this.digDeeper(subgroup, query_id, weight_array, total_points)
  //     } else {
  //       //not of type "group" (a potential candiate), or an empty group (which cannot have any ratings)
  //       if (subgroup._id == query_id) {
  //         this.tmp_weight_array.map((e) => {
  //           weight_array.push(e);
  //         });
  //         //this.tmp_weight_array = [];
  //         if (subgroup.category_weight) weight_array.push(subgroup.category_weight);
  //         //if(this.print) console.log("Sublevel-Category "+subgroup.name+", where Student has "+total_points+" of "+subgroup.point_maximum+" Points, with id: "+subgroup._id+" has weight_array: "+weight_array);
  //         //let calculated_weight_for_submark = weight_array.length > 0 ? weight_array.reduce(function (a, b) { return a * b; }) : 1;
  //         //let weighted_percentage = calculated_weight_for_submark * (total_points / Number(subgroup.point_maximum))
  //         //console.log("This results in: "+weighted_percentage);
  //         this.addSubmarksToSubmarksArray(subgroup, weight_array, total_points)
  //       }
  //     }
  //   })
  //   this.tmp_weight_array = []
  // }

  // addSubmarksToSubmarksArray(subgroup, weight_array, total_points) {
  //   if (subgroup.type == "max_and_weight") {
  //     //multiply all vales in the weigth array
  //     let calculated_weight_for_submark = weight_array.length > 0 ? weight_array.reduce(function (a, b) { return a * b; }) : 1;
  //     //calculate the weightened percentage of the total points in a category in relation to the maximum points that can be reached
  //     let weighted_percentage = calculated_weight_for_submark * (total_points / Number(subgroup.point_maximum))
  //     this.submarks.push(weighted_percentage);
  //   }
  //   if (subgroup.type == "incremental") {
  //     let calculated_weight_for_submark = weight_array.length > 0 ? weight_array.reduce(function (a, b) { return a * b; }) : 1;
  //     let weighted_percentage = calculated_weight_for_submark * Number(subgroup.percentage_points_per_unit) * total_points;
  //     this.submarks.push(weighted_percentage);
  //   }
  // }


}
