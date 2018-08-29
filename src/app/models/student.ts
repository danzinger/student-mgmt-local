export class Student {
    _id:any;
    //institutional_id:any;
    firstname:string = '';
    lastname:string = '';
    //notes:Object[];
    //created_by_teacher:string;
    course_registrations:string[]; //die course ids wo schüler angemeldet ist {"course_id", "date of registration", "registered_by_teacher"}. Durch Hinzufügen/Löschen von Objekten werden an/abmeldungen gemacht.
    gradings:any[]; //This Object contains: grading_id, course_id (grading for which course), teilleistungs_id (grading for which teilleistung, Teilleistungen können dann gewichtet werden),  date, actual grading(points), notes
    computed_gradings:any; 
    notes:object[];
    //registered?:any;
  }