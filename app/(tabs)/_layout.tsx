// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { HapticTab } from "@/components/haptic-tab";
import { useThemeMode } from "@/context/ThemeContext";
import { Home, TicketPercent, UtensilsCrossed, Star, User, MapPin } from "lucide-react-native";
import AppHeader from "@/components/AppHeader";

export default function TabLayout() {
  const { theme } = useThemeMode();

  return (
    <>
      <AppHeader />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.tabIconSelected,
          tabBarInactiveTintColor: theme.colors.tabIconDefault,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: theme.general.surface,
            borderTopColor: theme.general.borderColor,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="coupons"
          options={{
            title: "Cupons",
            tabBarIcon: ({ color }) => <TicketPercent size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="menu"
          options={{
            title: "Cardápio",
            tabBarIcon: ({ color }) => <UtensilsCrossed size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="stores"
          options={{
            title: "Lojas",
            tabBarIcon: ({ color }) => <MapPin size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="loyalty"
          options={{
            title: "Fidelidade",
            tabBarIcon: ({ color }) => <Star size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
