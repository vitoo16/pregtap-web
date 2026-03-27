/**
 * Comprehensive TypeScript type definitions for the PregTap pregnancy tracking app.
 * Mirrors Flutter models from the mobile app with additional computed helpers.
 */

import { differenceInDays, differenceInWeeks, addDays, format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Types (extended from src/lib/auth.ts)
// ─────────────────────────────────────────────────────────────────────────────

export type {
  ApiResponse,
  AuthUser,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ProfileFormValues,
} from '@/lib/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Pregnancy Models
// ─────────────────────────────────────────────────────────────────────────────

/** Active pregnancy record (mirrors MO's backend DTO) */
export interface ActivePregnancy {
  id: string;
  userId: string;
  pregnancyNumber: number;
  status: string;
  expectedDeliveryDate: string;
  estimatedConceptionDate?: string;
  prePregnancyWeightKg?: number;
  heightCm?: number;
  prePregnancyBmi?: number;
  currentGestationalWeek?: number;
  gestationalAgeDisplay?: string;
  babyNickname?: string;
  babyGender?: 'Unknown' | 'Male' | 'Female';
  pregnancyType?: 'Singleton' | 'Twins' | 'Triplets' | 'Other';
  motherBloodType?: string;
  gravida?: number;
  para?: number;
  obstetricFormula?: string;
  coverImageUrl?: string;
  lastMenstrualPeriodDate?: string;
  dueDateSource?: 'LMP' | 'Ultrasound' | 'IVF' | 'Manual';
  notes?: string;
  actualDeliveryDate?: string;
  deliveryMethod?: string;
  createdAt: string;
  updatedAt: string;
}

/** Computed pregnancy progress from due date */
export interface PregnancyProgress {
  currentWeek: number;
  currentDayInWeek: number;
  progressPercentage: number;
  daysRemaining: number;
  trimester: 1 | 2 | 3;
  trimesterName: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pregnancy Tracking (from local JSON data)
// ─────────────────────────────────────────────────────────────────────────────

export interface InfoSection {
  title: string;
  content: string;
}

export interface PregnancyWeek {
  weekNumber: number;
  embryoImage?: string;
  weight: { value: number; unit: string };
  length: { value: number; unit: string };
  currentWeekAndDays: string;
  trimester: number;
  dateOfLabor: string;
  weeksAndDaysLeft: string;
  infoSections: InfoSection[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Weight Tracker
// ─────────────────────────────────────────────────────────────────────────────

export interface WeightLog {
  id: string;
  pregnancyId: string;
  logDate: string;
  weightKg: number;
  notes?: string;
  imageUrl?: string;
  source: 'Manual' | 'OCR';
  weightGainFromBaseline?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WeightGoalRange {
  id: string;
  pregnancyId: string;
  heightCm: number;
  prePregnancyWeightKg: number;
  bmi: number;
  bmiCategory: string;
  recommendedTotalGainMin: number;
  recommendedTotalGainMax: number;
  notes?: string;
}

export interface WeightAlert {
  id: string;
  pregnancyId: string;
  alertType: 'GainingTooFast' | 'GainingTooSlow' | 'ExceededTotalGain';
  triggeredAt: string;
  detailsJson?: string;
  resolvedAt?: string;
  isResolved: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Meal Planner
// ─────────────────────────────────────────────────────────────────────────────

export interface MealPlan {
  id: string;
  pregnancyId: string;
  title: string;
  startDate: string;
  endDate: string;
  weekNumber?: number;
  status: 'Pending' | 'Generating' | 'Succeeded' | 'Failed';
  createdAt?: string;
  updatedAt?: string;
}

export interface MealDay {
  date: string;
  weekday: string;
  meals: MealItem[];
}

export interface MealNutrient {
  code: string; // PROT, CARB, FAT, etc.
  value: number;
  unit: string;
}

export type MealType =
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Snack'
  | 'Morning'
  | 'Afternoon'
  | 'Evening';

export interface MealItem {
  id: string;
  title: string;
  mealType: MealType;
  imageUrl?: string;
  description?: string;
  ingredients?: string;
  instructions?: string;
  calories?: number;
  nutrients: MealNutrient[];
}

export interface FoodPreference {
  id: string;
  pregnancyId: string;
  preferenceType: 'Allergy' | 'Dislike';
  refFoodItemId?: string;
  refFoodItemName?: string;
}

export interface NutritionNote {
  id: string;
  pregnancyId: string;
  noteType: 'Diet' | 'Note' | 'Other';
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Medical Records
// ─────────────────────────────────────────────────────────────────────────────

export interface DocumentFile {
  id: string;
  fileUrl: string;
  mimeType: string;
  originalFileName: string;
  fileSizeBytes?: number;
  sortOrder?: number;
}

export interface MedicalDocument {
  id: string;
  pregnancyId: string;
  visitId?: string;
  documentTypeId: string;
  documentTypeName: string;
  title: string;
  documentDate: string;
  source: string;
  notes?: string;
  isFavorite: boolean;
  files: DocumentFile[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OcrResult {
  id: string;
  documentId: string;
  status: 'Pending' | 'OcrProcessing' | 'AiExtracting' | 'Succeeded' | 'Failed' | 'Confirmed';
  confidenceScore?: number;
  processingTimes?: Record<string, number>;
  createdAt?: string;
}

export interface DocumentType {
  id: string;
  code: string;
  displayName: string;
  description?: string;
  iconName?: string;
}

export interface MedicalDocumentDetail extends MedicalDocument {
  documentTypeDisplayName?: string;
  capturedAt?: string;
  totalFileSizeBytes?: number;
  structuredData?: StructuredData;
  vitals?: VitalsData;
  ocrResult?: OcrResult;
}

export interface StructuredData {
  generalInfo?: GeneralInfo;
  previousVisit?: PreviousVisit;
  medicalHistory?: MedicalHistory;
  diseaseHistory?: DiseaseHistory;
  gynecologicalHistory?: GynecologicalHistory;
  physicalExamination?: PhysicalExamination;
  personalHistory?: PersonalHistory;
  familyHistory?: FamilyHistory;
  labTests?: LabTests;
  treatmentPlan?: TreatmentPlan;
  prognosis?: Prognosis;
  nextVisit?: NextVisit;
  diagnosis?: string;
  ocrConfidence?: number;
  extractedAt?: string;
}

export interface GeneralInfo {
  patientName?: string;
  dateOfBirth?: string;
  gender?: string;
  age?: number;
  phoneNumber?: string;
  address?: string;
  occupation?: string;
  ethnicity?: string;
  nationality?: string;
  bloodType?: string;
  rhFactor?: string;
  weightKg?: number;
  heightCm?: number;
  insuranceType?: string;
  insuranceNumber?: string;
  idNumber?: string;
  examinationDate?: string;
}

export interface PreviousVisit {
  lastVisitDate?: string;
  chiefComplaint?: string;
  clinicalDiagnosis?: string;
  location?: string;
  lastMenstrualPeriod?: string;
  expectedDeliveryDate?: string;
}

export interface MedicalHistory {
  reasonForVisit?: string;
  numberOfPreviousPregnancies?: number;
  numberOfLiveBirths?: number;
  numberOfAbortions?: number;
}

export interface DiseaseHistory {
  diabetes?: boolean;
  hypertension?: boolean;
}

export interface GynecologicalHistory {
  menstrualCycleRegular?: boolean;
  gynecologicalSurgery?: boolean;
}

export interface PhysicalExamination {
  vitalSigns?: VitalSigns;
  consciousnessState?: string;
  pelvicMeasurement?: string;
  fetalHeartPresent?: boolean;
}

export interface VitalSigns {
  weightKg?: number;
  heightCm?: number;
}

export interface PersonalHistory {
  allergiesPresent?: boolean;
}

export interface FamilyHistory {
  diabetesHistory?: boolean;
}

export interface LabTests {
  bloodTests?: BloodTests;
  urineTests?: UrineTests;
  ultrasound?: Ultrasound;
}

export interface BloodTests {
  hemoglobin?: number;
  hiv?: string;
  hbsag?: string;
}

export interface UrineTests {
  protein?: string;
}

export interface Ultrasound {
  gestationalAge?: string;
}

export interface TreatmentPlan {
  recommendations?: string[];
}

export interface Prognosis {
  normalPregnancy?: boolean;
}

export interface NextVisit {
  nextVisitDate?: string;
  doctorName?: string;
}

export interface ConfirmExtractionRequest {
  documentTypeId: string;
  eventDate: string;
  existingVisitId?: string;
  vitals?: VitalsData;
  location?: string;
  notes?: string;
}

export interface AutoFillResult {
  ocrResultId?: string;
  documentId?: string;
  documentTypeCode?: string;
  createdVisitId?: string;
  createdTestIds?: string[];
  documentLinkedToVisit?: boolean;
  summary?: string;
}

// ─── Vitals Data (nested in ExtractionReview) ───

export interface VitalsData {
  generalInfo?: {
    facility?: string;
    admissionNumber?: string;
    patientCode?: string;
    fullName?: string;
    dob?: string;
    age?: number;
    phone?: string;
    address?: string;
    ward?: string;
    district?: string;
    province?: string;
    occupation?: string;
    ethnicity?: string;
    nationality?: string;
    insurance?: string;
    bloodType?: string;
    rhFactor?: string;
  };
  interview?: {
    reasonForVisit?: string;
    pregnancyNumber?: number;
    totalVisitCount?: number;
    lmp?: string;
    gestationalWeek?: number;
    expectedDeliveryDate?: string;
    clinicalProgress?: string;
    generalCondition?: string;
    tetanusVaccineHistory?: string;
  };
  examination?: {
    vitalSigns?: {
      pulse?: number;
      bloodPressureSystolic?: number;
      bloodPressureDiastolic?: number;
      temperature?: number;
      respiratoryRate?: number;
      weight?: number;
      height?: number;
    };
    obstetric?: {
      fundusHeight?: number;
      abdominalCirc?: number;
      fetalPresentation?: string;
      fetalHeartRate?: number;
      cervix?: string;
      amnioticFluid?: string;
    };
    general?: {
      mentalStatus?: string;
      edema?: string;
      urineProtein?: string;
    };
  };
}

export interface ExtractionReview {
  ocrResultId: string;
  documentId: string;
  pregnancyId: string;
  documentTypeId: string;
  documentTypeName: string;
  status: string;
  confidenceScore: number;
  fileUrls: string[];
  vitals?: VitalsData;
  overallConfidence: number;
  canAutoFill: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Doctor Chat
// ─────────────────────────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatarUrl?: string;
  lastMessage?: string;
  unreadCount?: number;
}

export interface AttachmentFile {
  id: string;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes?: number;
  fileUrl: string;
}

export type MessageType = 'Text' | 'Image' | 'Document';

export interface ChatMessage {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  content?: string;
  attachmentFile?: AttachmentFile;
  sentAt: string;
  deletedAt?: string;
  isMe: boolean;
  messageType: MessageType;
}

export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Prenatal Visits
// ─────────────────────────────────────────────────────────────────────────────

export type VisitType = 'Routine' | 'Emergency' | 'Ultrasound' | 'Lab' | 'Other';

export interface PrenatalVisit {
  id: string;
  pregnancyId: string;
  doctorId?: string;
  visitDate: string;
  visitType: VisitType;
  location?: string;
  notes?: string;
  testCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Types (from src/lib/subscription.ts)
// ─────────────────────────────────────────────────────────────────────────────

export type {
  SubscriptionPlanCode,
  SubscriptionPlan,
  PurchaseSubscriptionRequest,
  PurchaseSubscriptionResponse,
  SubscriptionVerifyResponse,
  SubscriptionStatus,
  SubscriptionHistoryItem,
} from '@/lib/subscription';

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

const PREGNANCY_DURATION_DAYS = 280; // 40 weeks

/** Returns the Vietnamese name for a trimester number. */
export function getTrimesterName(trimester: number): string {
  switch (trimester) {
    case 1:
      return 'Tam cá nguyệt thứ nhất';
    case 2:
      return 'Tam cá nguyệt thứ hai';
    case 3:
      return 'Tam cá nguyệt thứ ba';
    default:
      return `Tam cá nguyệt thứ ${trimester}`;
  }
}

/**
 * Computes pregnancy progress from a due date (ISO string).
 * Uses 280 days (40 weeks) as total pregnancy duration, counting back from due date.
 */
export function getPregnancyProgress(dueDate: string): PregnancyProgress {
  const due = parseISO(dueDate);
  if (!isValid(due)) {
    return {
      currentWeek: 0,
      currentDayInWeek: 0,
      progressPercentage: 0,
      daysRemaining: 0,
      trimester: 1,
      trimesterName: getTrimesterName(1),
    };
  }

  const today = new Date();
  const daysSinceConception = differenceInDays(today, due) + PREGNANCY_DURATION_DAYS;
  const daysRemaining = Math.max(0, differenceInDays(due, today));

  const totalDays = PREGNANCY_DURATION_DAYS;
  const progressPercentage = Math.min(100, Math.max(0, (daysSinceConception / totalDays) * 100));

  // We add 1 to get "current week" (week 1 starts at day 0)
  const currentWeek = Math.min(40, Math.max(0, Math.floor(daysSinceConception / 7)));
  const currentDayInWeek = daysSinceConception % 7;

  const trimester = (
    currentWeek <= 12 ? 1 :
    currentWeek <= 27 ? 2 :
    3
  ) as 1 | 2 | 3;

  return {
    currentWeek,
    currentDayInWeek,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    daysRemaining,
    trimester,
    trimesterName: getTrimesterName(trimester),
  };
}

/** Formats an ISO date string to Vietnamese locale format (dd/MM/yyyy). */
export function formatDueDate(dueDate: string): string {
  const date = parseISO(dueDate);
  if (!isValid(date)) {
    return dueDate;
  }
  return format(date, 'dd/MM/yyyy', { locale: vi });
}
