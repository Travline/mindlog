import { Slot, Tabs } from "expo-router";
import { Home, User } from "lucide-react-native";

export default function AppLayout() {
  return <Tabs screenOptions={{ tabBarActiveTintColor: 'black' }}>
    <Tabs.Screen
      name="home"
      options={{
        title: 'Inicio',
        tabBarIcon: ({ color }) => <Home color={color} />,
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        title: 'Perfil',
        tabBarIcon: ({ color }) => <User color={color} />,
      }}
    />
  </Tabs>;
}
