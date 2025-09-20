import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Alert,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    checkBiometricSupport();

    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for fingerprint icon
    startPulseAnimation();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricSupported(compatible);

    if (compatible) {
      const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
      if (!savedBiometrics) {
        Alert.alert(
          "Biometric record not found",
          "Please verify your identity with your password",
          [{ text: "OK" }]
        );
      }

      const biometricTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (
        biometricTypes.includes(
          LocalAuthentication.AuthenticationType.FINGERPRINT
        )
      ) {
        setBiometricType("Fingerprint");
      } else if (
        biometricTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        setBiometricType("Face ID");
      } else {
        setBiometricType("Biometric");
      }
    }
  };

  const startPulseAnimation = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!isAuthenticated) {
        startPulseAnimation();
      }
    });
  };

  const handleBiometricAuth = async () => {
    if (!isBiometricSupported) {
      Alert.alert(
        "Error",
        "Biometric authentication is not supported on this device"
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with your biometric credential",
        cancelLabel: "Cancel",
        fallbackLabel: "Use Passcode",
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAuthenticated(true);

        // Success animation
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (result.error === "user_cancel") {
        // User cancelled
      } else {
        Alert.alert("Authentication Failed", "Please try again");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred during authentication");
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    startPulseAnimation();
  };

  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={120} color="#10b981" />
          </View>

          <Text style={styles.successTitle}>Welcome!</Text>
          <Text style={styles.successSubtitle}>
            You have been successfully authenticated
          </Text>

          <View style={styles.userInfoContainer}>
            <Ionicons name="person-circle" size={80} color="#94a3b8" />
            <Text style={styles.userText}>Secure Access Granted</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out" size={24} color="#f1f5f9" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SecureApp</Text>
          <Text style={styles.logoSubtext}>Biometric Authentication</Text>
        </View>

        <Animated.View
          style={[
            styles.fingerprintContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.fingerprintButton}
            onPress={handleBiometricAuth}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons
              name="finger-print"
              size={80}
              color={isLoading ? "#64748b" : "#3b82f6"}
            />
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.instructionText}>
          {isBiometricSupported
            ? `Touch the ${biometricType.toLowerCase()} sensor to authenticate`
            : "Biometric authentication not available"}
        </Text>

        {isLoading && <Text style={styles.loadingText}>Authenticating...</Text>}

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={24} color="#4ade80" />
            <Text style={styles.featureText}>Secure</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="flash" size={24} color="#fbbf24" />
            <Text style={styles.featureText}>Fast</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="lock-closed" size={24} color="#f87171" />
            <Text style={styles.featureText}>Private</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "transparent",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: "#94a3b8",
    opacity: 0.9,
  },
  fingerprintContainer: {
    marginBottom: 40,
  },
  fingerprintButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  instructionText: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
    fontStyle: "italic",
    marginBottom: 20,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 40,
  },
  featureItem: {
    alignItems: "center",
  },
  featureText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 8,
    fontWeight: "500",
  },
  // Success screen styles
  successIconContainer: {
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  userInfoContainer: {
    alignItems: "center",
    marginBottom: 50,
    padding: 20,
    backgroundColor: "#1e293b",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  userText: {
    fontSize: 16,
    color: "#cbd5e1",
    marginTop: 12,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  logoutButtonText: {
    fontSize: 16,
    color: "#f8fafc",
    marginLeft: 8,
    fontWeight: "500",
  },
});
