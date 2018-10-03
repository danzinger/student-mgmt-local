import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

//import { Student } from '../app/models/student';
//import { COURSES } from '../app/mock-data/courses';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
//import 'rxjs/add/observable/fromPromise';
//import { fromPromise } from 'rxjs/observable/fromPromise';
import { Course } from '../app/models/course';

@Injectable()
export class CourseService {
  constructor(
    private storage: Storage) {
  }

  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //

  createCourse(course): Observable<Course[]> {
    return Observable.from(this.storage.get('courses')
      .then(courses => {
        if (!courses) courses = [];
        courses.push(course);
        return this.storage.set('courses', courses)
      })
    )
  }

  createCourses(courses_to_add): Observable<any> {
    return Observable.from(this.storage.get('courses')
      .then(courses => {
        if (!courses) courses = [];
        if(courses_to_add && courses_to_add.length > 0){
          courses_to_add.forEach(course => {
            courses.push(course);
          });
        }
        return this.storage.set('courses', courses)
      })
    )
  }

  //
  // ─── READ ───────────────────────────────────────────────────────────────────────
  //

  getCourses(): Observable<Course[]> {
    return Observable.from(this.storage.get('courses'));
  }

  getCourseById(course_id): Observable<Course[]> {
    return Observable.from(this.storage.get('courses')
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
    return Observable.from(this.storage.get('courses')
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
    return Observable.from(this.storage.get('courses')
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

  //
  // ─── HELPER ─────────────────────────────────────────────────────────────────────
  //

  flattenCategories(course, includeGroups?) {
    //flatten the nested categories
    let resultcats: any[] = [];
    if (course.performanceCategories) {
      if(includeGroups) resultcats.push({name: 'Gesamtnote',_id:'total_grading'});
      course.performanceCategories.map((cat) => {
        if (this.isNonEmptyGroup(cat)) {
          if(includeGroups) resultcats.push(cat);
          this.digDeeper(cat, resultcats, includeGroups);
        } else {
          resultcats.push(cat);
        }
      });
    }
    return resultcats;
  }

  
  digDeeper(category, resultcats: any[], includeGroups?) {
    //this function searches the tree of subchildren recursively.
    return category.children.map((subgroup) => {
      //if the child is also a nonempty group, go one level deeper
      if (this.isNonEmptyGroup(subgroup)) {
        if(includeGroups) resultcats.push(subgroup);
        this.digDeeper(subgroup, resultcats)
      } else {
        return resultcats.push(subgroup);
      }
    })
  }

  isNonEmptyGroup(category) {
    return category.children && category.children.length > 0 && category.type == "group"
  }

}