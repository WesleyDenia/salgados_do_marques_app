import { memo } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppTheme } from "@/constants/theme";

type ListModalProps<T> = {
  visible: boolean;
  title: string;
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactElement;
  onClose: () => void;
  emptyMessage?: string;
  theme: AppTheme;
};

function ListModal<T>({
  visible,
  title,
  data,
  keyExtractor,
  renderItem,
  onClose,
  emptyMessage,
  theme,
}: ListModalProps<T>) {
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <FlatList
            data={data}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => renderItem(item)}
            ListEmptyComponent={
              emptyMessage ? <Text style={styles.empty}>{emptyMessage}</Text> : null
            }
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    card: {
      backgroundColor: theme.general.screenBackground,
      padding: 20,
      maxHeight: "70%",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 12,
    },
    closeButton: {
      marginTop: 12,
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    closeText: {
      color: theme.colors.textLight,
      fontWeight: "600",
    },
    empty: {
      textAlign: "center",
      marginTop: 16,
      color: theme.colors.textSecondary,
    },
  });

export default memo(ListModal) as typeof ListModal;
