import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import FeedbackActionScreen, { FeedbackSummaryText } from "@/components/feedback/FeedbackActionScreen";

export default function ItemAddedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    itemName?: string;
    quantity?: string;
  }>();

  const quantity = Number(params.quantity ?? "0");
  const hasSummary = Boolean(params.itemName) || (Number.isFinite(quantity) && quantity > 0);

  return (
    <FeedbackActionScreen
      eyebrow="Carrinho atualizado"
      title="Item adicionado com sucesso"
      body="O produto ja esta no seu carrinho. Deseja continuar a encomenda ou seguir para o checkout?"
      summary={
        hasSummary ? (
          <View style={styles.summary}>
            {params.itemName ? <FeedbackSummaryText>{params.itemName}</FeedbackSummaryText> : null}
            {quantity > 0 ? <FeedbackSummaryText>Quantidade: {quantity}</FeedbackSummaryText> : null}
          </View>
        ) : undefined
      }
      primaryLabel="Ir para checkout"
      secondaryLabel="Continuar encomenda"
      onPrimaryPress={() => router.replace("/(tabs)/cart")}
      onSecondaryPress={() => router.replace("/(tabs)/menu")}
    />
  );
}

const styles = {
  summary: {
    gap: 4,
  },
};
