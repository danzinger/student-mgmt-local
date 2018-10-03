import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';

@Injectable()
export class SettingsService {
  constructor(private storage: Storage) {
  }
  
  SETTINGS_KEY = '_settings';

  default_settings = {
    ENVIRONMENT_IS_DEV: false,
    AUTOBACKUP_ON_RESTORE: true,
    GRADE_CALCULATION_FEATURE: false,
    SHOW_PERCENT_SIGN: false,
    SHOW_MARK: false,
    TEST_FEATURES: false,
    MARK_STRING: "-9999,0.5000,5|0.5000,0.5416,4-|0.5416,0.5833,4|0.5833,0.6250,4+|0.6250,0.6666,3-|0.6666,0.7083,3|0.7083,0.7500,3+|0.7500,0.7916,2-|0.7916,0.8333,2|0.8333,0.8750,2+|0.8750,9999,1"
  };

  //
  // ─── CREATE ─────────────────────────────────────────────────────────────────────
  //


  //
  // ─── READ ───────────────────────────────────────────────────────────────────────
  //

  getAllSettings() {
    return Observable.from(
      this.storage.get(this.SETTINGS_KEY).then((s) => {
        return s ? s : this.default_settings;
      }))
  }

  getSetting(key): Observable<any> {
    return Observable.from(this.storage.get(this.SETTINGS_KEY).then((settings) => {
      return (settings && settings[key] != undefined) ? settings[key] : this.returnStandards(key);
    }))
  }

  //
  // ─── UPDATE ───────────────────────────────────────────────────────────────────────
  //

  updateSetting(key, value): Observable<any> {
    return Observable.from(this.storage.get(this.SETTINGS_KEY)
      .then(settings => {
        if (!settings) {
          settings = this.default_settings;
        }
        settings[key] = value;
        return this.storage.set(this.SETTINGS_KEY, settings);
      }));
  }
  //
  // ─── DELETE ───────────────────────────────────────────────────────────────────────
  //

  deleteSettings() {
    this.storage.remove(this.SETTINGS_KEY).then((c) => console.log(c));
  }

  //
  // ─── HELPER ───────────────────────────────────────────────────────────────────────
  //

  returnStandards(key) {
    return this.default_settings[key];
  }



}