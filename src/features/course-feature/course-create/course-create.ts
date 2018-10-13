import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { CourseService } from '../../../services/course.service';
import { MongoIdService } from '../../../services/mongo-id.service';
import { ToastService } from '../../../services/toast.service';

/**
 * Generated class for the CourseCreatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-course-create',
  templateUrl: 'course-create.html',
})
export class CourseCreatePage {

  private form: FormGroup
  isReadyToSave: boolean
  course

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private formBuilder: FormBuilder,
    public courseService: CourseService,
    public mongoIdService: MongoIdService,
    public toastService: ToastService, ) {

    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      institution: ['', Validators.required]
    })
    // Watch the form for changes
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid
    });
  }

  cancel() {
    this.viewCtrl.dismiss()
  }

  done() {
    if (!this.form.valid) { return }
    let course = this.form.value
    course._id = this.mongoIdService.newObjectId()
    course.participants = []
    course.notes = []
    course.performanceCategories = [];
    this.createCourse(course)
  }

  createCourse(course) {
    this.courseService.createCourse(course).subscribe(
      data => {
        this.toastService.showToast('Kurs erfolgreich erstellt')
        this.viewCtrl.dismiss(data)
      },
      error => {
        this.toastService.showToast('Fehler beim Erstellen')
        this.viewCtrl.dismiss()
      })
  }

}
