export type ContentHomeBlock = {
  id: number;
  title: string | null;
  text_body: string | null;
  image_url: string | null;
  type: string;
  layout: string;
  component_name: string | null;
  component_props: Record<string, unknown> | null;
  cta_label: string | null;
  cta_url: string | null;
  cta_image_only?: boolean | null;
  background_color: string | null;
  display_order: number;
  is_active: boolean;
  publish_at: string | null;
};
