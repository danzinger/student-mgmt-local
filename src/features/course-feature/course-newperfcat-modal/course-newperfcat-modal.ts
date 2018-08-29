import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { CourseService } from '../../../services/course.service';
import { ToastService } from '../../../services/toast.service';
import { MongoIdService } from '../../../services/mongo-id.service';
import { SettingsService } from '../../../services/settings.service';


@IonicPage()
@Component({
  selector: 'page-course-newperfcat-modal',
  templateUrl: 'course-newperfcat-modal.html',
})
export class CourseNewperfcatModalPage {
  course;
  form_max_and_weight: FormGroup;
  form_incremental: FormGroup;
  form_group: FormGroup;
  isReadyToSave: boolean = false;
  type;
  weight_changed = false;
  distribute_others_equally = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public formBuilder: FormBuilder,
    public toastService: ToastService,
    public courseService: CourseService,
    public mongoIdService: MongoIdService,
    public settingsService: SettingsService
  ) {

    //if (this.settingsService.ENVIRONMENT_IS_DEV) {
    // Könnte man so automatisch ausfüllen:
    // this.form_max_and_weight = formBuilder.group({
    //   _id: [''],
    //   name: ['Testkategorie', Validators.required],
    //   description: ['Testbeschreibung'],
    //   point_maximum: ['100', [Validators.required, Validators.min(0)]],
    //   category_weight: ['0.5', [Validators.required, Validators.min(0), Validators.max(1)]],
    //   type: [''],
    // });
    //}

    this.form_max_and_weight = formBuilder.group({
      _id: [''],
      name: ['', Validators.required],
      description: [''],
      point_maximum: ['', [Validators.required, Validators.min(0)]],
      category_weight: ['', [Validators.required, Validators.min(0), Validators.max(1)]],
      type: [''],
    });

    this.form_incremental = formBuilder.group({
      _id: [''],
      name: ['', Validators.required],
      description: [''],
      type: [''],
      percentage_points_per_unit: ['', [Validators.required, Validators.min(0), Validators.max(1)]]
    });

    this.form_group = formBuilder.group({
      _id: [''],
      name: ['', Validators.required],
      description: [''],
      category_weight: ['', [Validators.required, Validators.min(0), Validators.max(1)]],
      type: [''],
    });

    this.course = navParams.get('course');

  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  autoWeight(created_category) {
    //Equally distribute weight of other categories on same level if weight of one category is changed manually
    let group_to_autoweight = this.course.performanceCategories;

    let cats = [];
    for (let category of group_to_autoweight) {
      if (category._id != created_category._id && category.type != 'incremental') {
        cats.push(Number(category.category_weight));
      }
    }
    for (let category of group_to_autoweight) {
      if (category._id != created_category._id && category.type != 'incremental') {
        category.category_weight = (1 - created_category.category_weight) / cats.length;
        if (category.category_weight < 0) category.category_weight = 0;
      }
    }
  }

  form;
  done() {

    if (this.type == "max_and_weight") {
      this.form = this.form_max_and_weight

    }
    if (this.type == "incremental") {
      this.form = this.form_incremental
      delete this.form.point_maximum

    }
    if (this.type == "group") {
      this.form = this.form_group
      delete this.form.percentage_points_per_unit
      delete this.form.point_maximum
    }

    //Convert the input-values to the correct type and prepare data for saving
    this.form.value.point_maximum = this.form.value.point_maximum ? Number(this.form.value.point_maximum) : null;
    this.form.value.category_weight = this.form.value.category_weight ? Number(this.form.value.category_weight) : null;
    this.form.value.percentage_points_per_unit = this.form.value.percentage_points_per_unit ? Number(this.form.value.percentage_points_per_unit) : null;

    this.form.value._id = this.mongoIdService.newObjectId();
    this.form.value.type = this.type;
    if (this.form.value.type != 'incremental') this.autoWeight(this.form.value);

    if (this.form.value.type == "max_and_weight") {
      delete this.form.value.percentage_points_per_unit
    }
    if (this.form.value.type == "incremental") {
      delete this.form.value.point_maximum
      //this was needed for the grade-calculation to work. 
      this.form.value.category_weight = 1;
    }
    if (this.form.value.type == "group") {
      delete this.form.value.percentage_points_per_unit
      delete this.form.value.point_maximum
      this.form.value.children = [];
    }

    if (!this.course.performanceCategories) this.course.performanceCategories = [];
    this.course.performanceCategories.push(this.form.value);
    
    this.courseService.updateCourse(this.course).subscribe(
      data => {
        this.toastService.showToast('Kategorie hinzugefügt');
        this.viewCtrl.dismiss(this.course);
      },
      error => {
        this.toastService.showToast('Fehler beim Anlegen');
      });
  }

}
