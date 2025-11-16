declare module 'expo-status-bar' {
  import { ComponentType } from 'react';

  export const StatusBar: ComponentType<{ style?: 'auto' | 'inverted' | 'light' | 'dark' }>;
}
