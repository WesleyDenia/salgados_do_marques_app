export interface Partner {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  active: boolean;
}

export interface PartnerSummary {
  id: number;
  name: string;
  slug: string;
}

export interface PartnerCampaignSummary {
  id: number;
  public_name: string;
}
