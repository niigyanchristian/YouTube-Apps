import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import {
  createBottomTabNavigator,
  BottomTabBarButtonProps,
} from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

const HomeScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Home Screen</Text>
  </View>
);

const SearchScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Search Screen</Text>
  </View>
);

const FavoritesScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Favorites Screen</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Profile Screen</Text>
  </View>
);

const NotificationsScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Notifications Screen</Text>
  </View>
);

export default function App() {
  const CustomTabBarButton = ({
    children,
    onPress,
    accessibilityState,
  }: BottomTabBarButtonProps) => {
    const focused = accessibilityState?.selected;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          styles.customTabButton,
          focused && styles.customTabButtonFocused,
        ]}
      >
        <View
          style={[
            styles.tabButtonInner,
            focused && styles.tabButtonInnerFocused,
          ]}
        >
          {children}
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            let iconSize = focused ? 28 : 24;

            switch (route.name) {
              case "Home":
                iconName = focused ? "home" : "home-outline";
                break;
              case "Search":
                iconName = focused ? "search" : "search-outline";
                break;
              case "Favorites":
                iconName = focused ? "heart" : "heart-outline";
                break;
              case "Notifications":
                iconName = focused ? "notifications" : "notifications-outline";
                break;
              case "Profile":
                iconName = focused ? "person" : "person-outline";
                break;
              default:
                iconName = "home-outline";
            }

            return (
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerFocused,
                ]}
              >
                <Ionicons
                  name={iconName as any}
                  size={iconSize}
                  color={color}
                />
                {focused && <View style={styles.activeDot} />}
              </View>
            );
          },
          tabBarActiveTintColor: "#6366F1",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: "Home",
          }}
        />

        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarLabel: "Search",
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            tabBarLabel: "Favorites",
          }}
        />
        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            tabBarLabel: "Alerts",
            tabBarBadge: 3,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: "Profile",
          }}
        />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Screen Styles
  screenContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  screenText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1F2937",
  },

  // Tab Bar Styles
  tabBar: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 5,
    borderTopWidth: 0,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginHorizontal: 5,
  },
  tabBarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  // Custom Tab Button Styles
  customTabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    marginHorizontal: 2,
  },
  customTabButtonFocused: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  tabButtonInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tabButtonInnerFocused: {
    backgroundColor: "rgba(99, 102, 241, 0.05)",
  },

  // Icon Container Styles
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconContainerFocused: {
    transform: [{ scale: 1.1 }],
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#6366F1",
    marginTop: 2,
  },
});
