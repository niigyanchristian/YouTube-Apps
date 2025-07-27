import { StyleSheet, StatusBar, View, Text } from "react-native";
import ContactsManager from "./components/ContactsManager";

export default function App() {
  return (
    <View style={styles.container}>
      <ContactsManager />
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
