import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { StudentService } from '../../../services/student-service';
import { CourseService } from '../../../services/course.service';

import { COURSES } from '../../../app/mock-data/courses';
import { STUDENTS } from '../../../app/mock-data/students_new';
import { PapaParseService } from 'ngx-papaparse';
import { ToastService } from '../../../services/toast.service';

import { File } from '@ionic-native/file';

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
    public courseService: CourseService,
    public file: File, ) {
  }

  ionViewDidLoad() {
    this.courseService.getCourses().subscribe(data => this.courses = data)
    this.studentService.getStudents().subscribe(data => this.students = data);
  }

  addMockData(data?) {
    if (data) {
      this.storage.set('courses', data.courses).then(() => {
        this.courses = data.courses;
      });
      this.storage.set('students', data.students).then(() => {
        this.students = data.students;
      });
    } else {
      this.storage.set('courses', COURSES).then(() => {
        this.courses = COURSES;
      });
      this.storage.set('students', STUDENTS).then(() => {
        this.students = STUDENTS;
      });
    }
  }
  removeStudents() {
    this.studentService.removeStudents().then(() => {
      this.students = null;
    });
  }
  removeCourses() {
    this.courseService.removeCourses().then(() => {
      this.courses = null;
    });
  }
  loadData() {
  }

  message:String;
  testFile(){
    let dir = this.file.externalRootDirectory ;
    this.message = dir;
    this.toastService.showToast(dir);
  }

  createDir(){
    this.file.createDir(this.file.externalRootDirectory, 'StudentMgmt', true).then(()=>{
      this.toastService.showToast('OK');
    }).catch((err)=>{
      this.toastService.showToast(err);
    });
  }
  deleteDir(){
    this.file.removeDir(this.file.externalRootDirectory, 'StudentMgmt').then(()=>{
      this.toastService.showToast('OK');
    }).catch((err)=>{
      this.toastService.showToast(err);
    });
  }
  checkDir(){
    this.file.checkDir(this.file.externalRootDirectory, 'StudentMgmt').then(()=>{
      this.toastService.showToast('OK');
    }).catch((err)=>{
      this.toastService.showToast(JSON.stringify(err));
    });
  }

  writeFile(){
    let exportData = {
      students: this.students,
      courses: this.courses
    }    
    let json_string:string = JSON.stringify(exportData);
    var blob = new Blob([json_string]);
    let time = new Date().toJSON().slice(0, 13).replace(/-/g, '-');
    let filename:string = 'StudentMgmt/smb-' + time + Math.round(new Date().getTime()/1000);
    this.file.writeFile(this.file.externalRootDirectory, filename, json_string).then(()=>{
      this.toastService.showToast('Backup erfolgreich!');
    }).catch((err)=>{
      this.toastService.showToast('Fehler: '+JSON.stringify(err));
    });
  }

  filesInDir;
  listDir(){
    this.file.listDir(this.file.externalRootDirectory, 'StudentMgmt').then((res)=>{
      this.toastService.showToast('OK');
      this.filesInDir = res;
    }).catch((err)=>{
      this.toastService.showToast(JSON.stringify(err));
    });
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
        me.addMockData(me.imported_data);
        me.toastService.showToast('Daten erfolgreich hinzugefügt');
      }
      reader.readAsText(ev.currentFiles[0]);
    }
  }

  // getStudents(){
  //   this.studentService.getStudents().subscribe((students)=>{return students});
  // }
  // getCourses(){
  //   this.courseService.getCourses().subscribe((courses)=>{return courses});
  // }

  exportData() {
    let exportData = {
      students: this.students,
      courses: this.courses
    }
    let json_string = JSON.stringify(exportData);
    var blob = new Blob([json_string]);
    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    let time = new Date().toJSON().slice(0, 23).replace(/-/g, '-');
    a.download = "student-mgmt-" + time + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

}
