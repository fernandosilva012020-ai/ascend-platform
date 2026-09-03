import { externalSupabase } from "@/integrations/supabase/external-client";
import type { LandingPageData } from "@/types/landing-pages";

type LandingPageRow = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  category: LandingPageData["category"];
  status: LandingPageData["status"];
  content: Partial<LandingPageContent> | null;
  views: number;
  leads_count: number;
  created_at: string;
  updated_at: string;
};

type LandingPageContent = Pick<
  LandingPageData,
  | "theme"
  | "primaryColor"
  | "badgeText"
  | "headline"
  | "subtitle"
  | "mainText"
  | "ctaText"
  | "ctaLink"
  | "heroImageUrl"
  | "form"
  | "benefitsTitle"
  | "benefitsSubtitle"
  | "benefits"
  | "testimonialsTitle"
  | "testimonialsSubtitle"
  | "testimonials"
  | "finalCtaTitle"
  | "finalCtaSubtitle"
  | "finalCtaButtonText"
  | "finalCtaButtonLink"
>;

function toDatabaseContent(
  page: LandingPageData,
): LandingPageContent {
  return {
    theme: page.theme,
    primaryColor: page.primaryColor,
    badgeText: page.badgeText,
    headline: page.headline,
    subtitle: page.subtitle,
    mainText: page.mainText,
    ctaText: page.ctaText,
    ctaLink: page.ctaLink,
    heroImageUrl: page.heroImageUrl,
    form: page.form,
    benefitsTitle: page.benefitsTitle,
    benefitsSubtitle: page.benefitsSubtitle,
    benefits: page.benefits,
    testimonialsTitle: page.testimonialsTitle,
    testimonialsSubtitle: page.testimonialsSubtitle,
    testimonials: page.testimonials,
    finalCtaTitle: page.finalCtaTitle,
    finalCtaSubtitle: page.finalCtaSubtitle,
    finalCtaButtonText: page.finalCtaButtonText,
    finalCtaButtonLink: page.finalCtaButtonLink,
  };
}

function fromDatabaseRow(
  row: LandingPageRow,
): LandingPageData {
  const content = row.content ?? {};

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    views: Number(row.views ?? 0),
    leadsCount: Number(row.leads_count ?? 0),

    theme: content.theme ?? "dark",
    primaryColor:
      content.primaryColor ?? "#7c3aed",

    badgeText: content.badgeText ?? "",
    headline: content.headline ?? "",
    subtitle: content.subtitle ?? "",
    mainText: content.mainText ?? "",
    ctaText: content.ctaText ?? "",
    ctaLink: content.ctaLink ?? "#",
    heroImageUrl:
      content.heroImageUrl ?? "",

    form: content.form ?? {
      enabled: false,
      title: "Receba mais informações",
      subtitle:
        "Preencha seus dados e entraremos em contato.",
      buttonText: "Enviar dados",
      collectName: true,
      collectPhone: true,
      collectEmail: true,
      successMessage:
        "Cadastro realizado com sucesso!",
    },

    benefitsTitle:
      content.benefitsTitle ??
      "Por que escolher esta solução?",
    benefitsSubtitle:
      content.benefitsSubtitle ?? "",
    benefits: content.benefits ?? [],

    testimonialsTitle:
      content.testimonialsTitle ??
      "Quem conhece recomenda",
    testimonialsSubtitle:
      content.testimonialsSubtitle ?? "",
    testimonials:
      content.testimonials ?? [],

    finalCtaTitle:
      content.finalCtaTitle ??
      "Pronto para dar o próximo passo?",
    finalCtaSubtitle:
      content.finalCtaSubtitle ?? "",
    finalCtaButtonText:
      content.finalCtaButtonText ??
      "Continuar",
    finalCtaButtonLink:
      content.finalCtaButtonLink ?? "#",
  };
}

export async function loadLandingPages(
  userId: string,
): Promise<LandingPageData[]> {
  const { data, error } =
    await externalSupabase
      .from("landing_pages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    fromDatabaseRow(
      row as LandingPageRow,
    ),
  );
}

export async function saveLandingPage(
  userId: string,
  page: LandingPageData,
): Promise<LandingPageData> {
  const payload = {
    id: page.id,
    user_id: userId,
    name: page.name,
    slug: page.slug,
    category: page.category,
    status: page.status,
    content: toDatabaseContent(page),
    views: page.views,
    leads_count: page.leadsCount,
  };

  const { data, error } =
    await externalSupabase
      .from("landing_pages")
      .upsert(payload, {
        onConflict: "id",
      })
      .select("*")
      .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromDatabaseRow(
    data as LandingPageRow,
  );
}

export async function removeLandingPage(
  pageId: string,
): Promise<void> {
  const { error } =
    await externalSupabase
      .from("landing_pages")
      .delete()
      .eq("id", pageId);

  if (error) {
    throw new Error(error.message);
  }
}