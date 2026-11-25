import { useRef, useCallback, type ReactNode } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { motion } from '../../theme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface FocusFadeInProps {
  children: ReactNode;
}

/** One weighted entrance per focus: the panel rises into its frame. */
export function FocusFadeIn({ children }: FocusFadeInProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useFocusEffect(
    useCallback(() => {
      if (reduceMotion) {
        opacity.setValue(1);
        translateY.setValue(0);
        return;
      }
      opacity.setValue(0);
      translateY.setValue(14);
      const animation = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: motion.reveal,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 22,
          stiffness: 260,
          mass: 0.7,
          useNativeDriver: true,
        }),
      ]);
      animation.start();
      return () => animation.stop();
    }, [opacity, reduceMotion, translateY])
  );

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}
