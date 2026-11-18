import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GluestackUIProvider } from '../components/gluestack-ui-provider';

export default function RootLayout() {
  return <GluestackUIProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }} /></GluestackUIProvider>;
}
