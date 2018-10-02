import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ItemSliding, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { StudentService } from '../../../services/student-service';
import { CourseService } from '../../../services/course.service';

import { COURSES } from '../../../app/mock-data/courses';
import { STUDENTS } from '../../../app/mock-data/students_new';
import { ToastService } from '../../../services/toast.service';

import { File } from '@ionic-native/file';
import { SettingsService } from '../../../services/settings.service';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { Settings } from '../../../app/models/settings';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})

export class SettingsPage {
  firstname;
  lastname;
  courses;
  students;
  env;
  show_desktop_features: boolean = false;
  show_android_features: boolean = true;
  set_custom_mark_string: boolean = false;

  settings = new Settings;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public toastService: ToastService,
    public studentService: StudentService,
    public courseService: CourseService,
    public settingsService: SettingsService,
    public file: File,
    private fileChooser: FileChooser,
    public filePath: FilePath,
    public alertCtrl: AlertController, ) {

  }

  ionViewWillEnter() {
    this.settingsService.getAllSettings().subscribe((s) => this.settings = s);
    this.courseService.getCourses().subscribe(data => this.courses = data);
    this.studentService.getStudents().subscribe(data => this.students = data);
    this.listDir();

  }

  updateSetting(set_value, key) {
    this.settingsService.updateSetting(key, set_value).subscribe(s => this.settings = s)
  }

  closeSlidingItem(slidingItem: ItemSliding) {
    slidingItem.close();
  }

  getSetting() {
    this.settingsService.getSetting('GRADE_CALCULATION_FEATURE').subscribe((s) => {
      console.log(s);
    })
  }

  setSetting() {
    this.settingsService.updateSetting('ENVIRONMENT_IS_DEV', true).subscribe(() => {
      console.log('ok');
    })
  }

  getAllSettings() {
    this.settingsService.getAllSettings().subscribe((s) => console.log(s))
  }

  //
  // ────────────────────────────────────────────────────────────────────── I ───────
  //   :::::: C O M M O N   F E A T U R E S : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────────────────────
  //

  checkMarkString() {
    //TODO: fix type-error by using proper class definition
    let mark_string = this.settings.MARK_STRING ? this.settings.MARK_STRING : "";
    let array = mark_string.split("|")
    let resultstring = "";
    for (let mark_range of array) {
      let sub = mark_range.split(",")
      resultstring += "<pre>" + Number(sub[0]) + " &le; x < " + Number(sub[1]) + " : " + sub[2] + "<br></pre>"
    }
    let alert = this.alertCtrl.create({
      title: 'Notendefinition:',
      subTitle: resultstring,
      buttons: ['Verstanden']
    });
    alert.present();
  }

  addMockData() {
    this.storage.set('courses', COURSES).then(() => {
      this.courses = COURSES;
    }).then(() => {
      this.storage.set('students', STUDENTS).then(() => {
        this.students = STUDENTS;
      });
    }).then(() => this.toastService.showToast('Testdaten erfolgreich hinzugefügt')
    ).catch(() => this.toastService.showToast('Fehler beim Hinzufügen der Testdaten'))
  }

  removeCourses() {
    this.courseService.removeCourses().then(res => this.toastService.showToast('Löschen erfolgreich'))
  }

  removeStudents() {
    this.studentService.removeStudents().then(res => this.toastService.showToast('Löschen erfolgreich'))
  }

  gatherBackupData(): Promise<any> {
    let backupData;
    return new Promise(resolve => {
      this.courseService.getCourses().subscribe(courses => {
        this.studentService.getStudents().subscribe(students => {
          backupData = {
            meta: { date: new Date().toLocaleDateString('de-DE'), time: new Date().toLocaleTimeString('de-DE') },
            students: students,
            courses: courses,
          }
          resolve(backupData);
        });
      });
    })
  }

  restoreFromBackup(parsed_data) {
    return new Promise(resolve => {
      this.studentService.removeStudents().then(() => {
        this.courseService.removeCourses().then(() => {
          this.students = parsed_data.students;
          this.courses = parsed_data.courses;
          this.studentService.addStudents(parsed_data.students).subscribe(() => {
            this.courseService.createCourses(parsed_data.courses).subscribe(() => {
              resolve();
            })
          })
        }).catch((err) => {
          this.toastService.showToast(JSON.stringify(err));
        });
      }).catch((err) => {
        this.toastService.showToast(JSON.stringify(err));
      });
    })
  }


  handleError(err) {
    this.toastService.showToast(JSON.stringify(err));
  }

  //
  // ──────────────────────────────────────────────────────────────────────── II ──────────
  //   :::::: A N D R O I D   F E A T U R E S : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────────
  //

  editFileName(file) {
    let backup_data;
    this.getBackupDataFromFileOnAndroid(file).then((data => {
      backup_data = data;
      let backup_data_courses_length = backup_data.courses ? backup_data.courses.length : 0;
      let backup_data_students_length = backup_data.students ? backup_data.students.length : 0;
      let prompt = this.alertCtrl.create({
        title: 'Details',
        message: "Datum: " + backup_data.meta.date + "<br>Uhrzeit: " + backup_data.meta.time + "<br>Kurse: " + backup_data_courses_length + "<br>Studenten: " + backup_data_students_length,
        inputs: [
          {
            name: 'new_filename',
            placeholder: file.name
          },
        ],
        buttons: [
          {
            text: 'Abbrechen',
            handler: data => {
            }
          },
          {
            text: 'Speichern',
            handler: data => {
              if (data.new_filename && data.new_filename != '') this.file.copyFile(this.file.externalRootDirectory, 'StudentMgmt/' + file.name, this.file.externalRootDirectory, 'StudentMgmt/' + data.new_filename).then(() => {
                this.deleteBackupFileOnAndroid(file);
                this.listDir()
              });
            }
          }
        ]
      });
      prompt.present();
    }));
  }

  openFileChooser() {
    this.fileChooser.open()
      .then(uri => {
        this.filePath.resolveNativePath(uri).then((x) => {
          this.file.resolveLocalFilesystemUrl(x).then((file) => {
            this.presentRestoreFromBackupOnAndroidConfirm(file);
          });
        })
      })
      .catch(e => {
        this.toastService.showToast('Filechooser konnte nicht geöffnet werden');
      });
  }

  presentRestoreFromBackupOnAndroidConfirm(file) {
    let message = (this.settings && !this.settings.AUTOBACKUP_ON_RESTORE) ? 'Backup "' + file.name + '" wiederherstellen?<br><br><strong>ACHTUNG</strong>: Dadurch werden alle derzeitigen Daten gelöscht!' : 'Backup "' + file.name + '" wiederherstellen? Es wird ein automatisches Backup der derzeitigen Daten angelegt.'
    let alert = this.alertCtrl.create({
      title: 'Bestätigen',
      message: message,
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
            this.restoreBackupFromFileOnAndroid(file);
          }
        }
      ]
    });
    alert.present();
  }

  restoreBackupFromFileOnAndroid(file) {
    // Repetitive code. How to avoid this here?
    if (this.settings && this.settings.AUTOBACKUP_ON_RESTORE == true) {
      this.makeBackup().then(() => {
        this.getBackupDataFromFileOnAndroid(file).then((parsed_data) => {
          this.restoreFromBackup(parsed_data).then(() => {
            this.toastService.showToast('Backup erfolgreich wiederhergestellt');
          }).catch((err) => {
            this.toastService.showToast("Fehler beim Wiederherstellen");
          });
        }).catch((err) => {
          this.toastService.showToast("Fehler beim Wiederherstellen");
        });
      }).catch((err) => this.handleError(err));
    } else {
      this.getBackupDataFromFileOnAndroid(file).then((parsed_data) => {
        this.restoreFromBackup(parsed_data).then(() => {
          this.toastService.showToast('Backup erfolgreich wiederhergestellt');
        }).catch((err) => {
          this.toastService.showToast("Fehler beim Wiederherstellen");
        });
      }).catch((err) => {
        this.toastService.showToast("Fehler beim Wiederherstellen");
      });
    }
  }

  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //


  makeBackup() {
    return new Promise((resolve, reject) => {
      this.gatherBackupData().then(backupData => {
        let json_string: string = JSON.stringify(backupData);
        let time = new Date().toJSON().slice(0, 10);
        let filename: string = 'StudentMgmt/' + time + '-' + Math.round(new Date().getTime() / 1000).toString().substr(-6);// + '.stmb' removed
        this.checkDir().then(() => {
          this.file.writeFile(this.file.externalRootDirectory, filename, json_string).then(() => {
            this.listDir();
            this.toastService.showToast('Backup erfolgreich angelegt');
            resolve();
          }).catch(err => {
            this.toastService.showToast('Fehler beim Anlegen des Backups');
            reject(err);
          });
        }).catch((err) => {
          if (err.code == 1) {
            this.createDir().then(() => {
              this.makeBackup().then(() => {
                resolve();
              }).catch(err => reject(err))
            }).catch(err => reject(err))
          } else {
            this.toastService.showToast('Fehler beim Anlegen des Ordners für Backups');
            reject(err);
          }
        });
      });
    })
  }

  //
  // ─── READ ───────────────────────────────────────────────────────────────────────
  //

  getBackupDataFromFileOnAndroid(file) {
    return new Promise(
      (resolve, reject) => {
        this.file.readAsText(this.file.externalRootDirectory, 'StudentMgmt/' + file.name).then((res) => {
          let parsed_data = JSON.parse(res);
          //just a ridiculous check, but I needed like to use older data for testing. So I dont introduce a more complex check.
          if (!parsed_data || !parsed_data.meta) reject("wrong file");
          resolve(parsed_data);
        }).catch((err) => {
          reject(err);
        });
      });
  }

  //
  // ─── UPDATE ─────────────────────────────────────────────────────────────────────
  //


  //
  // ─── DELETE ──────────────────────────────────────────────────────
  //

  presentDeleteBackupOnAndroidConfirm(file) {
    let alert = this.alertCtrl.create({
      title: 'Löschen?',
      message: 'Soll das Backup "' + file.name + '" gelöscht werden?',
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
            this.deleteBackupFileOnAndroid(file).then(() => {
              this.toastService.showToast('Löschen erfolgreich');
            })
          }
        }
      ]
    });
    alert.present();
  }

  deleteBackupFileOnAndroid(file) {
    return new Promise((resolve, reject) => {
      this.file.removeFile(this.file.externalRootDirectory + '/StudentMgmt', file.name)
        .then(() => {
          this.listDir();
          resolve()
        }).catch(err => reject(err));
    })
  }

  deleteDirManually() {
    this.file.removeRecursively(this.file.externalRootDirectory, 'StudentMgmt').then(() => {
      this.toastService.showToast('Löschen erfolgreich');
    }).catch((err) => {
      this.toastService.showToast(err.message);
    });
    this.filesInDir = [];
  }

  //
  // ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────────
  //

  filesInDir;
  listDir() {
    this.file.listDir(this.file.externalRootDirectory, 'StudentMgmt').then((res) => {
      this.filesInDir = res;
    }).catch((err) => {
      this.toastService.showToast('Backupverzeichnis nicht gefunden');
    });
  }

  checkDir() {
    return this.file.checkDir(this.file.externalRootDirectory, 'StudentMgmt')
  }
  createDir() {
    return this.file.createDir(this.file.externalRootDirectory, 'StudentMgmt', true)
  }

  checkDirManually() {
    this.file.checkDir(this.file.externalRootDirectory, 'StudentMgmt').then((res) => {
      this.toastService.showToast('Directory exists')
    }).catch((err) => {
      this.toastService.showToast(err.message);
    });
  }

  createDirManually() {
    this.file.createDir(this.file.externalRootDirectory, 'StudentMgmt', true).then((res) => {
      this.toastService.showToast('Directory successfully created')
    }).catch((err) => {
      this.toastService.showToast(err.message);
    });
  }

  //
  // ──────────────────────────────────────────────────────────────────────── III ──────────
  //   :::::: B R O W S E R   F E A T U R E S : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────────
  // 

  onAction(ev) {
    return this.restoreBackupFromFileOnBrowser(ev);
  }

  restoreBackupFromFileOnBrowser(ev) {
    // action: (src: https://github.com/bergben/ng2-file-input)
    // Removed=0,
    // Added= 1,
    // InvalidDenied = 2,
    // CouldNotRemove = 3,
    // CouldNotAdd = 4,
    return new Promise(resolve => {
      if (ev.action == 1) {
        var reader = new FileReader();
        var me = this;
        reader.onload = function (ev) {
          if (reader.result) {
            try {
              let imported_data = JSON.parse(reader.result);
              me.restoreFromBackup(imported_data).then(() => {
                me.toastService.showToast('Backup erfolgreich wiederhergestellt');
              })
            } catch (err) {
              me.toastService.showToast('Fehler beim Lesen der Datei');
            }
          }
        }
        reader.readAsText(ev.currentFiles[0]);
      }
    })
  }

  downloadDataOnBrowser() {
    this.gatherBackupData().then(backupData => {
      let data = backupData;
      let json_string = JSON.stringify(data);
      var blob = new Blob([json_string]);
      var a = window.document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      let time = new Date().toJSON().slice(0, 10);
      a.download = time + '-' + Math.round(new Date().getTime() / 1000).toString().substr(-6);// + '.stmb' removed
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }


}
