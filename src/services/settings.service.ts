import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';

@Injectable()
export class SettingsService {
  constructor(private storage: Storage) {
  }
  SETTINGS_KEY = '_settings';

  ENVIRONMENT_IS_DEV = this.getSetting('ENVIRONMENT_IS_DEV');
  AUTOBACKUP_ON_RESTORE = true;
  GRADE_CALCULATION_FEATURE = false;
  SHOW_PERCENT_SIGN = false;
  SHOW_MARK = false;
  TEST_FEATURES = false;
  MARK_STRING = "-9999,0.5000,5|0.5000,0.5416,4-|0.5416,0.5833,4|0.5833,0.6250,4+|0.6250,0.6666,3-|0.6666,0.7083,3|0.7083,0.7500,3+|0.7500,0.7916,2-|0.7916,0.8333,2|0.8333,0.8750,2+|0.8750,9999,1"


  //Maybe idea works not because the values are saved within this service class only one time. 
  // Next time, the function getSetting() is not called, but the saved value is used --> useless
  // ENVIRONMENT_IS_DEV = this.getSetting('ENVIRONMENT_IS_DEV');
  // AUTOBACKUP_ON_RESTORE = this.getSetting('AUTOBACKUP_ON_RESTORE');
  // GRADE_CALCULATION_FEATURE = this.getSetting('GRADE_CALCULATION_FEATURE');
  // SHOW_PERCENT_SIGN = this.getSetting('SHOW_PERCENT_SIGN');
  // SHOW_MARK = this.getSetting('SHOW_MARK');
  // TEST_FEATURES = this.getSetting('TEST_FEATURES');
  // MARK_STRING = this.getSetting('MARK_STRING');

  default_settings = {
    ENVIRONMENT_IS_DEV: false,
    AUTOBACKUP_ON_RESTORE: true,
    GRADE_CALCULATION_FEATURE: false,
    SHOW_PERCENT_SIGN: false,
    SHOW_MARK: false,
    TEST_FEATURES: false,
    MARK_STRING: "-9999,0.5000,5|0.5000,0.5416,4-|0.5416,0.5833,4|0.5833,0.6250,4+|0.6250,0.6666,3-|0.6666,0.7083,3|0.7083,0.7500,3+|0.7500,0.7916,2-|0.7916,0.8333,2|0.8333,0.8750,2+|0.8750,9999,1"
  };

  returnStandards(key) {
    //console.log(this.default_settings[key]);
    return this.default_settings[key];
  }

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

  getAllSettings() {
    return Observable.from(
      this.storage.get(this.SETTINGS_KEY).then((s)=>{
        return s ? s : this.default_settings;
        
      }))
  }

  getSetting(key): Observable<any>  {
    return Observable.from(this.storage.get(this.SETTINGS_KEY).then((settings) => {
      let returnvalue;
      //console.log(settings, settings[key])
      if (settings && settings[key] != undefined) {
        returnvalue = settings[key];
      } else {
        returnvalue = this.returnStandards(key);
      }
      console.log(returnvalue)
      //console.log((settings && settings[key]) ? settings[key] : this.returnStandards(key))
      return returnvalue;
    }))
  }

  deleteSettings() {
    this.storage.remove(this.SETTINGS_KEY).then((c) => console.log(c)) ;
  }

}