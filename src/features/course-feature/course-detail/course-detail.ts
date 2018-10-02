import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, PopoverController, AlertController, ItemSliding } from 'ionic-angular';

import { StudentService } from '../../../services/student-service';
import { CourseService } from '../../../services/course.service';
import { ToastService } from '../../../services/toast.service';

import { Course } from '../../../app/models/course';
import { Student } from '../../../app/models/student';
import { SettingsService } from '../../../services/settings.service';
import { PapaParseService } from 'ngx-papaparse';

import { File } from '@ionic-native/file';

//import { OrderPipe } from 'ngx-order-pipe';
import { Settings } from '../../../app/models/settings';
import { GradeCalculationService } from '../../../services/gradeCalculation.service';

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
  listOrderBy = 'lastname'

  dataTable;
  reverse = false;

  settings = new Settings;

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
    public file: File,
    public ref: ChangeDetectorRef,
    public gradeCalculationService: GradeCalculationService) {

    this.courses = navParams.get('courses');
    this.course = navParams.get('course');
    this.course_id = this.course._id;


  }
  ionViewDidEnter() {
    this.settingsService.getAllSettings().subscribe((s) => this.settings = s);
    this.getParticipants().then((participants) => {
      this.participants = participants;
      //for easy sorting, we generate a 2-Dimensional dataTable here. We use this table - not the original array of participants - to display the students in the view.
      // However, we need the original participants in this view to pass a selected participant to the next view and of course to generate the dataTable
      // If this table would be needed elsewhere, it might be useful to outsource this work to the student-service.
      this.dataTable = this.generateGradingTable(participants);
    });
  }

  reverseList() {
    return this.reverse = this.reverse ? false : true;
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

  getParticipants(): Promise<Student[]> {
    return new Promise((resolve, reject) => {
      this.studentService.getParticipants(this.course._id).subscribe(participants => resolve(participants), err => reject(err));
    })
  }

  goToStudentDetail(selected_participant) {
    let full_participant = this.participants.find(participant => { return participant._id == selected_participant._id })
    this.navCtrl.push('StudentDetailPage', { student: full_participant, course: this.course, courses: this.courses });
  }

  generateGradingTable(participants) {
    //flatten the categories
    let dataTable = [];
    participants.map((student) => {
      let dataTableRow = {
        _id: student._id,
        firstname: student.firstname,
        lastname: student.lastname,
      }
      let flattenedCategories = this.flattenCategories();
      flattenedCategories.map((cat) => {
        if (cat.type != 'group') {
          dataTableRow[cat._id] = this.getStudentsRatingInACat(cat._id, student._id);
        } else {
          dataTableRow[cat._id] = this.gradeCalculationService.calculateGrade(this.course.performanceCategories, student.computed_gradings, this.settings, cat.children)
        }
        dataTableRow['total_grading'] = this.gradeCalculationService.calculateGrade(this.course.performanceCategories, student.computed_gradings, this.settings)
      });
      dataTable.push(dataTableRow);
    });
    console.log(dataTable)
    return dataTable;
  }

  //
  // ─── SORT BY CATEGORY FEATURE ───────────────────────────────────────────────────
  //

  showOrderByDialogue() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Ordnen und anzeigen');

    alert.addInput({
      type: 'radio',
      label: 'Vorname',
      value: 'firstname'
    });

    alert.addInput({
      type: 'radio',
      label: 'Nachname',
      value: 'lastname'
    });

    let flattenedCategories = this.flattenCategories();
    for (let category of flattenedCategories) {
      alert.addInput({
        type: 'radio',
        label: category.name,
        value: category._id
      });
    }

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        this.listOrderBy = data;
        this.ref.detectChanges();
      }
    });
    alert.present();
  }

  //
  // ─── UPDATE ─────────────────────────────────────────────────────────────────────
  //

  presentStudentUpdateModal(student_from_table) {
    let student = this.participants.filter(participant => {
      return participant._id == student_from_table._id
    })
    let updateModal = this.modalCtrl.create('StudentUpdateModalPage', {
      student: student[0]
    });
    updateModal.onDidDismiss(() => {
      this.getParticipants().then((participants) => {
        this.participants = participants;
        this.dataTable = this.generateGradingTable(participants);
      });
    })
    updateModal.present();
  }

  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //

  deleteParticipant(participant) {
    this.presentStudentDeleteConfirm(participant);
  }

  presentStudentDeleteConfirm(participant) {
    let alert = this.alertCtrl.create({
      title: 'Achtung',
      message: participant.firstname + " " + participant.lastname + ' wird gelöscht. Bist du sicher?',
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
            this.studentService.deleteStudent(participant).subscribe(
              data => {
                let index = this.dataTable.indexOf(participant);
                if (index > -1) this.dataTable.splice(index, 1);
                this.toastService.showToast('Löschen erfolgreich');
              },
              error => {
                this.toastService.showToast('Löschen fehlgeschlagen');
              }
            )
          }
        }
      ]
    });
    alert.present();
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
          text: 'Abbrechen',
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
      course: this.course,
      settings: this.settings
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

  editPerformanceCategory(category, child?, parent?) {
    //if user wants to edit a child, the child is passed to next view
    child = null ? !child : child;
    parent = null ? !parent : parent;
    let CoursePerfcatEditModal = this.modalCtrl.create('CoursePerfcatUpdateModalPage', {
      category: category,
      child: child,
      course: this.course,
      parent: parent
    });
    CoursePerfcatEditModal.present();
  }

  addPerformanceCategoryGroupMember(category, parent, number_of_parents, child) {
    let CoursePerfcatUpdateModal = this.modalCtrl.create('CoursePerfcatUpdateModalPage', {
      category: category,
      addToGroup: true,
      parent: parent,
      number_of_parents: number_of_parents,
      child: child,
      course: this.course,
      settings: this.settings
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
            this.getParticipants().then((participants) => {
              this.participants = participants;
            });
          })
        }
      },
      error => {
        this.toastService.showToast('Fehler beim Löschen der Bewertungen. Konsistenzcheck der Daten empfohlen!');
      })
  }

  presentPerfCatDeleteConfirm(category, parent, child, isTopLevel) {
    let alert = this.alertCtrl.create({
      title: 'Achtung',
      message: 'Die Kategorie wird gelöscht. Zudem werden alle Bewertungen von allen Studenten in dieser Kategorie gelöscht. Bist du sicher?',
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
            this.deletePerformanceCategory(category, parent, child, isTopLevel);
          }
        }
      ]
    });
    alert.present();
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
  ...
  ...
  },
  ]
  
  */

  exportCourseData() {
    let resultcats = this.flattenCategories();
    let exportData = this.generateExportData(resultcats);
    //this.parseAndDownloadGradingsOnDesktop(exportData);
    this.parseAndDownloadGradingsOnAndroid(exportData).then(() => {
      this.toastService.showToast('Datenexport erfolgreich!');
    }).catch(err => alert(JSON.stringify(err)))
  }

  presentExportCourseDataConfirm() {
    let alert = this.alertCtrl.create({
      title: 'Datenexport',
      message: 'Kurs "' + this.course.name + '" inkl. aller Bewertungen jetzt als .csv Datei exportieren? Der Kurs wird im Ordner StudentMgmt/csv gespeichert.',
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
            this.exportCourseData()
          }
        }
      ]
    });
    alert.present();
  }

  generateExportData(resultcats) {
    //flatten the categories
    let exportData = [];
    this.participants.map((student) => {
      let exportObject = {
        Vorname: student.firstname,
        Nachname: student.lastname,
      }
      resultcats.map((cat) => {
        exportObject['Note'] = this.gradeCalculationService.calculateGrade(this.course.performanceCategories, student.computed_gradings, this.settings)
        if (cat.type == 'group') {
          exportObject[cat.name] = this.gradeCalculationService.calculateGrade(this.course.performanceCategories, student.computed_gradings, this.settings, cat.children)
        } else {
          exportObject[cat.name] = this.getStudentsRatingInACat(cat._id, student._id);
        }
      });
      exportData.push(exportObject);
    });
    return exportData;
  }

  //This method was used for development purposes and cannot be used on Android
  // parseAndDownloadGradingsOnDesktop(exportData) {
  //   return new Promise((resolve, reject) => {
  //     let csv_string = this.papa.unparse(exportData);
  //     var blob = new Blob([csv_string]);
  //     var a = window.document.createElement("a");
  //     a.href = window.URL.createObjectURL(blob);
  //     let time = new Date().toJSON().slice(0, 10);
  //     a.download = time + '-' + Math.round(new Date().getTime() / 1000).toString().substr(-4) + '.csv';
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     resolve();
  //   });
  // }

  parseAndDownloadGradingsOnAndroid(exportData) {
    return new Promise((resolve, reject) => {
      this.checkDir().then(() => {
        let csv_string = this.papa.unparse(exportData);
        let time = new Date().toJSON().slice(0, 10);
        let filename: string = 'StudentMgmt/csv-export/' + this.course.name + '-' + time + '-' + Math.round(new Date().getTime() / 1000).toString().substr(-4) + '.csv';
        this.file.writeFile(this.file.externalRootDirectory, filename, csv_string).then(() => {
          //this.listDir();
          resolve();
        }).catch(err => {
          this.toastService.showToast('Fehler beim Anlegen des Backups! Dateisystem meldet: ' + JSON.stringify(err));
          reject(err);
        });
      }).catch((err) => {
        if (err.code == 1) {
          this.createDir().then(() => {
            this.parseAndDownloadGradingsOnAndroid(exportData).then(() => {
              resolve();
            }).catch(err => reject(err))
          }).catch(err => this.toastService.showToast('Fehler beim Anlegen des Ordners für Backups! Dateisystem meldet: ' + JSON.stringify(err)))
        } else {
          this.toastService.showToast('Fehler beim Anlegen des Ordners für Backups! Dateisystem meldet: ' + JSON.stringify(err));
          reject(err);
        }
      });
    })
  }

  checkDir() {
    return this.file.checkDir(this.file.externalRootDirectory, 'StudentMgmt/csv-export')
  }
  createDir() {
    return this.file.createDir(this.file.externalRootDirectory, 'StudentMgmt', true).then(() => {
      return this.file.createDir(this.file.externalRootDirectory, 'StudentMgmt/csv-export', true)
    })
  }
  //
  // ────────────────────────────────────────────────────────────────────── C ──────────
  //   :::::: H E L P E R   F U N C T I O N : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────────────────────
  //

  closeSlidingItem(slidingItem: ItemSliding) {
    slidingItem.close();
  }

  //
  // ─── GET STUDENTS RATING IN A CATEGORY FROM COMPUTED GRADINGS ARRAY IN THE STUDENT OBJECT ──────────
  //

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

  //
  // ─── Flatten Categories ───────────────────────────────────────────────────────────────────────────
  //

  resultcats: any[];
  flattenCategories() {
    //flatten the nested categories
    let resultcats: any[] = [];
    if (this.course.performanceCategories) {
      if(this.settings.GRADE_CALCULATION_FEATURE) resultcats.push({name: 'Gesamtnote',_id:'total_grading'});
      this.course.performanceCategories.map((cat) => {
        if (this.isNonEmptyGroup(cat)) {
          if(this.settings.GRADE_CALCULATION_FEATURE) resultcats.push(cat);
          this.digDeeper(cat, resultcats);
        } else {
          resultcats.push(cat);
        }
      });
    }
    return resultcats;
  }

  digDeeper(category, resultcats: any[]) {
    //this function searches the tree of subchildren recursively.
    return category.children.map((subgroup) => {
      //if the child is also a nonempty group, go one level deeper
      if (this.isNonEmptyGroup(subgroup)) {
        if(this.settings.GRADE_CALCULATION_FEATURE) resultcats.push(subgroup);
        this.digDeeper(subgroup, resultcats)
      } else {
        return resultcats.push(subgroup);
      }
    })
  }

  isNonEmptyGroup(category) {
    return category.children && category.children.length > 0 && category.type == "group"
  }

  printInfo() {
    console.log('this.course: ', this.course, '\nthis.courses: ', this.courses, '\nthis.participants: ', this.participants)
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

}
