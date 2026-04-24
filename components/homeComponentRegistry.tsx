import { ReactNode } from "react";

import CouponsCarousel from "@/components/CouponsCarousel";
import PartnersCarousel from "@/components/PartnersCarousel";
import WelcomeBonusButton from "@/components/WelcomeBonusButton";
import { ContentHomeBlock } from "@/types/contentHome";

type HomeComponentProps = Record<string, any>;

type HomeComponentRenderContext = {
  activatingBonus: boolean;
  couponRefreshKey: number;
  onActivateWelcomeBonus: () => void;
};

type HomeComponentRenderer = (
  props: HomeComponentProps,
  context: HomeComponentRenderContext
) => ReactNode | null;

export const HOME_COMPONENT_KEYS = {
  welcomeBonusButton: "WelcomeBonusButton",
  couponsCarousel: "CouponsCarousel",
  partnersCarousel: "PartnersCarousel",
} as const;

const HOME_COMPONENT_REGISTRY: Record<string, HomeComponentRenderer> = {
  [HOME_COMPONENT_KEYS.welcomeBonusButton]: (props, context) => (
    <WelcomeBonusButton
      {...props}
      onActivate={context.onActivateWelcomeBonus}
      loading={context.activatingBonus}
    />
  ),
  [HOME_COMPONENT_KEYS.couponsCarousel]: (props, context) => (
    <CouponsCarousel
      {...props}
      refreshKey={context.couponRefreshKey}
    />
  ),
  [HOME_COMPONENT_KEYS.partnersCarousel]: (props, context) => (
    <PartnersCarousel
      {...props}
      refreshKey={context.couponRefreshKey}
    />
  ),
};

export function normalizeHomeComponentProps(
  block: ContentHomeBlock
): HomeComponentProps {
  const rawProps = block.component_props;

  if (rawProps && typeof rawProps === "object" && !Array.isArray(rawProps)) {
    return rawProps as HomeComponentProps;
  }

  return {};
}

export function hasHomeComponent(
  blocks: ContentHomeBlock[],
  componentName: string
): boolean {
  return blocks.some(
    (block) => block.type === "component" && block.component_name === componentName
  );
}

export function renderHomeComponentByName(
  block: ContentHomeBlock,
  context: HomeComponentRenderContext
): ReactNode | null {
  const componentName = block.component_name;

  if (!componentName) return null;

  const renderer = HOME_COMPONENT_REGISTRY[componentName];
  if (!renderer) return null;

  return renderer(normalizeHomeComponentProps(block), context);
}
