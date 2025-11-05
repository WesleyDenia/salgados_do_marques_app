import { AppTheme } from "./theme";

export type HomeTheme = {
  layout: {
    paddingBottom: number;
  };
  banner: {
    height: number;
    radius: number;
    marginBottom: number;
  };
};

export const getHomeTheme = (theme: AppTheme): HomeTheme => ({
  layout: {
    paddingBottom: theme.spacing.ultra,
  },
  banner: {
    height: 180,
    radius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
  },
});

