import { useRef, useCallback, type ReactNode } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface FocusFadeInProps {
  children: ReactNode;
}

export function FocusFadeIn({ children }: FocusFadeInProps) {
  const translateY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      translateY.setValue(20);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 9,
        tension: 80,
      }).start();
    }, [translateY])
  );

  return (
    <Animated.View style={{ flex: 1, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}
