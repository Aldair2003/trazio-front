// Enums
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

// User/Student Types
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  profileImage?: string
  registrationDate: string
  profileCompleted?: boolean
}

export interface Student extends User {
  exams: Exam[]
  assignments: Assignment[]
  projects: Project[]
  posts: Post[]
  comments: Comment[]
}

// Subject Types
export interface Subject {
  id: number
  name: string
  description?: string
}

// Exam Types
export enum ExamStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  GRADED = 'graded',
}

export interface FileAttachment {
  url: string
  publicId: string
  fileName: string
  fileType: string
  uploadedAt: string
}

export interface Exam {
  id: number
  userId: number
  curriculumSubjectId?: number
  subjectId?: number
  title?: string
  description?: string
  date: string
  status: ExamStatus
  grade?: number
  attachments?: FileAttachment[]
  createdAt: string
  updatedAt: string
  subject?: Subject
  curriculumSubject?: CurriculumSubject
  user?: User
  student?: User
}

// Assignment Types
export enum AssignmentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

export interface Assignment {
  id: number
  userId: number
  curriculumSubjectId?: number
  subjectId?: number
  title?: string
  description?: string
  dueDate: string
  status: AssignmentStatus
  grade?: number
  attachments?: FileAttachment[]
  createdAt: string
  updatedAt: string
  subject?: Subject
  curriculumSubject?: CurriculumSubject
  user?: User
  student?: User
}

// Project Types
export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

export interface Project {
  id: number
  userId: number
  curriculumSubjectId?: number
  subjectId?: number
  title?: string
  description?: string
  dueDate: string
  status: ProjectStatus
  grade?: number
  collaborators?: number[]
  technologies?: string[]
  repositoryUrl?: string
  demoUrl?: string
  attachments?: FileAttachment[]
  createdAt: string
  updatedAt: string
  subject?: Subject
  curriculumSubject?: CurriculumSubject
  user?: User
  student?: User
}

// Hashtag Types
export interface Hashtag {
  id: number
  name: string
  posts?: Post[]
  postCount?: number
}

// Like Types
export interface Like {
  id: number
  postId: number
  userId: number
  createdAt: string
  post?: Post
  user?: User
}

// Post Types
export type FileType = 'image' | 'video' | 'document'

export enum PostType {
  GENERAL = 'general',
  EXAM = 'exam',
  ASSIGNMENT = 'assignment',
  PROJECT = 'project',
  RESOURCE = 'resource',
}

export interface Highlight {
  id: number
  postId: number
  teacherId: number
  comment?: string
  createdAt: string
  teacher?: User
}

export interface Post {
  id: number
  userId: number
  content: string
  type: PostType
  linkedEntityId?: number
  linkedEntity?: Project | Assignment | Exam // La entidad vinculada (proyecto, tarea o examen)
  curriculumSubjectId?: number
  filePath?: string
  fileType?: FileType
  fileName?: string
  createdAt: string
  user?: User
  comments?: Comment[]
  hashtags?: Hashtag[]
  likes?: Like[]
  likesCount?: number
  highlights?: Highlight[]
  highlightsCount?: number
  curriculumSubject?: CurriculumSubject
  subject?: CurriculumSubject // Alias para compatibilidad
}

