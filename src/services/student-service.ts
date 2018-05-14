import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Student } from '../app/models/student';

@Injectable()
export class StudentService {

  constructor(private storage: Storage) {
  }

  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //

  addStudents(students): Observable<Student[]> {
    return Observable.fromPromise(this.storage.get('students')
      .then(students_in_database => {
        if (!students_in_database) students_in_database = [];
        if(students && students.length > 0){
          students.forEach(student => {
            students_in_database.push(student)
          });
        }
        return this.storage.set('students', students_in_database);
      }))
  }

  //
  // ─── READ ───────────────────────────────────────────────────────────────────────
  //

  getStudents(): Observable<Student[]> {
    return Observable.fromPromise(this.storage.get('students'));
  }

  getParticipants(course_id): Observable<Student[]> {
    return Observable.fromPromise(this.storage.get('students').then(students => {
      if (students) {
        return students.filter(student => {
          return student.course_registrations.includes(course_id)
        })
      } else {
        return [];
      }
    }))
  }

  getStudentById(student_id): Observable<Student[]> {
    return Observable.fromPromise(this.storage.get('students')
      .then(students => {
        if (!students) students = [];
        return students.filter(student => {
          return student._id == student_id;
        })
      }))
  }

  //
  // ─── UPDATE ─────────────────────────────────────────────────────────────────────
  //

  updateStudent(student): Observable<Student[]> {
    return Observable.fromPromise(this.storage.get('students').then(students => {
      let res = students.find(c => c._id == student._id);
      let index = students.indexOf(res);
      //Delete the old course (if it exists)
      delete student.registered;
      if (index > -1) students[index] = student;
      return this.storage.set('students', students);
    }))
  }
  updateAllStudents(students): Observable<Student[]> {
    return Observable.fromPromise(this.storage.set('students',students))
  }

  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //
  deleteCourse(course_id_to_delete): Observable<any> {
    return Observable.fromPromise(this.storage.get('courses')
      .then(courses => {
        return courses.filter(course => {
          return course._id != course_id_to_delete
        })
      })
      .then(value => { return this.storage.set('courses', value) }
      ));
  }

  deleteStudent(student_to_delete): Observable<any> {
    return Observable.fromPromise(this.storage.get('students')
      .then(students => {
        return students.filter(student => {
          return student._id != student_to_delete._id
        })
      })
      .then(value => { return this.storage.set('students', value) }
      ));
  }

  removeStudents(): Promise<any> {
    return this.storage.remove('students');
  }

}