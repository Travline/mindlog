import React from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Image } from '@/components/ui/image';
import { View } from '@/components/ui/view';
import logo from '@/assets/images/icon.png';
import { Button, ButtonText } from '@/components/ui/button';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-8 bg-background">
      <VStack className="w-full h-full items-center justify-center p-8" space='4xl'>
        <View className="flex-row items-center justify-center gap-4">
          <Image
            source={logo}
            alt="Logo"
            size='xs'
            className="rounded-lg"
          />
          <Text className="text-3xl font-bold text-foreground">
            MindLog
          </Text>
        </View>
        <Text className="text-lg text-foreground text-center">
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </Text>
        <View className="w-full gap-4">
          <Button className='w-full' onPress={() => router.push('/(auth)/register')}>
            <ButtonText className='text-lg'>Registrarse</ButtonText>
          </Button>
          <Button variant='outline' className='w-full' onPress={() => router.push('/(auth)/login')}>
            <ButtonText className='text-lg'>Iniciar Sesión</ButtonText>
          </Button>
        </View>
      </VStack>
    </SafeAreaView>
  );
}