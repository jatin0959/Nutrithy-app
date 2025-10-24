// useIsMobile.ts (React Native / Expo)
// Replaces window.matchMedia logic with Dimensions API.

import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(
    Dimensions.get('window').width < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleChange = ({ window }) => {
      setIsMobile(window.width < MOBILE_BREAKPOINT);
    };

    const subscription = Dimensions.addEventListener('change', handleChange);
    return () => subscription?.remove?.();
  }, []);

  return isMobile;
}
