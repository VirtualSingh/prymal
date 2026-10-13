import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import { HomeScreen } from "./src/screens/HomeScreen";

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <HomeScreen />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
