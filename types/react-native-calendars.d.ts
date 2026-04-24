declare module "react-native-calendars" {
  import { ComponentType } from "react";

  export type DateData = {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
  };

  export const LocaleConfig: {
    locales: Record<string, unknown>;
    defaultLocale?: string;
  };

  export const Calendar: ComponentType<Record<string, unknown>>;
}
