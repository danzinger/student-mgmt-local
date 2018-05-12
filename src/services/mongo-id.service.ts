import { Injectable } from '@angular/core';

const ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))

@Injectable()
export class MongoIdService {

  constructor() { }

  newObjectId():String{
      return ObjectId();
  }


}