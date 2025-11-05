declare module "react-native-confetti" {
  import React from "react";
  import { ViewStyle } from "react-native";

  interface ConfettiProps {
    duration?: number;
    confettiCount?: number;
    timeout?: number;
    untilStopped?: boolean;
    explosionSpeed?: number;
    fallSpeed?: number;
    colors?: string[];
    style?: ViewStyle;
  }

  export default class Confetti extends React.Component<ConfettiProps> {
    startConfetti(): void;
    stopConfetti(): void;
  }
}
