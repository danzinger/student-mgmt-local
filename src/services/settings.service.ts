import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';


@Injectable()
export class SettingsService {
  constructor(public storage: Storage) {
  }

  ENVIRONMENT_IS_DEV = true;
  // setEnvironment(env){
  //   this.storage.set('ENVIRONMENT_IS_DEV',env).then(()=>{
  //     this.ENVIRONMENT_IS_DEV = env;
  //   });
  // }
  // getEnvironment(){
  //   this.storage.get('ENVIRONMENT_IS_DEV').then(val => {return val;})
  // }

}