import { memo, useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { ContentHomeBlock } from "@/types/contentHome";
import { useThemeMode } from "@/context/ThemeContext";
import { AppTheme, resolveShadow } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { resolveAssetUrl } from "@/utils/url";

type HomeContentListProps = {
  blocks: ContentHomeBlock[];
  renderComponent?: (block: ContentHomeBlock) => ReactNode | null;
};

type AutoSizedImageProps = {
  uri: string;
  style: any;
  fallbackHeight: number;
};

const AutoSizedImage = memo(({ uri, style, fallbackHeight }: AutoSizedImageProps) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    Image.getSize(
      uri,
      (width, height) => {
        if (!mounted || !width || !height) return;
        setAspectRatio(width / height);
      },
      () => {
        if (mounted) setAspectRatio(null);
      }
    );

    return () => {
      mounted = false;
    };
  }, [uri]);

  const computedStyle = useMemo(() => {
    if (aspectRatio) {
      return [style, { aspectRatio }];
    }

    return [style, { height: fallbackHeight }];
  }, [style, aspectRatio, fallbackHeight]);

  return <Image source={{ uri }} style={computedStyle} resizeMode="cover" />;
});

function HomeContentListComponent({ blocks, renderComponent }: HomeContentListProps) {
  const { theme } = useThemeMode();
  const { config } = useAuth();
  const router = useRouter();
  const styles = createStyles(theme);

  const handleOpenUrl = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Não foi possível abrir o link do conteúdo:", error);
    }
  }, []);

  if (!blocks.length) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      {blocks.map((block, index) => {
        if (block.type === "component") {
          if (!renderComponent) return null;

          const rendered = renderComponent(block);
          if (!rendered) return null;

          return (
            <View
              key={`${block.id}-${block.display_order}-component`}
              style={[styles.componentContainer, index !== blocks.length - 1 && styles.blockSpacing]}
            >
              {rendered}
            </View>
          );
        }

        const assetUri = resolveAssetUrl(block.image_url, config?.assets_base_url);
        const showImage = Boolean(assetUri);
        const isImageFocused = block.type === "image" || block.type === "only_image";
        const isSplitLayout = block.layout === "split" && showImage && !isImageFocused;
        const isOnlyImage = block.type === "only_image";
        const containerBackground = block.background_color
          ? { backgroundColor: block.background_color }
          : { backgroundColor: theme.general.surface };
        const isLast = index === blocks.length - 1;

        const content =
          !isImageFocused && (block.title || block.text_body || block.cta_label) ? (
            <>
              {block.title ? <Text style={styles.title}>{block.title}</Text> : null}
              {block.text_body ? (
                <Text style={styles.body}>{block.text_body}</Text>
              ) : null}
            </>
          ) : null;

        const fallbackHeight = block.layout === "banner" || isOnlyImage ? 220 : 160;

        const image = showImage ? (
          <AutoSizedImage
            uri={assetUri!}
            style={styles.blockImage}
            fallbackHeight={fallbackHeight}
          />
        ) : null;

        const rawCtaLabel = block.cta_label?.trim() ?? "";
        const isImageOnlyCta = Boolean(block.cta_image_only);
        const hasCtaAction = Boolean(block.cta_url || rawCtaLabel);
        const ctaLabel = rawCtaLabel || "Saiba mais";

        const handleCtaPress = () => {
          if (block.cta_url) {
            void handleOpenUrl(block.cta_url);
            return;
          }
          router.push(`/details/content/${block.id}`);
        };

        const imageElement =
          image && hasCtaAction ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={block.cta_url ? () => handleOpenUrl(block.cta_url!) : handleCtaPress}
            >
              {image}
            </TouchableOpacity>
          ) : (
            image
          );

        const ctaButton = hasCtaAction && !isImageOnlyCta ? (
          <TouchableOpacity style={styles.ctaButton} onPress={handleCtaPress}>
            <Text style={styles.ctaButtonText}>{ctaLabel}</Text>
          </TouchableOpacity>
        ) : null;

        return (
          <View
            key={`${block.id}-${block.display_order}`}
            style={[styles.blockContainer, containerBackground, !isLast && styles.blockSpacing]}
          >
            {isOnlyImage || isImageFocused ? (
              <>
                {imageElement ? <View style={styles.imageContainer}>{imageElement}</View> : null}
                {ctaButton ? <View style={styles.ctaImageWrapper}>{ctaButton}</View> : null}
              </>
            ) : isSplitLayout ? (
              <View style={styles.splitContainer}>
                <View style={styles.splitText}>{content}{ctaButton}</View>
                <View style={styles.splitImageWrapper}>{imageElement}</View>
              </View>
            ) : (
              <>
                {showImage ? (
                  <View style={[styles.imageContainer, block.layout !== "banner" && styles.blockImageWrapper]}>
                    {imageElement}
                  </View>
                ) : null}
                <View style={styles.contentContainer}>
                  {content}
                  {ctaButton}
                </View>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      paddingHorizontal: theme.spacing.sm,      
    },
    blockContainer: {
      ...resolveShadow(theme.shadow.card),
    },
    blockSpacing: {
      marginBottom: theme.spacing.lg,
    },
    componentContainer: {
      width: "100%",
      padding: theme.spacing.lg,
    },
    imageContainer: {
      width: "100%",
      overflow: "hidden",
    },
    blockImageWrapper: {
      marginBottom: theme.spacing.md,
    },
    blockImage: {
      width: "100%",
    },
    contentContainer: {
      padding: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    splitContainer: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    splitText: {
      flex: 1,
      gap: theme.spacing.sm,
    },
    splitImageWrapper: {
      flex: 1,
      overflow: "hidden",
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textSecondary,
    },
    ctaButton: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    ctaButtonText: {
      color: theme.colors.textLight,
      fontWeight: "600",
    },
    ctaImageWrapper: {
      padding: theme.spacing.lg,
      alignItems: "flex-start",
    },
  });

const HomeContentList = memo(HomeContentListComponent);
export default HomeContentList;
