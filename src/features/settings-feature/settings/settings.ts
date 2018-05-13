import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { StudentService } from '../../../services/student-service';
import { CourseService } from '../../../services/course.service';

import { COURSES } from '../../../app/mock-data/courses';
import { STUDENTS } from '../../../app/mock-data/students_new';
import { PapaParseService } from 'ngx-papaparse';
import { ToastService } from '../../../services/toast.service';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  firstname;
  lastname;
  courses;
  students;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private papa: PapaParseService,
    public toastService: ToastService,
    public studentService: StudentService,
    public courseService: CourseService, ) {
  }

  ionViewDidLoad() {
    this.courseService.getCourses().subscribe(data => this.courses = data)
    this.studentService.getStudents().subscribe(data => this.students = data);
  }
  addMockData() {
    this.storage.set('courses', COURSES);
    this.storage.set('students', STUDENTS);
  }
  removeStudents() {
    this.studentService.removeStudents();
  }
  removeCourses() {
    this.courseService.removeCourses();
  }
  loadData() {
  }

  imported_data;
  onAction(ev) {
    // action: (src: https://github.com/bergben/ng2-file-input)
    // Removed=0,
    // Added= 1,
    // InvalidDenied = 2,
    // CouldNotRemove = 3,
    // CouldNotAdd = 4,
    if (ev.action == 1) {
      var reader = new FileReader();
      var me = this;
      var evy = ev;
      reader.onload = function (ev) {
        if (reader.result) {
          try {
            me.imported_data = JSON.parse(reader.result);
          } catch (e) {
            //console.log(e); // error in the above string!
            me.toastService.showToast('Fehler beim Lesen der Datei');
          }
        }
        console.log(me.imported_data);
        me.toastService.showToast('Daten erfolgreich hinzugefügt');
      }
      reader.readAsText(ev.currentFiles[0]);
    }
  }

  exportData() {
    let exportData = {
      students: this.students,
      courses: this.courses
    }
    let json_string = JSON.stringify(exportData);
    var blob = new Blob([json_string]);
    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = "newdata.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

}
