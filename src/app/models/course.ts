export class Course {
    _id:any;
    name:string;
    institution:string; // BOKU, Uni Wien,...
    //teacher_id:string; // Array of all teachers of this course. Is the current user per default. Later user can add other teachers (which are registeres with this app)
    notes?: object[];
    newnotes?: any;
    performanceCategories:any[];
    participants:string[]; // Array of all participants (Student id_s) of the course.

  }
