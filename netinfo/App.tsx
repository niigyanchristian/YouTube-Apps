import React, { useState, useRef, useEffect } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import OfflineNotice from "./components/OfflineNotice";
import {
  StyleSheet,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function App() {
  const [connectionInfo, setConnectionInfo] = useState<NetInfoState | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Monitor network connection
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnectionInfo(state);
      setIsConnected(state.isConnected as boolean);
      console.log("Connection type", state.type);
      console.log("Connection type", state);
      console.log("Is connected?", state.isConnected);
    });

    // Initial network check
    NetInfo.fetch().then((state) => {
      setConnectionInfo(state);
      setIsConnected(state.isConnected as boolean);
    });

    return () => unsubscribe();
  }, []);

  const simulateOffline = () => {
    alert(
      "In a real app, turn off your WiFi/mobile data to test the offline notification!"
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      {/* Background Gradient */}
      <View style={styles.backgroundGradient}>
        <View style={styles.gradientOverlay} />

        {/* Floating Particles */}
        <FloatingParticles />
      </View>

      {/* Offline Notice */}
      <OfflineNotice />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Network Monitor</Text>
            <Text style={styles.headerSubtitle}>
              Real-time connectivity tracking
            </Text>
          </View>

          {/* Connection Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <ConnectionIcon isConnected={isConnected} />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {connectionInfo?.type || "Checking..."}
                </Text>
              </View>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isConnected ? "#10b981" : "#ef4444" },
                ]}
              />
            </View>

            {connectionInfo && (
              <View style={styles.connectionDetails}>
                <DetailRow
                  label="Connection Type"
                  value={connectionInfo.type}
                />
                <DetailRow
                  label="Internet Reachable"
                  value={connectionInfo.isInternetReachable ? "Yes" : "No"}
                />
                <DetailRow
                  label="Connection Status"
                  value={connectionInfo.isConnected ? "Active" : "Inactive"}
                />
              </View>
            )}
          </View>

          {/* Feature Cards */}
          <View style={styles.featuresContainer}>
            <FeatureCard
              icon="🔔"
              title="Smart Notifications"
              description="Get instant alerts when your connection changes"
              color="#8b5cf6"
            />

            <FeatureCard
              icon="📊"
              title="Real-time Monitoring"
              description="Continuous network status tracking and reporting"
              color="#06b6d4"
            />

            <FeatureCard
              icon="⚡"
              title="Instant Recovery"
              description="Automatic reconnection detection and status updates"
              color="#f59e0b"
            />
          </View>

          {/* Demo Button */}
          <TouchableOpacity
            style={styles.demoButton}
            onPress={simulateOffline}
            activeOpacity={0.8}
          >
            <Text style={styles.demoButtonText}>Test Offline Mode</Text>
            <View style={styles.demoButtonIcon}>
              <Text style={styles.demoButtonIconText}>🧪</Text>
            </View>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Turn off your internet connection to see the offline notification
              in action
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Connection Icon Component
function ConnectionIcon({ isConnected }: { isConnected: boolean }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isConnected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isConnected]);

  return (
    <Animated.View
      style={[
        styles.connectionIcon,
        {
          backgroundColor: isConnected ? "#10b981" : "#ef4444",
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Text style={styles.connectionIconText}>{isConnected ? "📶" : "📵"}</Text>
    </Animated.View>
  );
}

// Detail Row Component
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <View style={[styles.featureCard, { borderLeftColor: color }]}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

// Floating Particles Component
function FloatingParticles() {
  const particles = Array.from({ length: 6 }, (_, i) => i);

  return (
    <View style={styles.particlesContainer}>
      {particles.map((particle) => (
        <FloatingParticle key={particle} delay={particle * 1000} />
      ))}
    </View>
  );
}

function FloatingParticle({ delay }: { delay: number }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.8,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.3,
              duration: 6000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    setTimeout(animate, delay);
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          opacity: opacityAnim,
          transform: [
            {
              translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [height, -50],
              }),
            },
            {
              translateX: floatAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 30, -20],
              }),
            },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6366f1",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor:
      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)",
    // background: "#6366f1",
  },
  particlesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    left: Math.random() * width,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  statusCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  connectionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  connectionIconText: {
    fontSize: 20,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connectionDetails: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  demoButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  demoButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 10,
  },
  demoButtonIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  demoButtonIconText: {
    fontSize: 16,
  },
  footer: {
    alignItems: "center",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
});
