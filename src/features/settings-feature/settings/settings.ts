import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { StudentService } from '../../../services/student-service';
import { CourseService } from '../../../services/course.service';

import { COURSES } from '../../../app/mock-data/courses';
import { STUDENTS } from '../../../app/mock-data/students_new';

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
    public studentService: StudentService,
    public courseService: CourseService,) {
  }

  ionViewDidLoad() {
    this.courseService.getCourses().subscribe(data => this.courses = data)
    this.studentService.getStudents().subscribe(data=>this.students = data);
  }  
  addMockData(){
    this.storage.set('courses', COURSES);
    this.storage.set('students', STUDENTS);
  }
  removeStudents(){
    this.studentService.removeStudents();
  }
  removeCourses(){
    this.courseService.removeCourses();
  }

}
