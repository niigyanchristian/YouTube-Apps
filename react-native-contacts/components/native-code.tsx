import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  PermissionsAndroid,
  Platform 
} from 'react-native';
import {
  checkPermission, requestPermission, 
  getContactsMatchingString, getAll} from 'react-native-contacts';


interface IContact {
  recordID: string;
  givenName: string;
  familyName: string;
  displayName: string;
  phoneNumbers: Array<{
    label: string;
    number: string;
  }>;
  emailAddresses: Array<{
    label: string;
    email: string;
  }>;
}

const ContactsManager = () => {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermissionFunc();
  }, []);

  const checkPermissionFunc = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );

        console.log('======granted==============================');
        console.log(granted, PermissionsAndroid.RESULTS.GRANTED);
        console.log('=============granted=======================');
        setHasPermission(granted);
      } else {
        // For iOS, check permission through react-native-contacts
        const permission = await checkPermission();
        setHasPermission(permission === 'authorized');
      }
    } catch (error) {
      console.error('Error checking permission:', error);
    }
  };

  const requestPermissionFunc = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contacts Permission',
            message: 'This app needs access to your contacts to display them.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        console.log('==granted==================================');
        console.log(granted, PermissionsAndroid.RESULTS.GRANTED);
        console.log('==granted======granted============================');
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
          loadContacts();
        } else {
          Alert.alert('Permission Denied', 'Cannot access contacts without permission.');
        }
      } else {
        // For iOS
        const permission = await requestPermission();
        if (permission === 'authorized') {
          setHasPermission(true);
          loadContacts();
        } else {
          Alert.alert('Permission Denied', 'Cannot access contacts without permission.');
        }
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('Error', 'Failed to request permission.');
    }
  };

  const loadContacts = async () => {
    
    if (!hasPermission) {
      await requestPermissionFunc();
      return;
    }

    setLoading(true);
    try {
      const contactsList = await getAll();
      console.log('============contactsList========================');
    console.log(contactsList);
    console.log('=========================contactsList===========');
      // Sort contacts alphabetically by display name
      const sortedContacts = contactsList.sort((a, b) => 
        (a.displayName || '').localeCompare(b.displayName || '')
      );
      setContacts(sortedContacts  as IContact[]);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  };

  const searchContacts = async (searchText: string) => {
    if (!hasPermission || searchText.length < 2) {
      return;
    }

    setLoading(true);
    try {
      const searchResults = await getContactsMatchingString(searchText);
      setContacts(searchResults as IContact[]);
    } catch (error) {
      console.error('Error searching contacts:', error);
      Alert.alert('Error', 'Failed to search contacts.');
    } finally {
      setLoading(false);
    }
  };

  const renderContact = ({ item }: { item: IContact }) => (
    <TouchableOpacity 
      style={styles.contactItem}
      onPress={() => showContactDetails(item)}
    >
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>
          {item.displayName || `${item.givenName} ${item.familyName}`.trim() || 'No Name'}
        </Text>
        {item.phoneNumbers.length > 0 && (
          <Text style={styles.contactPhone}>
            {item.phoneNumbers[0].number}
          </Text>
        )}
        {item.emailAddresses.length > 0 && (
          <Text style={styles.contactEmail}>
            {item.emailAddresses[0].email}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const showContactDetails = (contact: IContact) => {
    const phoneNumbers = contact.phoneNumbers.map(p => p.number).join(', ');
    const emails = contact.emailAddresses.map(e => e.email).join(', ');
    
    Alert.alert(
      contact.displayName || 'Contact Details',
      `Phone: ${phoneNumbers || 'None'}\nEmail: ${emails || 'None'}`,
      [{ text: 'OK' }]
    );
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          This app needs permission to access your contacts.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissionFunc}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={loadContacts}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Load Contacts'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.contactCount}>
          {contacts.length} contacts
        </Text>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.recordID}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Loading contacts...' : 'No contacts found. Tap "Load Contacts" to refresh.'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contactCount: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  contactItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 14,
    color: '#666',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
    lineHeight: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
    lineHeight: 22,
  },
});

export default ContactsManager;