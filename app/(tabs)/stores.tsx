import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { Search } from "lucide-react-native";

import { useThemeMode } from "@/context/ThemeContext";
import { useStores } from "@/hooks/useStores";
import { AppTheme } from "@/constants/theme";
import { Store } from "@/types";

type Coordinates = { lat: number; lng: number };

export default function StoresScreen() {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { stores, loading, error, fetchStores } = useStores();

  const [cityFilter, setCityFilter] = useState("");
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  const normalizedFilters = useMemo(
    () => ({
      city: cityFilter.trim() || undefined,
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    }),
    [cityFilter, coords],
  );

  const loadStores = useCallback(async () => {
    await fetchStores(normalizedFilters);
  }, [fetchStores, normalizedFilters]);

  const requestLocation = useCallback(async () => {
    try {
      setRequestingLocation(true);
      setLocationDenied(false);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        setCoords(null);
        setLocationDenied(true);
        await fetchStores({
          city: cityFilter.trim() || undefined,
        });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nextCoords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setCoords(nextCoords);
      await fetchStores({
        city: cityFilter.trim() || undefined,
        lat: nextCoords.lat,
        lng: nextCoords.lng,
      });
    } catch (err) {
      console.error("Erro ao obter localização:", err);
      Alert.alert("Localização", "Não foi possível obter sua localização agora.");
      setCoords(null);
      await fetchStores({
        city: cityFilter.trim() || undefined,
      });
    } finally {
      setRequestingLocation(false);
    }
  }, [cityFilter, fetchStores]);

  useEffect(() => {
    void requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenNavigation = useCallback((store: Store) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}&travelmode=driving`;

    Linking.openURL(url).catch((err) => {
      console.error("Erro ao abrir o mapa:", err);
      Alert.alert("Navegação", "Não foi possível abrir o Google Maps.");
    });
  }, []);


  const renderStore = useCallback(
    ({ item }: { item: Store }) => {
      const distanceLabel =
        typeof item.distance_km === "number" ? `${item.distance_km.toFixed(1)} km` : null;

      return (
        <View style={[styles.storeCard, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.storeName}>{item.name}</Text>
            <View style={[styles.typeBadge, item.type === "principal" ? styles.typePrincipal : styles.typeRevenda]}>
              <Text style={styles.typeBadgeText}>{item.type === "principal" ? "Principal" : "Revenda"}</Text>
            </View>
          </View>
          <Text style={styles.storeAddress}>{item.address}</Text>
          <Text style={styles.storeCity}>{item.city}</Text>
          {item.phone ? <Text style={styles.storePhone}>Tel: {item.phone}</Text> : null}
          {distanceLabel ? (
            <Text style={styles.storeDistance}>
              Distância aproximada: <Text style={styles.storeDistanceValue}>{distanceLabel}</Text>
            </Text>
          ) : null}

          <TouchableOpacity style={styles.mapButton} onPress={() => handleOpenNavigation(item)}>
            <Text style={styles.mapButtonText}>Abrir no Google Maps</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [handleOpenNavigation, styles, theme],
  );

  const isRefreshing = loading && stores.length > 0;

  return (
    <View style={styles.screen}>
      <View style={styles.filtersContainer}>
        <Text style={styles.title}>Lojas próximas</Text>
        <Text style={styles.subtitle}>
          Veja os pontos de venda do Coinxinhas – Salgados do Marquês.
        </Text>

        {locationDenied ? (
          <Text style={styles.alertText}>
            Permita o acesso à localização para ordenar pelas lojas mais próximas.
          </Text>
        ) : null}

        <View style={styles.filterRow}>
          <TextInput
            style={styles.filterInput}
            placeholder="Filtrar por cidade"
            placeholderTextColor={theme.colors.textSecondary}
            value={cityFilter}
            onChangeText={setCityFilter}
            autoCapitalize="words"
          />
          <TouchableOpacity style={styles.filterButton} onPress={loadStores}>
            <Search size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.locationButton, requestingLocation && { opacity: 0.6 }]}
          disabled={requestingLocation}
          onPress={requestLocation}
        >
          {requestingLocation ? (
            <ActivityIndicator color={theme.colors.textLight} />
          ) : (
            <Text style={styles.locationButtonText}>
              {coords ? "Atualizar localização" : "Usar minha localização"}
            </Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStore}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>Nenhuma loja encontrada para os filtros selecionados.</Text>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={loadStores}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListFooterComponent={
          loading && stores.length === 0 ? (
            <ActivityIndicator style={{ marginVertical: theme.spacing.xl }} color={theme.colors.primary} />
          ) : null
        }
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.general.screenBackground,
    },
    listContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.lg,
    },
    filtersContainer: {
      paddingTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
      backgroundColor: theme.general.screenBackground,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 15,
    },
    alertText: {
      color: theme.colors.secondary,
      fontSize: 14,
    },
    errorText: {
      color: theme.colors.secondary,
      fontSize: 14,
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 0,
    },
    filterInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.general.borderColor,
      borderRadius: theme.radius.sm,
      borderRightWidth: 0,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.cardBackground,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    filterButton: {
      justifyContent: "center",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      borderTopRightRadius: theme.radius.sm,
      borderBottomRightRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderLeftWidth: 0,
    },
    locationButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.secondary,
      marginBottom: theme.spacing.md,
    },
    locationButtonText: {
      color: theme.colors.textLight,
      fontWeight: "600",
    },
    storeCard: {
      padding: theme.spacing.lg,
      borderRadius: theme.radius.sm,
      gap: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.general.borderColor,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    storeName: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      flex: 1,
    },
    typeBadge: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: theme.radius.pill,
    },
    typePrincipal: {
      backgroundColor: "rgba(145,2,2,0.15)",
    },
    typeRevenda: {
      backgroundColor: "rgba(34,197,94,0.15)",
    },
    typeBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.text,
    },
    storeAddress: {
      color: theme.colors.text,
      fontSize: 15,
    },
    storeCity: {
      color: theme.colors.textSecondary,
    },
    storePhone: {
      color: theme.colors.textSecondary,
    },
    storeDistance: {
      color: theme.colors.textSecondary,
      fontSize: 13,
    },
    storeDistanceValue: {
      color: theme.colors.text,
      fontWeight: "700",
    },
    mapButton: {
      marginTop: theme.spacing.sm,
      alignSelf: "flex-start",
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
    },
    mapButtonText: {
      color: theme.colors.textLight,
      fontWeight: "600",
    },
    emptyText: {
      textAlign: "center",
      marginTop: theme.spacing.xl,
      color: theme.colors.textSecondary,
    },
  });
