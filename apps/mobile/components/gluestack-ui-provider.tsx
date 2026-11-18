import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';

export function GluestackUIProvider({ children }: PropsWithChildren) {
  return <View style={{ flex: 1, backgroundColor: '#ffffff' }}><OverlayProvider><ToastProvider>{children}</ToastProvider></OverlayProvider></View>;
}
