/**
 * TypeScript-Typdefinitionen für die BVMW Bürokratieabbau-Plattform
 */

// Benutzer und Authentifizierung
export interface User {
  id: number;
  email: string;
  name?: string;
  company?: string;
  role: 'user' | 'moderator' | 'admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
  company?: string;
}

// JWT Token Payload
export interface JwtPayload {
  id: number;
  role: 'user' | 'moderator' | 'admin';
  iat: number;
  exp: number;
}

// Kategorien
export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface WZCategory {
  key: string;
  name: string;
}

// Meldungen (Reports)
export type ReportStatus = 'pending' | 'approved' | 'rejected';

export interface Report {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category_name: string;
  wz_category_key?: string;
  time_spent?: number;
  costs?: number;
  affected_employees?: number;
  is_anonymous: boolean;
  status: ReportStatus;
  vote_count: number;
  has_comments: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportConfidential extends Report {
  reporter_name?: string;
  reporter_company?: string;
  reporter_email?: string;
}

export interface ReportFormData {
  title: string;
  description: string;
  category_id: number | string;
  wz_category_key: string;
  time_spent?: number | string;
  costs?: number | string;
  affected_employees?: number | string;
  reporter_name?: string;
  reporter_company?: string;
  reporter_email?: string;
  is_anonymous: boolean;
}

// Kommentare
export interface Comment {
  id: number;
  report_id: number;
  user_id: number;
  user_name?: string;
  text: string;
  law_reference?: string;
  created_at: string;
}

export interface CommentFormData {
  text: string;
  law_reference?: string;
}

// Abstimmungen (Votes)
export interface VoteStatus {
  hasVoted: boolean;
  voteCount: number;
}

// API Responses
export interface ApiError {
  message: string;
  errors?: Array<{
    field?: string;
    msg: string;
  }>;
}

export interface AuthResponse {
  token: string;
}

export interface SetupStatus {
  needsSetup: boolean;
  message?: string;
}

// Setup-Wizard
export interface AdminSetupData {
  email: string;
  password: string;
  name?: string;
}
