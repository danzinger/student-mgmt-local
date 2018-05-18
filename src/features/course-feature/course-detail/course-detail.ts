import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, PopoverController, AlertController, ItemSliding } from 'ionic-angular';

import { StudentService } from '../../../services/student-service';
import { CourseService } from '../../../services/course.service';
import { ToastService } from '../../../services/toast.service';

import { Course } from '../../../app/models/course';
import { Student } from '../../../app/models/student';
import { SettingsService } from '../../../services/settings.service';
import { PapaParseService } from 'ngx-papaparse';

import { File } from '@ionic-native/file';

@IonicPage()
@Component({
  selector: 'page-course-detail',
  templateUrl: 'course-detail.html',
})
export class CourseDetailPage {
  course: Course;
  courses: Course[];
  participants: Student[] = [];
  view = 'students';

  course_id

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public studentService: StudentService,
    public popoverCtrl: PopoverController,
    public toastService: ToastService,
    public courseService: CourseService,
    public alertCtrl: AlertController,
    public settingsService: SettingsService,
    private papa: PapaParseService,
    public file: File) {

    this.courses = navParams.get('courses');
    this.course = navParams.get('course');
    this.course_id = this.course._id;

  }

  ionViewDidEnter() {
    this.getParticipants();
  }

  manageCourse(course) {
    this.navCtrl.push('CourseManagePage', { course: course })
  }

  //
  // ──────────────────────────────────────────────────────────────────────────────── I ──────────
  //   :::::: P A R T I C I P A N T S   F E A T U R E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────────────────
  //

  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //

  createAndregisterStudents() {
    this.navCtrl.push('StudentAddPage', { control_data: { registerForCourse: true, course: this.course, students: this.students } })
  }

  //
  // ─── READ ───────────────────────────────────────────────────────────────────────
  //

  students;
  getStudents() {
    this.studentService.getStudents().subscribe(students => this.students = students);
  }

  getParticipants() {
    this.studentService.getParticipants(this.course._id).subscribe(participants => this.participants = participants);
  }

  goToStudentDetail(participant) {
    this.navCtrl.push('StudentDetailPage', { student: participant, course: this.course, courses: this.courses });
  }

  //
  // ─── UPDATE ─────────────────────────────────────────────────────────────────────
  //

  presentStudentUpdateModal(student) {
    let updateModal = this.modalCtrl.create('StudentUpdateModalPage', {
      student: student
    });
    updateModal.present();
  }

  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //

  deleteParticipant(participant) {
    this.studentService.deleteStudent(participant).subscribe(
      data => {
        let index = this.participants.indexOf(participant);
        if (index > -1) this.participants.splice(index, 1);
      },
      error => { throw new Error(error) }
    )
  }

  //
  // ────────────────────────────────────────────────────────────────── II ──────────
  //   :::::: N O T E S   F E A T U R E : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────────────────
  //

  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //

  addNewNote() {
    this.presentAddNewNoteModal();
  }
  presentAddNewNoteModal() {
    let newNoteModal = this.modalCtrl.create('CourseNewnoteModalPage', { course: this.course });
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
            let notes = this.course.notes;
            let index = notes.indexOf(note);
            if (index > -1) notes.splice(index, 1);
            this.courseService.updateCourse(this.course).subscribe(
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
  // ──────────────────────────────────────────────────────────────────────────────────────────────────── III ──────────
  //   :::::: P E R F O R M A N C E   C A T E G O R I E S   F E A T U R E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
  //

  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //

  presentAddNewPerfCatModal() {
    let addPerfCatModal = this.modalCtrl.create('CourseNewperfcatModalPage', {
      course: this.course
    });
    addPerfCatModal.present();
  }


  //
  // ─── READ ───────────────────────────────────────────────────────────────────────
  //

  //Performance Categories are read from within the Course Object. 

  //
  // ─── UPDATE ─────────────────────────────────────────────────────────────────────
  //

  editPerformanceCategory(category, child) {
    //if user wants to edit a child, the child is passed to next view
    child = null ? !child : child;
    let CoursePerfcatEditModal = this.modalCtrl.create('CoursePerfcatUpdateModalPage', {
      category: category,
      child: child,
      course: this.course
    });
    CoursePerfcatEditModal.onDidDismiss(weight_changed => {
      if (weight_changed) {
        console.log(weight_changed);
      }
    })    
    CoursePerfcatEditModal.present();
  }

  addPerformanceCategoryGroupMember(category, parent_id, number_of_parents, child) {
    let CoursePerfcatUpdateModal = this.modalCtrl.create('CoursePerfcatUpdateModalPage', {
      category: category,
      addToGroup: true,
      parent_id: parent_id,
      child: child,
      course: this.course
    })
    CoursePerfcatUpdateModal.present();
  }

  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //


  initializeDeletionArray(child): String[] {
    //returns an array of a grading_category and all of its subgroups
    let deletion_array = []
    deletion_array.push(child._id);
    if (child.children && child.children.length > 0) {
      child.children.map((subgroup) => {
        deletion_array.push(subgroup._id);
        if (subgroup.children && subgroup.children.length > 0) {
          subgroup.children.map((subsubgroup) => {
            deletion_array.push(subsubgroup._id);
            if (subsubgroup.children && subsubgroup.children.length > 0) {
              subsubgroup.children.map((subsubsubgroup) => {
                deletion_array.push(subsubsubgroup._id);
              })
            }
          });
        }
      });
    }
    return deletion_array;
  }

  deleteAllGradingsInPerfcatsFromAllStudents(deletion_array) {
    //delete all gradings from all students in all categories enlisted in the deletion_array
    //we not only fetch the registered students because: 1) students is registered for course 2) grading is entered 3) student is unregistered from course 4) grading category is deleted => if only the registered students would be updated, then this grading would remain in the students gradings & computed_gradings array(s)    
    let students_to_update = [];
    this.studentService.getStudents().subscribe(
      students => {
        if (students) {
          students.forEach((student) => {
            //for all entries in the deletion array, filter the student.gradings and the student.computed_gradings array, to delete the gradings in the category which gets deleted
            deletion_array.forEach(deletion_array_category_id => {
              if (student.gradings) { student.gradings = student.gradings.filter(grading => grading.category_id != deletion_array_category_id) };
              if (student.computed_gradings) { student.computed_gradings = student.computed_gradings.filter(computed_grading => computed_grading.category_id != deletion_array_category_id) };
            });
            students_to_update.push(student);
          });
          this.studentService.updateAllStudents(students_to_update).subscribe(() => {
            this.getParticipants();
          })
        }
      },
      error => {
        this.toastService.showToast('Fehler beim Löschen der Bewertungen. Konsistenzcheck der Daten empfohlen!');
      })
  }

  deletePerformanceCategory(category, parent, child, isTopLevel) {
    let deletion_array = this.initializeDeletionArray(child);
    // if it is a top-level-category, the whole course gets updated
    if (isTopLevel) {
      let index = this.course.performanceCategories.indexOf(category);
      if (index > -1) this.course.performanceCategories.splice(index, 1);
      //if it is not a top level category, the performanceCategories array of the course must be updated
    } else {
      let index = parent.children.indexOf(child);
      if (index > -1) parent.children.splice(index, 1);
    }
    //in any case, we update the course (with the new performance categories)
    this.courseService.updateCourse(this.course).subscribe(
      data => {
        this.deleteAllGradingsInPerfcatsFromAllStudents(deletion_array);
        this.toastService.showToast('Löschen erfolgreich!');
      },
      error => {
        this.toastService.showToast('Fehler beim Löschen der Kategorie.');
      });
  }


  //
  // ────────────────────────────────────────────────────────────────────────────── IV ──────────
  //   :::::: D A T A   E X P O R T   F E A T U R E : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────────────────────────────
  //

  /*
  Export Object:
  
  lastname, firstname, category1, category2, ...
  ...,...,TOTAL_POINTS_IN_CAT_1, ...
  
  need:
  array von Objekten der Form:
  [{
  lastname: LASTNAME
  firstname:FIRSTNAME
  category1: TOTAL_POINTS
  category2:TOTAL_POINTS
  },
  ]
  
  */
  resultcats;
  exportData;
  exportCourseData() {
    //flatten the categories
    this.resultcats = [];
    this.exportData = [];
    this.participants.map((student) => {
      let exportObject = {
        Vorname: student.firstname,
        Nachname: student.lastname,
      }
      this.course.performanceCategories.map((cat) => {
        if (this.isNonEmptyGroup(cat)) {
          this.digDeeper(cat, student, exportObject);
        } else {
          exportObject[cat.name] = this.getStudentsRatingInACat(cat._id, student._id);
        }
      });
      this.exportData.push(exportObject);
    });
    let csv_string = this.papa.unparse(this.exportData);
    var blob = new Blob([csv_string]);
    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    let time = new Date().toJSON().slice(0, 10);
    a.download = time + '-' + Math.round(new Date().getTime() / 1000) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a); 

  }

  digDeeper(category, student, exportObject) {
    //this function searches the tree of subchildren recursively. The recursion stopps when an e
    return category.children.map((subgroup) => {
      //if the first,second,third child is also a group, go deeper recursivly
      if (this.isNonEmptyGroup(subgroup)) {
        this.digDeeper(subgroup, student, exportObject)
      } else {
        //not of type "group" (a potential candiate), or an empty??? group (which cannot have any ratings)
        return exportObject[subgroup.name] = this.getStudentsRatingInACat(subgroup._id, student._id)
      }
    })
  }

  getStudentsRatingInACat(cat_id, stud_id) {
    //return number of total_points of student with stud_id in the category with cat_id if found, 0 otherwise.
    let student = this.participants.find((student) => {
      return student._id == stud_id
    });
    let grading = student.computed_gradings.find((grading) => {
      return grading.category_id == cat_id
    });
    return (grading && grading.total_points) ? grading.total_points : 0;
  }

  isNonEmptyGroup(toplevel_category) {
    if (toplevel_category.children.length > 0 && toplevel_category.type == "group") {
      return true
    } else {
      return false;
    }
  }
  //
  // ────────────────────────────────────────────────────────────────────── C ──────────
  //   :::::: H E L P E R   F U N C T I O N : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────────────────────
  //

  closeSlidingItem(slidingItem: ItemSliding) {
    slidingItem.close();
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create('CourseDetailPopoverPage', {
      course: this.course,
      view: this.view,
    });
    popover.present({
      ev: myEvent
    });
    popover.onDidDismiss(data => {
      if (data) {
        //Here we could call functions. Even with parameters if needed (set data.parameters or so...)
        //However, this created very slow user experience and should therefore be avoided
        // if (data.function == 'someFunction') {
        //   this.someFunction();
        // }
      }
    })
  }
  printInfo() {
    console.log('this.course: ', this.course, '\nthis.courses: ', this.courses, '\nthis.participants: ', this.participants)
  }
}
