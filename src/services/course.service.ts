import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

//import { Student } from '../app/models/student';
//import { COURSES } from '../app/mock-data/courses';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Course } from '../app/models/course';

@Injectable()
export class CourseService {
  constructor(private storage: Storage) {
  }

  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //

  createCourse(course): Observable<Course[]> {
    return Observable.fromPromise(this.storage.get('courses')
      .then(courses => {
        if (!courses) courses = [];
        courses.push(course);
        return this.storage.set('courses', courses)
      })
    )
  }

  //
  // ─── READ ───────────────────────────────────────────────────────────────────────
  //

  getCourses(): Observable<Course[]> {
    return Observable.fromPromise(this.storage.get('courses'));
  }

  getCourseById(course_id): Observable<Course[]> {
    return Observable.fromPromise(this.storage.get('courses')
      .then(courses => {
        if (courses) {
          return courses.filter(course => {
            return course._id == course_id;
          })
        }
      }))
  }

  //
  // ─── UPDATE ─────────────────────────────────────────────────────────────────────
  //

  updateCourse(updated_course): Observable<Course[]> {
    return Observable.fromPromise(this.storage.get('courses')
      .then(courses => {
        let arr = courses.filter(course => course._id != updated_course._id)
        arr.push(updated_course);
        return this.storage.set('courses', arr);
      }));
  }


  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //

  deleteCourse(course_id_to_delete): Observable<Course[]> {
    return Observable.fromPromise(this.storage.get('courses')
      .then(courses => {
        return courses.filter(course => {
          return course._id != course_id_to_delete
        })
      })
      .then(value => { return this.storage.set('courses', value) }
      ));
  }

  removeCourses(): Promise<any> {
    return this.storage.remove('courses');
  }

}