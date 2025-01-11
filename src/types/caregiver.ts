export interface CaregiverSearchFilters {
  specialty?: string;
  specialties?: string[];
  availability?: string[];
  minRate?: number;
  maxRate?: number;
  rating?: number;
  city?: string;
  state?: string;
  neighborhood?: string;
}

export interface SearchResult {
  id: string;
  fullName: string;
  specialties: string[];
  hourlyRate: number;
  rating: number;
  totalReviews?: number;
  availability: Record<string, boolean>;
  imageUrl?: string;
  bio: string;
  city?: string;
  state?: string;
  neighborhood?: string;
}
