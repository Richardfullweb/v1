export interface CaregiverSearchFilters {
      specialty?: string;
      availability?: string[];
      minRate?: number;
      maxRate?: number;
      rating?: number;
    }

    export interface SearchResult {
      id: string;
      fullName: string;
      specialties: string[];
      hourlyRate: number;
      rating: number;
      availability: Record<string, boolean>;
      imageUrl?: string;
      bio: string;
    }
