import { ReactNode, useMemo } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  Image,
  ImageSourcePropType,
  ImageStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeMode } from "@/context/ThemeContext";
import { AppTheme } from "@/constants/theme";

type AuthScreenLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  innerContainerStyle?: StyleProp<ViewStyle>;
  showLogo?: boolean;
  logoSource?: ImageSourcePropType;
  logoStyle?: StyleProp<ImageStyle>;
  centerContent?: boolean;
  screenBackgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
};

const defaultLogo = require("@/assets/images/logo_icon.png");

export default function AuthScreenLayout({
  title,
  subtitle,
  children,
  contentContainerStyle,
  innerContainerStyle,
  showLogo = false,
  logoSource = defaultLogo,
  logoStyle,
  centerContent = false,
  screenBackgroundColor,
  titleColor,
  subtitleColor,
}: AuthScreenLayoutProps) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={[styles.safeArea, screenBackgroundColor ? { backgroundColor: screenBackgroundColor } : null]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContainer,
              centerContent && styles.scrollContainerCentered,
              contentContainerStyle,
            ]}
          >
            <View style={[styles.innerContainer, innerContainerStyle]}>
              {showLogo ? (
                <Image source={logoSource} style={[styles.logo, logoStyle]} resizeMode="contain" />
              ) : null}

              <View style={styles.header}>
                <Text style={[styles.title, titleColor ? { color: titleColor } : null]}>{title}</Text>
                {subtitle ? (
                  <Text style={[styles.subtitle, subtitleColor ? { color: subtitleColor } : null]}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>

              {children}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    safeArea: {
      flex: 1,
      backgroundColor: theme.general.screenBackground,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    scrollContainerCentered: {
      justifyContent: "center",
    },
    innerContainer: {
      width: "100%",
      maxWidth: 640,
      alignSelf: "center",
    },
    logo: {
      width: 148,
      height: 148,
      alignSelf: "center",
      marginBottom: 8,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
  });
