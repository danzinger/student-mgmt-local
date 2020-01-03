import { Injectable } from '@angular/core';

//import { Observable } from 'rxjs/Observable';
//import 'rxjs/add/observable/from';

@Injectable()
export class GradeCalculationService {
  constructor() {
  }

  calculateGrade(performanceCategories, computed_gradings, settings, partialGradingForGroup?, on_student_detail_view?) {
    if (!settings.GRADE_CALCULATION_FEATURE) return;
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



    // 2020-01-01 v1.0.6 update: 
    // A problem with the grade calculation is that if a student has 0% on an exam this has a very huge mathematical impact in the calculation of the overall grade.
    // Consider the Austrian Grading system with marks 1-5 where with 1-4 student passes and with 5 student fails. Usually a 5 is given when student has less than 50%.
    // It is now possible to define a "minimum" value. An "max_and_weight" exam with 0% will count as "minimum_value". 
    // Each point between "minimum_value" and "threshold_value" increases the mark, but nevertheless a student stays below "threshold_value" if his points on that exam are below the "threshold_value"


    // Problem with this.adjustGrading when there is no computed grading in this category. so in this case add it with 0 points.

    let simplyfied_computed_gradings = {}
    computed_gradings.forEach(grading => {
      simplyfied_computed_gradings[grading.category_id] = grading.total_points;
    });

    Object.keys(table).forEach(id => {
      if (table[id][1] == 'max_and_weight') {
        let total_points = simplyfied_computed_gradings[id] ? simplyfied_computed_gradings[id] : 0;
        submarks.push(table[id][0] * this.adjustPercentage(total_points / table[id][2], settings))
      }
      if (simplyfied_computed_gradings[id] && table[id] && table[id][1] == "incremental") {
        submarks.push(table[id][0] * simplyfied_computed_gradings[id] * table[id][3])
      }
    })

    grade = (submarks.length > 0) ? submarks.reduce((a, b) => { return a + b; }) : 0;

    let grade_object = {
      grade: 0,
      mark: 0
    }
    grade_object.grade = this.precisionRound(grade * 100, 2);
    grade_object.mark = this.getMarkFromPercentage(grade, settings);

    if (on_student_detail_view) {
      //on student detail view a colon ":" is needed between the categories and the grade and the mark is directly returned as a string. This makes things a little easier in the templates.
      returnvalue = (settings && settings.SHOW_MARK) ? `: ${grade_object.grade} (${grade_object.mark})` : `: ${grade_object.grade}`;
    } else {
      returnvalue = grade_object.grade;
    }
    return returnvalue
  }

  //
  // ─── HELPER FUNCTIONS ────────────────────────────────────────────
  //

  adjustPercentage(percentage, settings) {
    //return (0 <= percentage && percentage < 0.5) ? 0.375 + (0.125 / 0.5) * percentage : percentage;
    let minimum_value = Number(settings.MINIMUM_VALUE);
    let threshold_value = Number(settings.THRESHOLD_VALUE);
    return (settings.MINIMUM_THRESHOLD_CALCULATION && 0 <= percentage && percentage < threshold_value) ? minimum_value + ((threshold_value - minimum_value) / threshold_value) * percentage : percentage;
  }

  studentHasGradingInCat(computed_gradings_to_check, cat_id) {
    let computed_gradings_ids = []
    computed_gradings_to_check.forEach(grading => {
      computed_gradings_ids.push(grading.category_id)
    });
    return computed_gradings_ids.includes(cat_id);
  }

  getMarkFromPercentage(percentage_value, settings) {

    let mark;
    let mark_string = settings.MARK_STRING;
    let array = mark_string.split("|")
    for (let mark_range of array) {
      let sub = mark_range.split(",")
      if (Number(percentage_value) >= Number(sub[0]) && percentage_value < Number(sub[1])) {
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