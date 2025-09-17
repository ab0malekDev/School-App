import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Lesson, Subject } from '../services/api';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Admin: undefined;
  AddSubject: { subject?: Subject };
  AddUnit: { subjectId: string };
  AddLesson: { subjectId:string, unitId: string };
  AddQuiz: { subjectId: string, unitId: string, lessonId: string };
  ManageLessons: { subjectId: string, unitId: string };
  ManageQuizzes: { subjectId: string, unitId: string, lessonId: string };
  ManageActivationCodes: undefined;
  SubjectUnits: { subjectId: string };
  UnitLessons: { subjectId: string, unitId: string };
  LessonVideo: { lesson: Lesson, subjectId: string, unitId: string };
  SubjectUnitsView: { subjectId: string; viewType?: 'videos' | 'quizzes' };
  Subscription: undefined;
  ScientificSubjects: undefined;
  LiterarySubjects: undefined;
  IntensiveSubjects: undefined;
  PhysicsUnits: undefined;
  ChemistryUnits: undefined;
  BiologyUnits: undefined;
  MathUnits: {
    part: 'first' | 'second';
  };
  ArabicUnits: undefined;
  EnglishUnits: undefined;
  FrenchUnits: undefined;
  IslamicUnits: undefined;
  ScientificSubjectsScreen: undefined;
  LiterarySubjectsScreen: undefined;
  IntensiveSubjectsScreen: undefined;
  LessonQuizzes: { lesson: Lesson; subjectId: string; unitId: string };
  QuizStart: { quiz: any; subjectId: string; unitId: string; lessonId: string; keepAnswers?: boolean; resetQuiz?: boolean };
  QuizResult: { score: number; total: number; quiz: any; lesson?: any; subjectId?: string; unitId?: string };
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;