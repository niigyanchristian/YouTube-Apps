import React, { useEffect, useRef } from "react";
import Constants from "expo-constants";
import { useNetInfo } from "@react-native-community/netinfo";
import AnimatedText from "./AnimatedText";
import Feather from '@expo/vector-icons/Feather';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Platform 
} from "react-native";


function OfflineNotice() {
  const netInfo = useNetInfo();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim:any = useRef(new Animated.Value(0)).current;
  
  const isOffline = netInfo.type !== "unknown" && netInfo.isInternetReachable === false;

  useEffect(() => {
    if (isOffline) {
      // Slide down and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start();

      // Start pulsing animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          })
        ])
      );
      pulse.start();

    } else {
      // Slide up and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
      
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isOffline]);

  if (!isOffline && opacityAnim === 0) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim }
          ],
          opacity: opacityAnim,
        }
      ]}
    >
      {/* Gradient Background Effect */}
      <View style={styles.gradientContainer}>
        <View style={styles.gradientOverlay} />
        
        {/* Animated Dots Pattern */}
        <View style={styles.dotsPattern}>
          {[...Array(6)].map((_, index) => (
            <AnimatedDot key={index} delay={index * 200} />
          ))}
        </View>
        
        {/* WiFi Icon */}
        <View style={styles.iconContainer}>
          <Feather name="wifi-off" size={24} color="white" />
        </View>
        
        {/* Main Content */}
        <View style={styles.contentContainer}>
          <AnimatedText 
            text="No Internet Connection"
            textColor="#ffffff"
            fontSize={16}
          />
          <AnimatedText 
            text="Please check your network settings"
            textColor="#ffffff"
            fontSize={12}
          />
        </View>
        
        {/* Animated Border */}
        <View style={styles.animatedBorder} />
      </View>
    </Animated.View>
  );
}

// Animated Dot Component
function AnimatedDot({ delay }: {
    delay: any;
}) {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    );
    animate.start();
    
    return () => animate.stop();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.dot,
        { opacity: fadeAnim }
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Constants.statusBarHeight + 10,
    left: 20,
    right: 20,
    zIndex: 1000,
    elevation: 10,
  },
  gradientContainer: {
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    overflow: "hidden",
    minHeight: 80,
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 59, 48, 0.85)", // Red overlay
    borderRadius: 20,
  },
  dotsPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    margin: 2,
  },
  iconContainer: {
    position: "absolute",
    left: 20,
    top: "50%",
    transform: [{ translateY: -12 }],
    zIndex: 2,
  },
  contentContainer: {
    paddingLeft: 60,
    paddingRight: 20,
    paddingVertical: 16,
    alignItems: "flex-start",
    zIndex: 2,
  },
  animatedBorder: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    opacity: 0.8,
  },
});

export default OfflineNotice;