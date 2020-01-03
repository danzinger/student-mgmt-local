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
  listOrderBy;

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

  ionViewWillEnter() {
    this.settingsService.getAllSettingsPromise()
      .then(s => { this.mergeSettings(s) })
      .then(() => {
        this.getParticipants().then((participants) => {
          this.participants = participants;
        })
          .then(() => {
            if (!this.listOrderBy) {
              this.listOrderBy = this.settings.AUTOSORT ? 'total_grading' : 'lastname'
            }
            this.dataTable = this.generateGradingTable(this.participants);
          })
      })
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
    this.navCtrl.push('StudentAddPage', { control_data: { registerForCourse: true, course: this.course, students: this.participants } })
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
    return dataTable;
  }

  //
  // ─── SORT BY CATEGORY FEATURE ───────────────────────────────────────────────────
  //

  showOrderByDialogue() {
    this.dataTable = (this.dataTable.length == 0) ? this.generateGradingTable(this.participants) : this.dataTable;
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

    alert.addButton('Abbrechen');
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
            this.studentService.deleteStudent(participant).then(
              data => {
                this.participants = data;
              }).then(() => {
                this.courseService.unregisterStudentFromAllCourses(participant._id).subscribe()
              }).then(() => {
                this.toastService.showToast('Löschen erfolgreich');
              }).catch(error => {
                this.toastService.showToast('Löschen fehlgeschlagen');
              })
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

  updateNote(note_id) {
    let updateNoteModal = this.modalCtrl.create('CourseNoteUpdateModalPage', { note_id: note_id, course: this.course });
    updateNoteModal.present();
  }

  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //
  deleteNote(_id) {
    this.presentNoteDeleteConfirm(_id)
  }

  presentNoteDeleteConfirm(_id) {
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
            delete this.course.newnotes[_id]
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
      parent: parent,
      settings: this.settings
    });
    CoursePerfcatEditModal.present();
    CoursePerfcatEditModal.onDidDismiss(() => {
      //since user can make changes that need to be reflected in the table we need to update it
      this.dataTable = this.generateGradingTable(this.participants)
    })
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
    CoursePerfcatUpdateModal.onDidDismiss(() => {
      //since user can make changes that need to be reflected in the table we need to update it
      this.dataTable = this.generateGradingTable(this.participants)
    })
  }

  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //


  initializeDeletionArray(child): String[] {
    //returns an array of a grading_category and all of its subgroups
    return this.courseService.initializeDeletionArray(child);
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
    this.courseService.deletePerformanceCategory(category, parent, child, isTopLevel, this.course).subscribe(
      data => {
        this.courseService.getCourseById(this.course._id).subscribe((course) => {
          this.course = course;
          this.studentService.getParticipants(this.course._id).subscribe((participants) => {
            this.participants = participants;
          })
        })
        //since changes need to be reflected in the table we need to update it
        this.dataTable = this.generateGradingTable(this.participants);
        this.toastService.showToast('Löschen erfolgreich!');
      },
      error => {
        this.toastService.showToast('Fehler beim Löschen der Kategorie.');
      });
  }


  //
  // ──────────────────────────────────────────────────────────────────────────────────────────────────── III ──────────
  //   :::::: C O U R S E  S E T T I N G S  F E A T U R E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
  //

  presentCourseSettingsModal() {
    let CourseSettingsModal = this.modalCtrl.create('CourseSettingsModalPage', { course: this.course, settings_from_coursedetail: this.settings });
    CourseSettingsModal.present();
    CourseSettingsModal.onDidDismiss((data) => {
      if (data) {
        this.course = data.course;
        this.settings = data.settings;
        if (this.listOrderBy == 'lastname' || this.listOrderBy == 'total_grading') {
          this.listOrderBy = this.settings.AUTOSORT ? 'total_grading' : 'lastname';
        }
        this.dataTable = this.generateGradingTable(this.participants);
      }
    })
  }

  mergeSettings(settings_from_service) {
    this.settings = settings_from_service;
    if (this.course.course_settings) {
      this.settings = this.settingsService.mergeCourseSettings(this.settings, this.course.course_settings)
    }
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
  array of Objects like:
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
    this.parseAndDownloadGradingsOnAndroid(exportData).then(() => {
      this.toastService.showToast('Datenexport erfolgreich!');
    }).catch(err => this.toastService.showToast('Datenexport fehlgeschlagen! Grund: ' + JSON.stringify(err)))
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
    let exportData = [];
    this.participants.map((student) => {
      let exportObject = {
        Vorname: student.firstname,
        Nachname: student.lastname,
      }
      resultcats.map((cat) => {
        exportObject['Gesamtnote'] = this.gradeCalculationService.calculateGrade(this.course.performanceCategories, student.computed_gradings, this.settings)
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
        let filename: string = 'StudentMgmt/csv-export/kurs-csv/' + this.course.name + '-' + time + '-' + Math.round(new Date().getTime() / 1000).toString().substr(-4) + '.csv';
        this.file.writeFile(this.file.externalRootDirectory, filename, csv_string).then(() => {
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
    return this.file.checkDir(this.file.externalRootDirectory, 'StudentMgmt/csv-export/kurs-csv')
  }
  createDir() {
    return this.file.createDir(this.file.externalRootDirectory, 'StudentMgmt', true).then(() => {
      return this.file.createDir(this.file.externalRootDirectory, 'StudentMgmt/csv-export', true).then(() => {
        return this.file.createDir(this.file.externalRootDirectory, 'StudentMgmt/csv-export/kurs-csv', true)
      })
    })
  }
  //
  // ────────────────────────────────────────────────────────────────────── C ──────────
  //   :::::: H E L P E R   F U N C T I O N : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────────────────────
  //

  reverseList() {
    return this.reverse = this.reverse ? false : true;
  }

  closeSlidingItem(slidingItem: ItemSliding) {
    slidingItem.close();
  }

  //
  // ─── GET KEYS OF AN OBJECT AS ARRAY
  //

  getKeys(obj) {
    return Object.keys(obj).length > 0 ? Object.keys(obj) : []
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
    return this.settings.GRADE_CALCULATION_FEATURE ? this.courseService.flattenCategories(this.course, true) : this.courseService.flattenCategories(this.course, false)
  }

  printInfo() {
    console.log(
      'this.course: ', this.course,
      '\nthis.courses: ', this.courses,
      '\nthis.participants: ', this.participants,
      '\ndataTable: ', this.dataTable,
      '\nlistOrderBy: ', this.listOrderBy)
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  convertToReadableDate(dateObject) {
    var utc = typeof (dateObject) == "object" ? dateObject.toJSON().slice(0, 10).replace(/-/g, '/') : dateObject.slice(0, 10).replace(/-/g, '/');
    return utc;
  }

}
