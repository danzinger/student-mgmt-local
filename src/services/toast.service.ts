import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';

@Injectable()
export class ToastService {
  _user: any;

  constructor(public toastCtrl: ToastController) {
  }

  showToast(message){
    let toast = this.toastCtrl.create({
        message: message,
        duration: 1000,
        position: 'top'
      });
      toast.present();
  }

}