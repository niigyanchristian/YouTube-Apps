import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import PushNotificationManager from './components/PushNotificationManager';

export default function App() {
  return (
     <PushNotificationManager>
        <View style={styles.container}>
            <Text>Open up App.tsx to start working on your app!</Text>
            <StatusBar style="auto" />
        </View>
     </PushNotificationManager>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
