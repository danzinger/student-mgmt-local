import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ViewController } from 'ionic-angular';
import { PapaParseService } from 'ngx-papaparse';
import { MongoIdService } from '../../../services/mongo-id.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { StudentService } from '../../../services/student-service';
import { CourseService } from '../../../services/course.service';

/**
 * Generated class for the StudentAddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-student-add',
  templateUrl: 'student-add.html',
})
export class StudentAddPage {

  private form: FormGroup;
  isReadyToSave: boolean;
  students;
  control_data;
  addMany;
  constructor(
    public navCtrl: NavController,
    public viewCtrl:ViewController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    private papa: PapaParseService,
    private formBuilder: FormBuilder,
    public mongoIdService: MongoIdService,
    public studentService: StudentService,
    public courseService: CourseService, ) {

    this.form = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['']
    })
    // Watch the form for changes
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
    this.control_data = this.navParams.get('control_data')

  }

  onAction(ev) {
    let me = this;
    let file = ev.currentFiles[0]
    this.papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function (results) {
        //alert('ok'+results.data.length);
        results.data.forEach(student => {
          student._id = me.mongoIdService.newObjectId();
          student.gradings = [];
          student.notes = [];
          student.course_registrations = [];
          if (me.control_data && me.control_data.registerForCourse) student.course_registrations.push(me.control_data.course._id);
          student.computed_gradings = [];
        });
        me.presentAddStudentsConfirm(results.data, results.data.length + ' Studenten hinzufügen?')

      }
    })
  }


  addStudent(student) {
    student._id = this.mongoIdService.newObjectId();
    student.gradings = [];
    student.notes = [];
    student.course_registrations = [];
    if (this.control_data && this.control_data.registerForCourse) student.course_registrations.push(this.control_data.course._id);
    student.computed_gradings = [];
    let student_new = [];
    student_new.push(student);
    this.presentAddStudentsConfirm(student_new, student.firstname + ' ' + student.lastname + ' hinzufügen?');
  }

courses;
  presentAddStudentsConfirm(students, message) {
    this.students = students;
    let alert = this.alertCtrl.create({
      title: 'Bestätigen',
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Ok',
          handler: () => {
            //TODO: Check if the csv File is in valid Format
            
            //if the students are added from within the course-detail view of a course they get registered for the course (their _id is added to the participants array of the course) also:
            if (this.control_data && this.control_data.course) {
              students.forEach(student => {
                this.control_data.course.participants.push(student._id);
              });
              this.courseService.updateCourse(this.control_data.course).subscribe(courses=>{
                this.courses = courses;
              });
            }
            //in any case the students are created and the view gets dismissed
            this.studentService.addStudents(this.students).subscribe(
              data => this.viewCtrl.dismiss({
                students:data,
                //course:this.control_data.course,
                //courses:this.courses
              }),
              error => { throw new Error(error) }
            );

          }
        }
      ]
    });
    alert.present();
  }



}
