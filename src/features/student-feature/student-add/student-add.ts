import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ViewController } from 'ionic-angular';
import { PapaParseService } from 'ngx-papaparse';
import { MongoIdService } from '../../../services/mongo-id.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { StudentService } from '../../../services/student-service';
import { CourseService } from '../../../services/course.service';

import { File } from '@ionic-native/file';
import { ToastService } from '../../../services/toast.service';

/**
 * Generated class for the StudentAddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-student-add',
  templateUrl: 'student-add.html',
})
export class StudentAddPage {

  private form: FormGroup;
  isReadyToSave: boolean;
  students;
  control_data;
  addMany;
  flatened_categories;
  selected_categories;
  course;
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    private papa: PapaParseService,
    private formBuilder: FormBuilder,
    public mongoIdService: MongoIdService,
    public studentService: StudentService,
    public courseService: CourseService,
    public file: File,
    public toastService: ToastService) {

    this.form = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['']
    })
    // Watch the form for changes
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
    this.control_data = this.navParams.get('control_data')
    this.course = this.control_data ? this.control_data.course : {};
    this.students = this.control_data ? this.control_data.students : [];

  }

  ionViewDidEnter() {
    if (this.control_data) {
      this.flatened_categories = this.courseService.flattenCategories(this.course, false);
    }
  }

  onCategorySelect(selected_categories) {
    //this.studentService.getParticipants(this.control_data.course._id).subscribe(students => console.log(students))
    this.selected_categories = selected_categories;

  }
  onAction(ev) {
    if (ev.action == 1) {
      let me = this;
      let file = ev.currentFiles[0]
      this.papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
          if (me.checkData(results)) {
            results.data.forEach(student => {
              student._id = me.mongoIdService.newObjectId();
              student.gradings = [];
              student.notes = [];
              student.course_registrations = [];
              if (me.control_data && me.control_data.registerForCourse) student.course_registrations.push(me.control_data.course._id);
              student.computed_gradings = [];
            });
            me.presentAddStudentsConfirm(results.data, results.data.length + ' Studenten hinzufügen?')
          } else {
            me.toastService.showToast('Fehler: Daten nicht im richtigen Format')
          }
        }
      })
    }
  }

  checkData(parsed_data) {
    return parsed_data.meta.fields.length == 2 && parsed_data.meta.fields[0] == 'firstname' && parsed_data.meta.fields[1] == 'lastname'
  }

  addStudentFromForm() {
    this.addStudent(this.form.value);
  }

  addStudent(student) {
    student._id = this.mongoIdService.newObjectId();
    student.gradings = [];
    student.notes = [];
    student.course_registrations = [];
    if (this.control_data && this.control_data.registerForCourse) student.course_registrations.push(this.control_data.course._id);
    student.computed_gradings = [];
    let student_new = [];
    student_new.push(student);
    this.presentAddStudentsConfirm(student_new, student.firstname + ' ' + student.lastname + ' hinzufügen?');
  }

  courses;
  presentAddStudentsConfirm(students, message) {
    let alert = this.alertCtrl.create({
      title: 'Bestätigen',
      message: message,
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
            if (this.control_data && this.control_data.course) {
              students.forEach(student => {
                this.control_data.course.participants.push(student._id);
              });
              this.courseService.updateCourse(this.control_data.course).subscribe(courses => {
                this.courses = courses;
              });
            }
            //in any case the students are created and the view gets dismissed
            this.studentService.addStudents(students).subscribe(
              data => this.viewCtrl.dismiss({
                students: data,
              }),
              error => { this.toastService.showToast('Fehler: ' + JSON.stringify(error)) }
            );

          }
        }
      ]
    });
    alert.present();
  }


  //
  // ──────────────────────────────────────────────────────────────────────────── I ──────────
  //   :::::: C S V - G R A D I N G   I M P O R T : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────────────
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
    //this.parseAndDownloadGradingsOnDesktop(exportData);
    if(this.selected_categories && this.selected_categories.length > 0){
      this.studentService.getParticipants(this.course._id).subscribe(s => {
      let exportData = this.generateExportData(s);
      this.parseAndDownloadGradingsOnAndroid(exportData).then(() => {
        this.toastService.showToast('Datenexport erfolgreich!');
      }).catch(err => alert(JSON.stringify(err)))
    })
    }else{
      this.toastService.showToast('Zuerst die Kategorien auswählen, für die Bewertungen hinzugefügt werden sollen')
    }
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

  generateExportData(students) {
    //flatten the categories
    let exportData = [];
    students.map((student) => {
      let exportObject = {
        _id: student._id,
        Vorname: student.firstname,
        Nachname: student.lastname
      }
      this.selected_categories.map((cat) => {
        exportObject[cat.name] = "NICHTS EINTRAGEN";
        exportObject[cat._id] = "";
      });
      exportData.push(exportObject);
    });
    return exportData;
  }

  //This method was used for development purposes and cannot be used on Android
  parseAndDownloadGradingsOnDesktop(exportData) {
    return new Promise((resolve, reject) => {
      let csv_string = this.papa.unparse(exportData);
      var blob = new Blob([csv_string]);
      var a = window.document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      let time = new Date().toJSON().slice(0, 10);
      a.download = time + '-' + Math.round(new Date().getTime() / 1000).toString().substr(-4) + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      resolve();
    });
  }

  parseAndDownloadGradingsOnAndroid(exportData) {
    return new Promise((resolve, reject) => {
      this.checkDir().then(() => {
        let csv_string = this.papa.unparse(exportData);
        let time = new Date().toJSON().slice(0, 10);
        let filename: string = 'StudentMgmt/csv-export/bewertungs-csv/' + this.course.name + '-' + time + '-' + Math.round(new Date().getTime() / 1000).toString().substr(-4) + '.csv';
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
    return this.file.checkDir(this.file.externalRootDirectory, 'StudentMgmt/csv-export/bewertungs-csv')
  }
  createDir() {
    return this.file.createDir(this.file.externalRootDirectory, 'StudentMgmt', true).then(() => {
      return this.file.createDir(this.file.externalRootDirectory, 'StudentMgmt/csv-export', true).then(() => {
        return this.file.createDir(this.file.externalRootDirectory, 'StudentMgmt/csv-export/bewertungs-csv', true)
      })
    })
  }

  onGradingCsvAction(ev) {
    if (ev.action == 1) {
      let me = this;
      let file = ev.currentFiles[0]
      this.papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
          if (me.checkCsvgradingImportData(results)) {
            me.presentAddGradingsConfirm(results, "Bewertungen für " + results.data.length + ' Studenten hinzufügen?')
          } else {
            me.toastService.showToast('Fehler: Daten nicht im richtigen Format')
          }
        }
      })
    }
  }

  checkCsvgradingImportData(parsed_data) {
    return parsed_data.meta.fields[1] == 'Vorname' && parsed_data.meta.fields[2] == 'Nachname'
  }

  array_of_students_to_update = [];
  updateStudents(results) {
    return new Promise(resolve => {
      if (this.control_data && this.control_data.course) {
        results.data.map(data_row_student => {
          let student_to_update = this.students.find(c => c._id == data_row_student._id);
          for (let i of results.meta.fields.keys()) {
            if (i > 2 && i % 2 == 1) {
              let grading = {
                category_id: results.meta.fields[i + 1],
                category_name: results.meta.fields[i],
                course_id: this.course._id,
                date: new Date(),
                points: data_row_student[results.meta.fields[i + 1]],
                remarks: undefined
              }
              //do not include empty fields (if student lack a grading)
              if (grading.points != undefined) {
                this.studentService.addGradingToStudent(student_to_update, grading).then(updated_student => {
                  student_to_update = updated_student;
                })
              }
            }
          }
          this.array_of_students_to_update.push(student_to_update)
        });
        this.studentService.updateManyStudents(this.array_of_students_to_update).then(() => {
          resolve();
        })
      }
    })
  }

  presentAddGradingsConfirm(results, message) {
    let alert = this.alertCtrl.create({
      title: 'Bestätigen',
      message: message,
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
            this.updateStudents(results).then(() => {
              this.toastService.showToast('Bewertungen erfolgreich hinzugefügt!')
            });
          }
        }
      ]
    });
    alert.present();
  }



}
