import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';


@Injectable()
export class SettingsService {
  constructor(public storage: Storage) {
  }

  ENVIRONMENT_IS_DEV = false;
  AUTOBACKUP_ON_RESTORE = true;
  EXPERIMENTAL_FEATURES = true;
  SHOW_MARK = true;
  TEST_FEATURES = false;
  SHOW_PERCENT_SIGN = true;
  MARK_STRING = "-99,0.5000,5|0.5000,0.5416,4-|0.5416,0.5833,4|0.5833,0.6250,4+|0.6250,0.6666,3-|0.6666,0.7083,3|0.7083,0.7500,3+|0.7500,0.7916,2-|0.7916,0.8333,2|0.8333,0.8750,2+|0.8750,99,1";
  // setEnvironment(env){
  //   this.storage.set('ENVIRONMENT_IS_DEV',env).then(()=>{
  //     this.ENVIRONMENT_IS_DEV = env;
  //   });
  // }
  // getEnvironment(){
  //   this.storage.get('ENVIRONMENT_IS_DEV').then(val => {return val;})
  // }

}