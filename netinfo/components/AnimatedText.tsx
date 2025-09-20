import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ViewProps, 
  Animated 
} from "react-native";

interface AnimatedTextProps extends ViewProps {
  text: string;
  penColor?: string;
  textColor?: string;
  fontSize?: number;
  toggle?: boolean;
  fontWeight?: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
  textAlign?: "left" | "center" | "right";
  delay?: number;
}

function AnimatedText({
  text,
  penColor,
  textColor = "#333333",
  fontSize = 14,
  fontWeight = "500",
  textAlign = "left",
  toggle = false,
  delay = 0,
  ...others
}: AnimatedTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Initial animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }, delay);

    // Typing animation
    const typingTimer = setTimeout(() => {
      if (currentIndex < text.length) {
        const timer = setInterval(() => {
          setCurrentIndex((prevIndex) => {
            if (prevIndex < text.length) {
              setDisplayText(text.substring(0, prevIndex + 1));
              return prevIndex + 1;
            } else {
              clearInterval(timer);
              setIsComplete(true);
              return prevIndex;
            }
          });
        }, 50); // Typing speed

        return () => clearInterval(timer);
      }
    }, delay + 300);

    return () => {
      clearTimeout(typingTimer);
    };
  }, [text, currentIndex, delay]);

  // Reset when text changes
  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
    setIsComplete(false);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);
  }, [text]);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]} 
      {...others}
    >
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: fontSize,
              fontWeight: fontWeight,
              textAlign: textAlign,
            }
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {displayText}
        </Text>
        
        {/* Typing Cursor */}
        {!isComplete && (
          <TypingCursor color={textColor} />
        )}
      </View>
    </Animated.View>
  );
}

// Typing Cursor Component
function TypingCursor({ color }: { color: string }) {
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ])
    );
    blink.start();

    return () => blink.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.cursor,
        {
          backgroundColor: color,
          opacity: blinkAnim,
        }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    justifyContent: "center",
    marginVertical: 2,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  text: {
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  cursor: {
    width: 2,
    height: 16,
    marginLeft: 2,
    borderRadius: 1,
  },
});

export default AnimatedText;