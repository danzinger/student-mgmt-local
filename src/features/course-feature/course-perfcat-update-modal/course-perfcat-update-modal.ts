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
    this.parent_id = navParams.get('parent_id');
    this.child = navParams.get('child');

    //let category_type = 'incremental' ? this.performanceCategory.percentage_points_per_unit != false : 'max_and_weight';
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

  cancel() {
    this.viewCtrl.dismiss();
  }

  done() {

    if (this.performanceCategory.type == 'max_and_weight') {
      delete this.performanceCategory.percentage_points_per_unit;
    }
    if (this.subgroup.type == 'incremental') {
      delete this.performanceCategory.point_maximum;
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
    //Autocalculate weight of other categories on same level, if weight of one category is changed manually
    //currently only works with top-level categories and only when updating a category not when creating one.
    //HOwever, this feature weems unneccessary. It might be much better to let the user enter a percentage Value for each category.
    if (this.weight_changed) {
      let cats = [];
      for (let category of this.course.performanceCategories) {
        if (category._id != this.performanceCategory._id) {
          cats.push(Number(category.category_weight));
        }
      }
      for (let category of this.course.performanceCategories) {
        if (category._id != this.performanceCategory._id) {
          category.category_weight = (1 - this.performanceCategory.category_weight) / cats.length
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
            if(this.distribute_others_equally) this.autoWeight();
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
