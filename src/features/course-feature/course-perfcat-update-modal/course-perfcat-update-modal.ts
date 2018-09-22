import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { CourseService } from '../../../services/course.service';
import { ToastService } from '../../../services/toast.service';
import { MongoIdService } from '../../../services/mongo-id.service';
import { SettingsService } from '../../../services/settings.service';

@IonicPage()
@Component({
  selector: 'page-course-perfcat-update-modal',
  templateUrl: 'course-perfcat-update-modal.html',
})
export class CoursePerfcatUpdateModalPage {
  performanceCategory;
  category_type;
  addToGroup;
  performanceCategory_toSend;
  course_id;
  number_of_parents;
  subgroup;
  parent_id;
  parent;
  child;
  course;
  form;
  weight_changed = false;
  distribute_others_equally = false;
  topLevelCategory;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public courseService: CourseService,
    public toastService: ToastService,
    public mongoIdService: MongoIdService,
    public settingsService: SettingsService) {

    this.course = this.navParams.get('course');
    this.performanceCategory = navParams.get('category');
    this.addToGroup = navParams.get('addToGroup');
    this.child = navParams.get('child');
    this.number_of_parents = navParams.get('number_of_parents');
    this.parent = navParams.get('parent');
    this.parent_id = this.parent ? this.parent._id : null;
    // next two lines seem very weired. This was done because in older Version, there was a distinction between "edit a toplevel-category" and "edit a child". To avoid repetitive code in the model, this was changed. However, I was too lazy to change the variabled in the model accordingly. So I introduced this weired "hack"
    // unfourtunately, to delete a category which has moved, we need to know which is the corresponding toplevel-category to easily find and delete the category that has been moved.
    this.topLevelCategory = this.performanceCategory;
    if (this.child) this.performanceCategory = this.child;


    this.subgroup = {}
    if (this.settingsService.ENVIRONMENT_IS_DEV) {
      this.subgroup = {
        name: 'Testkategorie',
        description: 'Testbeschreibung der Ersten',
        type: String,
        category_weight: 0.5,
        point_maximum: 100,
        percentage_points_per_unit: 0.025
      };
    }
  }

  //
  // ─── CORE FEATURES ──────────────────────────────────────────────────────────────
  //

  ionViewDidEnter() {
    //To let the user edit the percentage value
    this.performanceCategory.category_weight = this.performanceCategory.category_weight*100;
    this.performanceCategory.percentage_points_per_unit = this.performanceCategory.percentage_points_per_unit*100;
    this.gatherAllGroups();
  }

  cancel() {
    this.viewCtrl.dismiss();
    this.performanceCategory.category_weight = this.performanceCategory.category_weight/100;
    this.performanceCategory.percentage_points_per_unit = this.performanceCategory.percentage_points_per_unit/100;
  }

  done() {
    this.presentConfirm();
  }

  makeDataReady() {
    if (this.subgroup.type == 'max_and_weight') {
      delete this.subgroup.percentage_points_per_unit;
      this.subgroup.category_weight = this.subgroup.category_weight/100;
    }
    if (this.subgroup.type == 'incremental') {
      delete this.subgroup.point_maximum;
      this.subgroup.percentage_points_per_unit = this.subgroup.percentage_points_per_unit/100;
      //this was needed for the grade-calculation to work. 
      this.subgroup.category_weight = 1;
    } if (this.subgroup.type == 'group') {
      this.subgroup.children = [];
      this.subgroup.category_weight = this.subgroup.category_weight/100;
      delete this.subgroup.percentage_points_per_unit;
      delete this.subgroup.point_maximum;
    }

    this.subgroup._id = this.mongoIdService.newObjectId();

    if (this.addToGroup) {
      if (this.child) {
        this.subgroup.parent_id = this.child._id;
        this.child.children.push(this.subgroup);
      } else {
        this.subgroup.parent_id = this.performanceCategory._id;
        this.performanceCategory.children.push(this.subgroup);
      }
    }
  }

  clearInitialSelection() {
    this.performanceCategory.point_maximum = '';
    this.performanceCategory.percentage_points_per_unit = '';
  }


  presentConfirm() {
    let alert = this.alertCtrl.create({
      title: 'Bestätigen',
      message: 'Änderung speichern?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Ok',
          handler: () => {
            this.makeDataReady();
            this.performanceCategory.category_weight = this.performanceCategory.category_weight/100;
            this.performanceCategory.percentage_points_per_unit = this.performanceCategory.percentage_points_per_unit/100;
            if (this.newParent) this.changeParent(this.performanceCategory, this.newParent);
            if (this.distribute_others_equally) this.autoWeight();
            this.courseService.updateCourse(this.course).subscribe(
              data => {
                this.toastService.showToast('Änderung erfolgreich!');
                this.viewCtrl.dismiss(this.weight_changed);
              },
              error => {
                this.toastService.showToast('Fehler beim Speichern. Server meldet: ' + error._body);
              });
          }
        }
      ]
    });
    alert.present();
  }


  //
  // ─── MOVE CATEGORY FEATURE ──────────────────────────────────────────────────────
  //

  newParent;
  groups;
  differentParentSelected = false;
  // TODO: if user moves the category, but want to autoweight, he wants to autoweight two things:
  // first the OLD parent group
  // second the NEW parent group
  gatherAllGroups() {
    this.groups = []
    if (this.parent) this.groups.push({ _id: 0, name: 'Oberste Ebene' });
    // TODO (URGENT): Do not show subcategories of the category!!! One cannot move a parent into one of his children
    if (this.course.performanceCategories.length > 0) this.course.performanceCategories.map((toplevel_category) => {
      if (this.isGroup(toplevel_category) && toplevel_category._id != this.performanceCategory._id) {
        if (this.performanceCategory._id != toplevel_category._id && toplevel_category._id != this.parent_id) {
          this.groups.push({ _id: toplevel_category._id, name: toplevel_category.name });
        }
        toplevel_category.children.map((first_level_child) => {
          if (this.isGroup(first_level_child) && first_level_child._id != this.performanceCategory._id) {
            if (this.performanceCategory._id != first_level_child._id && first_level_child._id != this.parent_id) {
              this.groups.push({ _id: first_level_child._id, name: first_level_child.name });
            }
            first_level_child.children.map((second_level_child) => {
              if (this.isGroup(second_level_child) && second_level_child._id != this.performanceCategory._id) {
                if (this.performanceCategory._id != second_level_child._id && second_level_child._id != this.parent_id) {
                  this.groups.push({ _id: second_level_child._id, name: second_level_child.name });
                }
                second_level_child.children.map((third_level_child) => {
                  if (this.isGroup(third_level_child) && third_level_child._id != this.performanceCategory._id) {
                    if (this.performanceCategory._id != third_level_child._id && third_level_child._id != this.parent_id) {
                      this.groups.push({ _id: third_level_child._id, name: third_level_child.name });
                    }
                  }
                })
              }
            })
          }
        })
      }
    })
  }

  isGroup(category) {
    return category.type && category.type == "group"
  }

  changeParent(category, newParent) {
    if (newParent._id == 0) {
      this.course.performanceCategories.push(category);
      this.deleteCategory(this.topLevelCategory, this.parent, this.performanceCategory);
    } else {
      if (this.course.performanceCategories.length > 0) this.course.performanceCategories.map((toplevel_category) => {
        if (this.isGroup(toplevel_category)) {
          if (toplevel_category._id == newParent._id) {
            toplevel_category.children.push(category)
            this.deleteCategory(this.topLevelCategory, this.parent, this.performanceCategory);
          } else {
            toplevel_category.children.map((first_level_child) => {
              if (this.isGroup(first_level_child)) {
                if (first_level_child._id == newParent._id) {
                  first_level_child.children.push(category)
                  this.deleteCategory(this.topLevelCategory, this.parent, this.performanceCategory);
                } else {
                  first_level_child.children.map((second_level_child) => {
                    if (this.isGroup(second_level_child)) {
                      if (second_level_child._id == newParent._id) {
                        second_level_child.children.push(category)
                        this.deleteCategory(this.topLevelCategory, this.parent, this.performanceCategory);
                      }
                    }
                  })
                }
              }
            })
          }
        }
      })
    }
  }

  deleteCategory(category, parent, child) {
    let isTopLevel;
    if (!this.parent) isTopLevel = true;
    if (isTopLevel) {
      let index = this.course.performanceCategories.indexOf(category);
      if (index > -1) this.course.performanceCategories.splice(index, 1);
      //if it is not a top level category, the performanceCategories array of the course must be updated
    } else {
      let index = parent.children.indexOf(child);
      if (index > -1) parent.children.splice(index, 1);
    }
  }

  //
  // ─── AUTOWEIGHT FEATURE ─────────────────────────────────────────────────────────
  //

  // weigthChange(ev) {
  //   this.weight_changed = true;
  // }

  autoWeight() {
    //Equally distribute weight of other categories on same level if weight of one category is changed manually

    //the following definitions are valid if we EDIT a toplevel-category or a child
    let group_to_autoweight = this.parent ? this.parent.children : this.course.performanceCategories;
    let edited_category = this.child ? this.child : this.performanceCategory;
    //or - because it is now unneccesary to distinguish between a child or a category - we can just put:
    // let edited_category = this.performanceCategory;
    //or now just use this.performanceCategory directly in the function


    //if we ADD a subgroup to a parent things are slightly different
    if (this.addToGroup) {
      edited_category = this.subgroup;
    }

    let cats = [];
    for (let category of group_to_autoweight) {
      if (category._id != edited_category._id && category.type != 'incremental') {
        cats.push(Number(category.category_weight));
      }
    }
    for (let category of group_to_autoweight) {
      if (category._id != edited_category._id && category.type != 'incremental') {
        category.category_weight = (1 - edited_category.category_weight) / cats.length;
        if (category.category_weight < 0) category.category_weight = 0;
      }
    }
  }




}
