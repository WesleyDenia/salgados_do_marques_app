import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { AppTheme } from "@/constants/theme";
import { getLoyaltyBannerTheme, LoyaltyBannerTheme } from "@/constants/themeLoyalty";
import { useRouter } from "expo-router";
import { useThemeMode } from "@/context/ThemeContext";

interface LoyaltyBannerProps {
  points: number;
  goal: number;
  loading?: boolean;
  showRewardsButton?: boolean;
  milestones?: number[];
}

export default function LoyaltyBanner({
  points,
  goal,
  loading = false,
  showRewardsButton = true,
  milestones = [],
}: LoyaltyBannerProps) {
  const { theme } = useThemeMode();
  const bannerTheme = useMemo(() => getLoyaltyBannerTheme(theme), [theme]);
  const styles = useMemo(() => createStyles(theme, bannerTheme), [theme, bannerTheme]);
  const router = useRouter();

  const normalizedMilestones = Array.isArray(milestones)
    ? [...new Set(milestones)].sort((a, b) => a - b)
    : [];

  const highestMilestone =
    normalizedMilestones.length > 0
      ? normalizedMilestones[normalizedMilestones.length - 1]
      : null;

  const safeGoal = goal && goal > 0 ? goal : highestMilestone ?? Math.max(points, 1);
  const ratio = safeGoal > 0 ? Math.min(Math.max(points / safeGoal, 0), 1) : 1;
  const percentage = ratio * 100;

  const fallbackMilestones = Array.from({ length: 6 }, (_, index) =>
    Math.round((safeGoal / 5) * index)
  );

  let displayMilestones =
    normalizedMilestones.length > 0 ? normalizedMilestones : fallbackMilestones;

  if (displayMilestones[0] !== 0) {
    displayMilestones = [0, ...displayMilestones];
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.pointsContainer}>
          <Image source={require("@/assets/icons/coinxinha.png")} style={styles.coinIcon} />

          {loading ? (
            <ActivityIndicator color={theme.colors.textLight} size="small" />
          ) : (
            <Text style={styles.pointsText}>{points}</Text>
          )}
        </View>

        {showRewardsButton && (
          <TouchableOpacity
            style={styles.rewardsButton}
            onPress={() => router.push("/(tabs)/loyalty")}
          >
            <Text style={styles.rewardsText}>Recompensas</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>

        <View style={styles.milestonesRow}>
          {displayMilestones.map((milestone) => (
            <Text key={milestone} style={styles.milestoneText}>
              {milestone}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme, bannerTheme: LoyaltyBannerTheme) =>
  StyleSheet.create({
    container: {
      width: "100%",
      paddingVertical: bannerTheme.paddingVertical,
      paddingHorizontal: bannerTheme.paddingHorizontal,
      marginTop: 0,
      backgroundColor: bannerTheme.backgroundColor,
      overflow: "hidden",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.sm,
    },
    pointsContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    coinIcon: {
      width: bannerTheme.coinIcon,
      height: bannerTheme.coinIcon,
      marginRight: theme.spacing.xs + theme.spacing.xxs,
    },
    pointsText: {
      color: theme.colors.textLight,
      fontSize: 28,
      fontWeight: "bold",
    },
    rewardsButton: {
      backgroundColor: bannerTheme.rewardButtonBackground,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    rewardsText: {
      color: bannerTheme.rewardButtonText,
      fontWeight: "bold",
      fontSize: 12,
      textTransform: "uppercase",
    },
    progressContainer: {
      marginTop: theme.spacing.xs,
    },
    progressBackground: {
      height: bannerTheme.progressHeight,
      borderRadius: bannerTheme.progressHeight / 2,
      backgroundColor: bannerTheme.progressTrack,
      overflow: "hidden",
    },
    progressFill: {
      height: bannerTheme.progressHeight,
      borderRadius: bannerTheme.progressHeight / 2,
      backgroundColor: bannerTheme.progressColor,
    },
    milestonesRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: theme.spacing.xs,
    },
    milestoneText: {
      color: bannerTheme.milestoneColor,
      fontSize: 11,
    },
  });
