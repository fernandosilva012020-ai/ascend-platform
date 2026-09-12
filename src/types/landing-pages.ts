export type TemplateCategory = 
  | 'produto'
  | 'servico'
  | 'leads'
  | 'evento'
  | 'afiliado'
  | 'negocio-local';

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  content: string;
  avatarUrl?: string;
  rating?: number;
}

export interface CaptureFormConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  buttonText: string;
  collectName: boolean;
  collectPhone: boolean;
  collectEmail: boolean;
  successMessage: string;
}

export interface LandingPageData {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
  views: number;
  leadsCount: number;
  
  // Design & Theme
  theme: 'dark' | 'light';
  primaryColor: string;
  
  // Hero Section
  badgeText?: string;
  headline: string;
  subtitle: string;
  mainText: string;
  ctaText: string;
  ctaLink: string;
  heroImageUrl: string;
  
  // Form
  form: CaptureFormConfig;
  
  // Benefits
  benefitsTitle: string;
  benefitsSubtitle?: string;
  benefits: BenefitItem[];
  
  // Testimonials
  testimonialsTitle: string;
  testimonialsSubtitle?: string;
  testimonials: TestimonialItem[];
  
  // Final CTA
  finalCtaTitle: string;
  finalCtaSubtitle: string;
  finalCtaButtonText: string;
  finalCtaButtonLink: string;
}
