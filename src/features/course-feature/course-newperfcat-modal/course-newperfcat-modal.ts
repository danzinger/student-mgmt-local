import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormGroup, FormBuilder } from '@angular/forms';

import { CourseService } from '../../../services/course.service';
import { ToastService } from '../../../services/toast.service';
import { MongoIdService } from '../../../services/mongo-id.service';


@IonicPage()
@Component({
  selector: 'page-course-newperfcat-modal',
  templateUrl: 'course-newperfcat-modal.html',
})
export class CourseNewperfcatModalPage {
  course;
  form: FormGroup;
  isReadyToSave: boolean = true;
  //isReadyToSave: boolean;
  type = "incremental";

  ENV = 'dev';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public formBuilder: FormBuilder,
    public toastService: ToastService,
    public courseService: CourseService,
    public mongoIdService:MongoIdService,
   ) {

    this.form = formBuilder.group({
      _id:[''],
      name: ['test'],
      description: ['testdescription'],
      point_maximum: ['100'],
      category_weight: ['0.5'],
      type: [''],
      percentage_points_per_unit: ['0.025']
    });

    this.course = navParams.get('course');
    
    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      //to grey-out the save button when the form is not valid (however, no validators here)
      this.isReadyToSave = this.form.valid;
      //to display the correct input fields based on the selected type
      this.form.value.type = this.type;
      //Convert the input-values to the correct type
      this.form.value.point_maximum = Number(this.form.value.point_maximum);
      this.form.value.category_weight = Number(this.form.value.category_weight);
      this.form.value.percentage_points_per_unit = Number(this.form.value.percentage_points_per_unit);
    });
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  done() {
      this.form.value._id = this.mongoIdService.newObjectId();
      if(!this.course.performanceCategories) this.course.performanceCategories = [];
      this.form.value.type = this.type;
      this.form.value.children = [];
      this.course.performanceCategories.push(this.form.value);
      this.courseService.updateCourse(this.course).subscribe(
        data => {
          this.toastService.showToast('Kategorie hinzugefügt');
          this.viewCtrl.dismiss(this.course);
        },
        error => {
          this.toastService.showToast('Fehler beim Anlegen. Server meldet: ' + error._body);
        });
  }

}
