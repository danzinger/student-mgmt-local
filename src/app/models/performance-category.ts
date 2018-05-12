export class PerfCat {
    _id:any;
    course_id:string;
    teacher_id:string;
    name:string;
    description:string;
    point_maximum:string; //die course ids wo schüler angemeldet ist {"course_id", "date of registration", "registered_by_teacher"}. Durch Hinzufügen/Löschen von Objekten werden an/abmeldungen gemacht.
    category_weight:string; //This Object contains: grading_id, course_id (grading for which course), teilleistungs_id (grading for which teilleistung, Teilleistungen können dann gewichtet werden),  date, actual grading(points), notes
    percentage_points_per_unit:string; 
    type:string;
    children:any[];
  }