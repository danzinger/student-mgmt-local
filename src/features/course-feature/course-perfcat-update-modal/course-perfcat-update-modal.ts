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
    if(this.child) this.performanceCategory = this.child;
    //this.performanceCategory = this.child ? this.child : this.performanceCategory;

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

  ionViewDidEnter(){
    console.log(this.number_of_parents);
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  done() {

    if (this.performanceCategory.type == 'max_and_weight') {
      delete this.performanceCategory.percentage_points_per_unit;
    }
    if (this.subgroup.type == 'incremental') {
      delete this.performanceCategory.point_maximum;
      //this was needed for the grade-calculation to work. 
      this.subgroup.category_weight = 1;
    }
    this.subgroup._id = this.mongoIdService.newObjectId();
    this.subgroup.children = [];
    if (this.addToGroup) {
      if (this.child) {
        this.subgroup.parent_id = this.child._id;
        this.child.children.push(this.subgroup);
      } else {
        this.subgroup.parent_id = this.performanceCategory._id;
        this.performanceCategory.children.push(this.subgroup);
      }
    }
    this.presentConfirm();
  }

  clearInitialSelection() {
    this.performanceCategory.point_maximum = '';
    this.performanceCategory.percentage_points_per_unit = '';
  }

  weigthChange(ev) {
    this.weight_changed = true;
  }

  autoWeight() {
    //Equally distribute weight of other categories on same level if weight of one category is changed manually

    //the following definitions are valid if we EDIT a toplevel-category or a child
    let group_to_autoweight = this.parent ? this.parent.children : this.course.performanceCategories;
    let edited_category = this.child ? this.child : this.performanceCategory;
    //or - because it is now unneccesary to distinguish between a child or a category - we can just put:
    // let edited_category = this.performanceCategory;
    //or now just use this.performanceCategory directly in the function


    //if we ADD a subgroup to a parent things are slightly different
    if(this.addToGroup) {
      edited_category = this.subgroup;
    }

    // let precisionRound = function (number, precision) {
    //   var factor = Math.pow(10, precision);
    //   return Math.round(number * factor) / factor;
    // }

    if (this.weight_changed || this.addToGroup) {
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

}
