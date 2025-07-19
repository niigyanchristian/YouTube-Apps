import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import ReadingDoc from './components/ReadDoc';

export default function App() {
  return (
    <View style={styles.container}>
      <ScrollView>    
        <ReadingDoc/>
      </ScrollView>
    </View>
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
