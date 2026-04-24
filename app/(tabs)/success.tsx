import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import FeedbackActionScreen, { FeedbackSummaryText } from "@/components/feedback/FeedbackActionScreen";

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId?: string;
    storeName?: string;
    scheduledLabel?: string;
  }>();

  return (
    <FeedbackActionScreen
      eyebrow="Encomenda confirmada"
      title="Tudo certo com o seu checkout."
      body="A sua encomenda foi enviada com sucesso. Pode acompanhar o estado em Encomendas."
      summary={
        params.orderId || params.storeName || params.scheduledLabel ? (
          <View style={styles.summary}>
            {params.orderId ? <FeedbackSummaryText>Pedido #{params.orderId}</FeedbackSummaryText> : null}
            {params.storeName ? <FeedbackSummaryText>{params.storeName}</FeedbackSummaryText> : null}
            {params.scheduledLabel ? <FeedbackSummaryText>{params.scheduledLabel}</FeedbackSummaryText> : null}
          </View>
        ) : undefined
      }
      primaryLabel="Ver encomendas"
      secondaryLabel="Voltar ao menu"
      onPrimaryPress={() => router.replace("/(tabs)/orders")}
      onSecondaryPress={() => router.replace("/(tabs)/menu")}
    />
  );
}

const styles = {
  summary: {
    gap: 4,
  },
};
