// Toaster.tsx (React Native / Expo)
// Equivalent of your web Toaster using react-native-toast-message.
//
// Install dependencies:
//   npm i react-native-toast-message
//   (optional) npx expo install react-native-safe-area-context

import React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { useColorScheme } from 'react-native';

export function Toaster() {
  const colorScheme = useColorScheme(); // 'light' | 'dark' | null

  const isDark = colorScheme === 'dark';

  return (
    <Toast
      config={{
        success: (props) => (
          <BaseToast
            {...props}
            style={{
              borderLeftColor: isDark ? '#22c55e' : '#16a34a',
              backgroundColor: isDark ? '#1f2937' : '#fff',
            }}
            text1Style={{
              color: isDark ? '#fff' : '#000',
            }}
            text2Style={{
              color: isDark ? '#d1d5db' : '#4b5563',
            }}
          />
        ),
        error: (props) => (
          <ErrorToast
            {...props}
            style={{
              borderLeftColor: '#ef4444',
              backgroundColor: isDark ? '#1f2937' : '#fff',
            }}
            text1Style={{
              color: isDark ? '#fff' : '#000',
            }}
            text2Style={{
              color: isDark ? '#d1d5db' : '#4b5563',
            }}
          />
        ),
      }}
      position="top"
      topOffset={50}
    />
  );
}

// Usage Example:
// ---------------
// import Toast from 'react-native-toast-message';
// import { Toaster } from './Toaster';
//
// export default function App() {
//   return (
//     <>
//       <Toaster />
//       <Button title="Show Toast" onPress={() => Toast.show({
//         type: 'success',
//         text1: 'Hello 👋',
//         text2: 'This is a toast message.'
//       })} />
//     </>
//   );
// }
