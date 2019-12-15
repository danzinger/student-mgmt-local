import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

//import { Student } from '../app/models/student';
//import { COURSES } from '../app/mock-data/courses';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
//import 'rxjs/add/observable/fromPromise';
//import { fromPromise } from 'rxjs/observable/fromPromise';
import { Course } from '../app/models/course';
import { StudentService } from './student-service';

@Injectable()
export class CourseService {
  constructor(
    private storage: Storage,
    private studentService: StudentService) {
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
        if (courses_to_add && courses_to_add.length > 0) {
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

  getCourseById(course_id): Observable<Course> {
    return Observable.from(this.storage.get('courses')
      .then(courses => {
        if (courses) {
          return courses.find(course => {
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

  unregisterStudentFromAllCourses(student_to_delete_id) {
    return Observable.from(this.storage.get('courses'))
      .map(courses => {
        courses.forEach(course => {
          let index = course.participants.indexOf(student_to_delete_id);
          if (index > -1) course.participants.splice(index, 1)
        })
        return courses;
      })
      .map(courses => {
        this.storage.set('courses',courses)
      })
  }

  //
  // ─── DELETE ─────────────────────────────────────────────────────────────────────
  //

  deleteCourse(course_to_delete): Observable<Course[]> {
    return Observable.from(
      this.storage.get('courses')
        .then(courses => {
          if (course_to_delete.participants.length > 0) this.studentService.unregisterAllStudentsFromCourse(course_to_delete._id);
          return courses.filter(course => {
            return course._id != course_to_delete._id
          })
        })
        .then(courses => {
          return this.storage.set('courses', courses)
        }
        )
    );
  }

  removeCourses(): Promise<any> {
    return this.storage.remove('courses');
  }

  deletePerformanceCategory(category, parent, child, isTopLevel, course) {
    let deletion_array = this.initializeDeletionArray(child);
    this.studentService.deleteAllGradingsInPerfcatsFromAllStudents(deletion_array)
    // if it is a top-level-category, the whole course gets updated
    if (isTopLevel) {
      let index = course.performanceCategories.indexOf(category);
      if (index > -1) course.performanceCategories.splice(index, 1);
      //if it is not a top level category, the performanceCategories array of the course must be updated
    } else {
      let index = parent.children.indexOf(child);
      if (index > -1) parent.children.splice(index, 1);
    }
    //in any case, we update the course (with the new performance categories)
    return this.updateCourse(course)
  }
  //
  // ─── HELPER ─────────────────────────────────────────────────────────────────────
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

  flattenCategories(course, includeGroups?) {
    //flatten the nested categories
    let resultcats: any[] = [];
    if (course.performanceCategories) {
      if (includeGroups) resultcats.push({ name: 'Gesamtnote', _id: 'total_grading' });
      course.performanceCategories.map((cat) => {
        if (this.isNonEmptyGroup(cat)) {
          if (includeGroups) resultcats.push(cat);
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
        if (includeGroups) resultcats.push(subgroup);
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