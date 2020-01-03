import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import { Settings } from '../app/models/settings';

@Injectable()
export class SettingsService {
  constructor(private storage: Storage) {
  }

  SETTINGS_KEY = '_settings';

  default_settings = {
    APP_VERSION: 109,
    ENVIRONMENT_IS_DEV: true,
    SHOWDEVSWITCH: true,
    PLATFORM: "desktop",
    AUTOBACKUP_ON_RESTORE: false,
    GRADE_CALCULATION_FEATURE: true,
    SHOW_PERCENT_SIGN: false,
    SHOW_MARK: false,
    TEST_FEATURES: false,
    MARK_STRING: "-9999,0.5000,5|0.5000,0.5416,4-|0.5416,0.5833,4|0.5833,0.6250,4+|0.6250,0.6666,3-|0.6666,0.7083,3|0.7083,0.7500,3+|0.7500,0.7916,2-|0.7916,0.8333,2|0.8333,0.8750,2+|0.8750,9999,1",
    AUTOSORT: true,
    MINIMUM_THRESHOLD_CALCULATION: true,
    MINIMUM_VALUE: 0.375,
    THRESHOLD_VALUE: 0.5
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

  getAllSettingsPromise(): Promise<Settings> {
    return this.storage.get(this.SETTINGS_KEY).then((s) => {
      return s ? s : this.default_settings;
    })
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

  mergeCourseSettings(settings_to_update, updated_settings_subset) {
    // merge course.course_settings into settings_from_coursedetail
    settings_to_update.SHOW_MARK = updated_settings_subset.SHOW_MARK;
    settings_to_update.MARK_STRING = updated_settings_subset.MARK_STRING;
    settings_to_update.AUTOSORT = updated_settings_subset.AUTOSORT;
    settings_to_update.MINIMUM_THRESHOLD_CALCULATION = updated_settings_subset.MINIMUM_THRESHOLD_CALCULATION;
    settings_to_update.MINIMUM_VALUE = updated_settings_subset.MINIMUM_VALUE;
    settings_to_update.THRESHOLD_VALUE = updated_settings_subset.THRESHOLD_VALUE;

    return settings_to_update;
  }

  //
  // ─── DELETE ───────────────────────────────────────────────────────────────────────
  //

  deleteSettings() {
    this.storage.remove(this.SETTINGS_KEY);
  }

  getAndSetDefaultSettings() {
    return this.storage.set(this.SETTINGS_KEY, this.default_settings);
  }

  //
  // ─── HELPER ───────────────────────────────────────────────────────────────────────
  //

  returnStandards(key) {
    return this.default_settings[key];
  }



}