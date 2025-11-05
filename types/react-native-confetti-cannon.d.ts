declare module "react-native-confetti-cannon" {
  import { Component } from "react";
  import { ViewStyle } from "react-native";

  interface ConfettiCannonProps {
    count?: number;
    origin?: { x: number; y: number };
    explosionSpeed?: number;
    fallSpeed?: number;
    fadeOut?: boolean;
    autoStart?: boolean;
    style?: ViewStyle;
    onAnimationEnd?: () => void;
  }

  export default class ConfettiCannon extends Component<ConfettiCannonProps> {}
}
