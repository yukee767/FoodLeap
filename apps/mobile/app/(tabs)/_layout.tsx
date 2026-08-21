import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#ff6b00' }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="receitas/index" options={{ title: 'Receitas', tabBarIcon: ({ color, size }) => <Ionicons name="restaurant" color={color} size={size} /> }} />
      <Tabs.Screen name="dieta/index" options={{ title: 'Dieta', tabBarIcon: ({ color, size }) => <Ionicons name="clipboard" color={color} size={size} /> }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
