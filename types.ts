export enum VideoCategory {
  MUSIC = 'الموسيقى (Music)',
  GAMING = 'ألعاب الفيديو (Gaming)',
  TECH = 'تقنية واختراعات',
  EDUCATION = 'تعليم وشروحات',
  ENTERTAINMENT = 'ترفيه وكوميديا',
  VLOG = 'يوميات وفلوقات',
  SPORTS = 'رياضة',
  COOKING = 'طبخ ووصفات',
  NEWS = 'أخبار وترندات',
  HEALTH = 'صحة ولياقة',
  BUSINESS = 'بزنس ومال',
  ART = 'فن وتصميم',
  RELIGIOUS = 'محتوى ديني',
  OTHER = 'أخرى'
}

export enum Language {
  ARABIC = 'العربية (Arabic)',
  ENGLISH = 'English',
  FRENCH = 'Français (French)',
  SPANISH = 'Español (Spanish)',
  GERMAN = 'Deutsch (German)',
  TURKISH = 'Türkçe (Turkish)',
  PORTUGUESE = 'Português (Portuguese)',
  HINDI = 'हिन्दी (Hindi)',
  RUSSIAN = 'Русский (Russian)'
}

export interface ThumbnailIdea {
  description: string;
  text: string;
}

export interface SEOResponse {
  titles: string[];
  description: string;
  keywords: string[];
  hashtags: string[];
  category: string;
  algorithmStrategy: string;
  thumbnailIdeas: ThumbnailIdea[];
}

export interface GenerateParams {
  topic: string;
  category: VideoCategory;
  audience: string;
  language: string;
}

export interface SocialPost {
  platform: string;
  content: string;
  hashtags: string[];
}

export interface MarketingCopyResponse {
  strategy: string;
  posts: SocialPost[];
}

export interface MarketingParams {
  productName: string;
  audience: string;
  language: string;
}

export interface PerformanceResponse {
  views: string;
  likes: string;
  comments: string;
  analysis: string;
}

export interface PerformanceParams {
  url: string;
}

// --- Ad System Types ---

export interface AdPlacementConfig {
  id: string; // The specific slot ID from AdSense
  enabled: boolean;
  format?: 'auto' | 'fluid' | 'rectangle';
}

export interface AdSettings {
  publisherId: string; // ca-pub-XXXXXXXXXXXXXXXX
  globalEnabled: boolean;
  placements: {
    header: AdPlacementConfig;
    sidebar: AdPlacementConfig;
    resultsTop: AdPlacementConfig;
    resultsBottom: AdPlacementConfig;
  };
}