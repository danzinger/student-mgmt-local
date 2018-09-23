import { Injectable } from '@angular/core';


@Injectable()
export class SettingsService {
  constructor() {
  }

  ENVIRONMENT_IS_DEV = false;
  AUTOBACKUP_ON_RESTORE = true;
  GRADE_CALCULATION_FEATURE = false;
  SHOW_PERCENT_SIGN = false;
  SHOW_MARK = false;
  TEST_FEATURES = false;
  MARK_STRING = "-9999,0.5000,5|0.5000,0.5416,4-|0.5416,0.5833,4|0.5833,0.6250,4+|0.6250,0.6666,3-|0.6666,0.7083,3|0.7083,0.7500,3+|0.7500,0.7916,2-|0.7916,0.8333,2|0.8333,0.8750,2+|0.8750,9999,1";

}