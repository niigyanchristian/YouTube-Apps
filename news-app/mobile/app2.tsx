import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import {
  StatusBar,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Modal,
  Alert,
  Platform,
  RefreshControl
} from 'react-native';

const API_URL = 'https://7e54a5c9eea9.ngrok-free.app'; 

const { width, height } = Dimensions.get('window');

interface NewsItem {
    id: string;
    title: string;
    content: string;
    timestamp: number;
    author: string;
}


// Configure how notifications are handled
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [expoPushToken, setExpoPushToken] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) { }
    });
    
    // Listen for notifications while app is open
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for notification interactions
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

const registerForPushNotificationsAsync = async (): Promise<
    string | undefined
  > => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Check if permissions are granted
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return;
      }

      // Get Expo Push Token
      try {
       const projectId = Constants.expoConfig?.extra?.eas?.projectId;

        if (!projectId) {
          console.error('No project ID found. Please configure in app.json');
          return;
        }

        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
          })
        ).data;
    if (token) {
      console.log('====================================');
      console.log("INNN");
      console.log('====================================');
    await fetch(`${API_URL}/api/register-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  }
        console.log('Push Token:', token);
        return token
      } catch (error) {
        console.error('Detailed Error getting push token:', error);

        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
      }
    } else {
      console.warn('Must use physical device for Push Notifications');
    }

    

    return token;
  };

  const sendLocalNotification = async (title:string, body:any) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
  };

  const sendPushNotification = async (title:string, body:any) => {
    // This would typically call your backend API
    // For demo, we'll send a local notification
    await sendLocalNotification(title, body);
    
    // In production, you'd call your backend like:
    /*
    await fetch('https://your-backend.com/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: expoPushToken,
        title: title,
        body: body,
      }),
    });
    */
  };

  const loadNews = async () => {
     try {
    const response = await fetch(`${API_URL}/api/news`);
    const data = await response.json();
    setNews(data);
  } catch (error) {
    console.error('Error loading news:', error);
  }
  setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNews();
  };

  const addNews = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle.trim(),
        content: newContent.trim(),
        author: 'Admin'
      }),
    });
    
    const newsItem = await response.json();
    setNews([newsItem, ...news]);
    
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
    
    Alert.alert('Success', 'News published and notification sent!');
  } catch (error) {
    Alert.alert('Error', 'Failed to publish news');
    console.error(error);
  }
  };

const formatTime = (timestamp: string | number | Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>📰 NewsHub</Text>
            <Text style={styles.headerSubtitle}>Stay Updated</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => Alert.alert('Push Token', expoPushToken)}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{news.length}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin Toggle */}
      <View style={styles.adminToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, !isAdmin && styles.toggleButtonActive]}
          onPress={() => setIsAdmin(false)}
        >
          <Text style={[styles.toggleText, !isAdmin && styles.toggleTextActive]}>
            Reader
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isAdmin && styles.toggleButtonActive]}
          onPress={() => setIsAdmin(true)}
        >
          <Text style={[styles.toggleText, isAdmin && styles.toggleTextActive]}>
            Admin
          </Text>
        </TouchableOpacity>
      </View>

      {/* News List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />
        }
      >
        {news.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={styles.emptyTitle}>No News Yet</Text>
            <Text style={styles.emptyText}>
              {isAdmin ? 'Add your first article to get started!' : 'Check back soon for updates'}
            </Text>
          </View>
        ) : (
          news.map((item) => (
            <View key={item.id} style={styles.newsCard}>
              <View style={styles.newsHeader}>
                <Text style={styles.author}>👤 {item.author}</Text>
                <Text style={styles.time}>🕐 {formatTime(item.timestamp)}</Text>
              </View>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsContent}>{item.content}</Text>
              <View style={styles.newsBadge}>
                <Text style={styles.badgeText}>⚡ Breaking News</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Button (Admin Only) */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {/* Add News Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Publish News</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="News Title"
              placeholderTextColor="#94a3b8"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="News Content"
              placeholderTextColor="#94a3b8"
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.publishButton} onPress={addNews}>
              <Text style={styles.publishButtonText}>📤 Publish & Notify</Text>
            </TouchableOpacity>

            <Text style={styles.modalNote}>
              This will send a push notification to all subscribers
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  adminToggle: {
    flexDirection: 'row',
    margin: 20,
  backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#6366f1',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  toggleTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  newsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  time: {
    fontSize: 12,
    color: '#94a3b8',
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
    lineHeight: 28,
  },
  newsContent: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 12,
  },
  newsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#d97706',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748b',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  textArea: {
    height: 150,
    paddingTop: 16,
  },
  publishButton: {
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  publishButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalNote: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 12,
  },
});