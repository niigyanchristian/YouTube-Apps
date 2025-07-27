import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  StatusBar,
  Dimensions,
} from "react-native";
import * as Contacts from "expo-contacts";

interface IContact {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  phoneNumbers?: Array<{
    label?: string;
    number?: string;
  }>;
  emails?: Array<{
    label?: string;
    email?: string;
  }>;
}

const { width } = Dimensions.get("window");

const ContactsManager = () => {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [allContacts, setAllContacts] = useState<IContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkPermissionFunc();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setContacts(allContacts);
    } else {
      filterContacts(searchQuery);
    }
  }, [searchQuery, allContacts]);

  const checkPermissionFunc = async () => {
    try {
      const { status } = await Contacts.getPermissionsAsync();
      setHasPermission(status === "granted");
      if (status === "granted") {
        loadContacts();
      }
    } catch (error) {
      console.error("Error checking permission:", error);
    }
  };

  const requestPermissionFunc = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === "granted") {
        setHasPermission(true);
        loadContacts();
      } else {
        Alert.alert(
          "Permission Denied",
          "Cannot access contacts without permission."
        );
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      Alert.alert("Error", "Failed to request permission.");
    }
  };

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
      });

      // Sort contacts alphabetically by name
      const sortedContacts = data.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
      // .filter((item) => item.phoneNumbers);

      setAllContacts(sortedContacts as IContact[]);
      setContacts(sortedContacts as IContact[]);
    } catch (error) {
      console.error("Error loading contacts:", error);
      Alert.alert("Error", "Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = (query: string) => {
    const filtered = allContacts.filter((contact) => {
      const fullName =
        contact.name ||
        `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
      const phoneNumber = contact.phoneNumbers?.[0]?.number || "";
      const email = contact.emails?.[0]?.email || "";

      return (
        fullName.toLowerCase().includes(query.toLowerCase()) ||
        phoneNumber.includes(query) ||
        email.toLowerCase().includes(query.toLowerCase())
      );
    });
    setContacts(filtered);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getInitials = (contact: IContact) => {
    const name =
      contact.name ||
      `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
    if (!name) return "?";

    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const renderContact = ({ item }: { item: IContact }) => {
    const fullName =
      item.name ||
      `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
      "No Name";
    const initials = getInitials(item);
    const avatarBg = getAvatarColor(fullName);

    return (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => showContactDetails(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactName} numberOfLines={1}>
            {fullName}
          </Text>

          {item.phoneNumbers && item.phoneNumbers.length > 0 && (
            <Text style={styles.contactPhone} numberOfLines={1}>
              📞 {item.phoneNumbers[0].number}
            </Text>
          )}

          {item.emails && item.emails.length > 0 && (
            <Text style={styles.contactEmail} numberOfLines={1}>
              ✉️ {item.emails[0].email}
            </Text>
          )}
        </View>

        <View style={styles.chevron}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const showContactDetails = (contact: IContact) => {
    const phoneNumbers =
      contact.phoneNumbers
        ?.map((p) => `${p.label || "Phone"}: ${p.number}`)
        .join("\n") || "";
    const emails =
      contact.emails
        ?.map((e) => `${e.label || "Email"}: ${e.email}`)
        .join("\n") || "";

    Alert.alert(
      contact.name || "Contact Details",
      `${phoneNumbers ? phoneNumbers + "\n\n" : ""}${
        emails || "No additional contact info"
      }`,
      [{ text: "OK" }]
    );
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.permissionContent}>
          <View style={styles.permissionIcon}>
            <Text style={styles.permissionIconText}>👥</Text>
          </View>
          <Text style={styles.permissionTitle}>Access Your Contacts</Text>
          <Text style={styles.permissionMessage}>
            We need permission to access your contacts to display them in the
            app.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermissionFunc}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts</Text>
        <Text style={styles.contactCount}>
          {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity
        style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}
        onPress={loadContacts}
        disabled={loading}
      >
        <Text style={styles.refreshButtonText}>
          {loading ? "🔄 Loading..." : "↻ Refresh Contacts"}
        </Text>
      </TouchableOpacity>

      {/* Contacts List */}
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {loading ? "⏳" : searchQuery ? "🔍" : "📱"}
            </Text>
            <Text style={styles.emptyTitle}>
              {loading
                ? "Loading..."
                : searchQuery
                ? "No matches found"
                : "No contacts"}
            </Text>
            <Text style={styles.emptyMessage}>
              {loading
                ? "Please wait while we load your contacts"
                : searchQuery
                ? `No contacts match "${searchQuery}"`
                : "Tap refresh to load your contacts"}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default ContactsManager;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  permissionContent: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: width - 40,
  },
  permissionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  permissionIconText: {
    fontSize: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  permissionMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  contactCount: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  searchContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: 50,
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 16,
    color: "#999",
  },
  refreshButton: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contactItem: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 14,
    color: "#666",
  },
  chevron: {
    marginLeft: 10,
  },
  chevronText: {
    fontSize: 20,
    color: "#ccc",
    fontWeight: "300",
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});
