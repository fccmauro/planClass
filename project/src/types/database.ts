export interface Profile {
  id: string;
  email: string;
  is_pro: boolean;
  created_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  title: string;
  evaluations: Evaluation[];
  created_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface Evaluation {
  id: string;
  date: string;
  score: number;
  completed: boolean;
}