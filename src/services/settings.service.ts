import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';


@Injectable()
export class SettingsService {
  constructor(private storage: Storage) {
  }
  ENVIRONMENT_IS_DEV = false;

}