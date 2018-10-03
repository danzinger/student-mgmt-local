import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import { Student } from '../app/models/student';

@Injectable()
export class StudentService {

  constructor(private storage: Storage) {
  }

  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //

  addStudents(students): Observable<Student[]> {
    return Observable.from(this.storage.get('students')
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
    return Observable.from(this.storage.get('students'));
  }

  getParticipants(course_id): Observable<Student[]> {
    return Observable.from(this.storage.get('students').then(students => {
      if (students) {
        return students.filter(student => {
          return student.course_registrations ? student.course_registrations.includes(course_id) : false;
        })
      } else {
        return [];
      }
    }))
  }

  getStudentById(student_id): Observable<Student[]> {
    return Observable.from(this.storage.get('students')
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

  updateStudentOLD(student): Observable<Student[]> {
    return Observable.from(this.storage.get('students').then(students => {
      let res = students.find(c => c._id == student._id);
      let index = students.indexOf(res);
      //Delete the old student (if it exists)
      delete student.registered;
      if (index > -1) students[index] = student;
      return this.storage.set('students', students);
    }))
  }

  updateStudent(updated_student): Observable<Student[]> {
    //console.log("update to: "+JSON.stringify(updated_student.gradings));
    return Observable.from(this.storage.get('students')
      .then(students => {
        let arr = students.filter(student => student._id != updated_student._id)
        arr.push(updated_student);
        return this.storage.set('students', arr);
      }));
  }

  updateManyStudents(updated_students): Promise<Student> {
    this.storage.get('students')
      .then(students => {
        updated_students.forEach(updated_student => {
          let res = students.find(c => c._id == updated_student._id);
          let index = students.indexOf(res);
          students[index] = updated_student
        });
        this.storage.set('students',students)
      });
      this.storage.get('students').then(s=>console.log(s));
      return this.storage.get('students');
  }

  updateAllStudents(students): Observable<Student[]> {
    return Observable.from(this.storage.set('students',students))
  }

  // ADD GRADING TO STUDENT

  addGradingToStudent(student, rating) {
    student.gradings.push(rating)
    return this.addToComputedGradings(student, rating);
  }

  tmp_index;
  addToComputedGradings(student, rating) {
    //adds a grading to the computed gradings. if no computed_gradings object exists it creates one and inserts the first value.
    //if the grading sum is 0 the computed gradings objects gets removed from the array
    return new Promise(resolve=>{
      this.tmp_index = -1;
      if (!student.computed_gradings || student.computed_gradings.length == 0) {
        //if this is the first rating in this category
        student.computed_gradings = []
        student = this.addNewComputedGrading(student, rating);
      } else {
        //else if there are already computed gradings avalible
        let found = false;
        student.computed_gradings.forEach((computed_grading) => {
          if (computed_grading.category_id == rating.category_id) {
            computed_grading.total_points += rating.points;
            found = true;
            if (computed_grading.total_points == 0) {
              this.tmp_index = student.computed_gradings.indexOf(computed_grading);
            }
          }
        })
        if (found == false) {
          student = this.addNewComputedGrading(student, rating);
        }
        found = false;
        if (this.tmp_index > -1) student.computed_gradings.splice(this.tmp_index, 1);
        this.tmp_index = -1;
      }
      resolve(student)
    })
    //return this.updateStudent(student)
  }

  addNewComputedGrading(student, rating) {
    student.computed_gradings.push({
      category_id: rating.category_id,
      course_id: rating.course_id,
      category_name: rating.category_name,
      total_points: rating.points
    })
    return student;
  }

  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //
  deleteCourse(course_id_to_delete): Observable<any> {
    return Observable.from(this.storage.get('courses')
      .then(courses => {
        return courses.filter(course => {
          return course._id != course_id_to_delete
        })
      })
      .then(value => { return this.storage.set('courses', value) }
      ));
  }

  deleteStudent(student_to_delete): Observable<any> {
    return Observable.from(this.storage.get('students')
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