// Comment Types
export interface Comment {
  id: number
  postId: number
  userId: number
  content: string
  createdAt: string
  post?: Post
  user?: User
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

// API Response Types
export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

// Form Data Types (DTOs)
export interface CreatePostDto {
  userId: number
  content: string
  hashtags?: string[]
  filePath?: string
  fileType?: FileType
  fileName?: string
}

export interface UpdatePostDto {
  content?: string
  hashtags?: string[]
}

export interface CreateCommentDto {
  postId: number
  userId: number
  content: string
}

export interface CreateExamDto {
  userId: number
  curriculumSubjectId?: number
  subjectId?: number
  title?: string
  description?: string
  date: string
  status?: ExamStatus
  grade?: number
  attachments?: FileAttachment[]
}

export interface CreateAssignmentDto {
  userId: number
  curriculumSubjectId?: number
  subjectId?: number
  title?: string
  description?: string
  dueDate: string
  status?: AssignmentStatus
  grade?: number
  attachments?: FileAttachment[]
}

export interface CreateProjectDto {
  userId: number
  curriculumSubjectId?: number
  subjectId?: number
  title?: string
  description?: string
  dueDate: string
  status?: ProjectStatus
  grade?: number
  collaborators?: number[]
  technologies?: string[]
  repositoryUrl?: string
  demoUrl?: string
  attachments?: FileAttachment[]
}

export interface CreateSubjectDto {
  name: string
  description?: string
}

// Query Params Types
export interface PostFilters {
  search?: string
  hashtag?: string
  userId?: number
  type?: PostType
  curriculumSubjectId?: number
}

export interface ExamFilters {
  subjectId?: number
  userId?: number
  curriculumSubjectId?: number
}

export interface AssignmentFilters {
  subjectId?: number
  userId?: number
  curriculumSubjectId?: number
}

export interface ProjectFilters {
  subjectId?: number
  userId?: number
  curriculumSubjectId?: number
}

export interface CommentFilters {
  postId?: number
}

// Onboarding Types
export interface TeacherSubjectSelection {
  teacherId: number
  subjectIds: number[]
}

export interface CompleteStudentProfileDto {
  age?: number
  birthYear?: number
  currentSemester: number
  career: string
  bio?: string
  teachersAndSubjects: TeacherSubjectSelection[]
}

export interface SubjectDto {
  subjectName: string
  description?: string
  code?: string
}

export interface CompleteTeacherProfileDto {
  department?: string
  bio?: string
  office?: string
  subjects: SubjectDto[]
}

export interface TeacherSubject {
  id: number
  teacherId: number
  subjectName: string
  description?: string
  code?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Teacher {
  id: number
  name: string
  email: string
}

// Onboarding V2 Types (con Mallas Curriculares)
export enum CurriculumType {
  NEW = 'new',
  OLD = 'old',
}

export enum AcademicStatus {
  STUDYING = 'studying',
  GRADUATED = 'graduated',
}

export enum TrazioGoal {
  DOCUMENT = 'document',
  COLLABORATE = 'collaborate',
  PORTFOLIO = 'portfolio',
  TRACK_PROGRESS = 'track_progress',
}

export enum TeacherVisibility {
  MY_STUDENTS = 'my_students',
  ALL_CAREER = 'all_career',
  HIGHLIGHTED = 'highlighted',
}

export interface Curriculum {
  id: number
  name: string
  description?: string
  type: CurriculumType
  university: string
  career: string
  totalSemesters: number
  semesters?: number
  isActive: boolean
  createdAt: string
}

export interface CurriculumSubject {
  id: number
  curriculumId: number
  name: string
  semester: number
  code?: string
  isActive: boolean
  createdAt: string
}

export interface CompleteStudentProfileV2Dto {
  curriculumId: number
  currentSemester: number
  birthYear: number
  admissionYear: number
  academicStatus: AcademicStatus
  hasDraggedSubjects?: boolean
  draggedSubjectIds?: number[]
  academicInterests?: string[]
  trazioGoal?: TrazioGoal
  bio?: string
}

export interface CompleteTeacherProfileV2Dto {
  curriculumIds: number[]
  subjectIds: number[]
  institutionalEmail?: string
  bio?: string
  visibility?: TeacherVisibility
}

// Intereses académicos disponibles
export const ACADEMIC_INTERESTS = [
  'Desarrollo Web',
  'Bases de Datos',
  'IA',
  'Ciencia de Datos',
  'Videojuegos',
  'Ciberseguridad',
  'Cloud / DevOps',
  'IoT',
]
