import { Injectable } from '@angular/core';

//import { Observable } from 'rxjs/Observable';
//import 'rxjs/add/observable/from';

@Injectable()
export class GradeCalculationService {
  constructor() {
  }

  calculateGrade(performanceCategories, computed_gradings, settings, partialGradingForGroup?, show_colon?) {

    /*
    This Function computes the overall grade and the partial gradings for a student.
    If a subgroup is passed, a partial grading will be returned and if not, the overall grade is computed.
    The functions iterates over the performance_categories of the course, or a subgroup of these (to compute a partial grading).
    For each category, the corresponding weight is computed and some information is stored (slightly different "max_and_weight" or "incremental" grading types)
    We obtain a datastructure like this:
    {
    PERFORMANCE-CATEGORY-1-ID : [WEIGHT, TYPE, POINT-MAXIMUM, PERFENTAGE-PPU]
    PERFORMANCE-CATEGORY-2-ID : [WEIGHT, TYPE, POINT-MAXIMUM, PERFENTAGE-PPU]
    PERFORMANCE-CATEGORY-3-ID : [WEIGHT, TYPE, POINT-MAXIMUM, PERFENTAGE-PPU]
    ...
    }
    Then it is easily possible to compute the final/partial grade.
    */

    let returnvalue;
    let table = {};
    let submarks = [];
    let grade = 0;
    let group = partialGradingForGroup ? partialGradingForGroup : performanceCategories;

    //first the table is generated:
    if (group.length > 0) group.map((toplevel_category) => {
      table[toplevel_category._id] = [Number(toplevel_category.category_weight), toplevel_category.type, toplevel_category.point_maximum, toplevel_category.percentage_points_per_unit]
      if (this.categoryHasChildren(toplevel_category)) {
        toplevel_category.children.map((first_level_child) => {
          table[first_level_child._id] = [Number(toplevel_category.category_weight * first_level_child.category_weight), first_level_child.type, first_level_child.point_maximum, first_level_child.percentage_points_per_unit]
          if (this.categoryHasChildren(first_level_child)) {
            first_level_child.children.map((second_level_child) => {
              table[second_level_child._id] = [Number(toplevel_category.category_weight * first_level_child.category_weight * second_level_child.category_weight), second_level_child.type, second_level_child.point_maximum, second_level_child.percentage_points_per_unit]
              if (this.categoryHasChildren(second_level_child)) {
                second_level_child.children.map((third_level_child) => {
                  table[third_level_child._id] = [Number(toplevel_category.category_weight * first_level_child.category_weight * second_level_child.category_weight * third_level_child.category_weight), third_level_child.type, third_level_child.point_maximum, third_level_child.percentage_points_per_unit]
                })
              }
            })
          }
        })
      }
    })

    //then the grade is computed
    computed_gradings.map((grading) => {
      if (table[grading.category_id] && table[grading.category_id][1] == "max_and_weight") {
        submarks.push(table[grading.category_id][0] * (grading.total_points / table[grading.category_id][2]))
      }
      if (table[grading.category_id] && table[grading.category_id][1] == "incremental") {
        submarks.push(table[grading.category_id][0] * grading.total_points * table[grading.category_id][3])
      }
    })
    grade = (submarks.length > 0) ? submarks.reduce((a, b) => { return a + b; }) : 0;

    let grade_object = {
      grade: 0,
      mark: 0
    }
    grade_object.grade = this.precisionRound(grade * 100, 2);
    grade_object.mark = this.getMarkFromPercentage(grade, settings);

    //this is pure lazyness. show_colon is only used in the student-detail-view to have a colon after the category-name
    if (show_colon) {
      if (settings && settings.SHOW_MARK) {
        returnvalue = (settings && settings.SHOW_PERCENT_SIGN) ? ": " + grade_object.grade + ' % ' + '(' + grade_object.mark + ')' : ": " + grade_object.grade + ' ' + '(' + grade_object.mark + ')';
      } else {
        returnvalue = (settings && settings.SHOW_PERCENT_SIGN) ? ": " + grade_object.grade + ' %' : ": " + grade_object.grade;
      }
    } else {
      if (settings && settings.SHOW_MARK) {
        returnvalue = (settings && settings.SHOW_PERCENT_SIGN) ? grade_object.grade + ' % ' + '(' + grade_object.mark + ')' : + grade_object.grade + ' ' + '(' + grade_object.mark + ')';
      } else {
        returnvalue = (settings && settings.SHOW_PERCENT_SIGN) ? grade_object.grade + ' %' : + grade_object.grade;
      }

    }
    return returnvalue
  }

  //
  // ─── HELPER FUNCTIONS ────────────────────────────────────────────
  //

  getMarkFromPercentage(percentage_value, settings) {
    let mark;
    let mark_string = settings.MARK_STRING;
    let array = mark_string.split("|")
    for (let mark_range of array) {
      let sub = mark_range.split(",")
      if (percentage_value >= Number(sub[0]) && percentage_value < Number(sub[1])) {
        mark = sub[2];
      }
    }
    return mark;
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  categoryHasChildren(category) {
    return category.children && category.children.length > 0 && category.type == "group"
  }


}