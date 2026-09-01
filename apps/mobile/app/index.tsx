import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, InputField } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import View from '@expo/html-elements/build/primitives/View';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-8 bg-background">
      <View className="w-full px-4">
      </View>
    </SafeAreaView>
  );
}
