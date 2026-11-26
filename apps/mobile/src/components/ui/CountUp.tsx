import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, type StyleProp, type TextStyle } from 'react-native';
import { motion } from '../../theme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface CountUpProps {
  value: number;
  format: (value: number) => string;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

/** Counts a real balance into place once. Static when reduced motion is on. */
export function CountUp({ value, format, style, accessibilityLabel }: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const formatRef = useRef(format);
  const listenerRef = useRef<string | null>(null);
  const [display, setDisplay] = useState(() => format(value));

  useEffect(() => {
    formatRef.current = format;
  }, [format]);

  useEffect(() => {
    if (reduceMotion) {
      progress.stopAnimation();
      setDisplay(formatRef.current(value));
      return;
    }

    progress.setValue(0);
    setDisplay(formatRef.current(0));
    const id = progress.addListener(({ value: current }) => {
      setDisplay(formatRef.current(current));
    });
    listenerRef.current = id;

    const animation = Animated.timing(progress, {
      toValue: value,
      duration: motion.dial,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) setDisplay(formatRef.current(value));
    });

    return () => {
      animation.stop();
      if (listenerRef.current !== null) {
        progress.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, [progress, reduceMotion, value]);

  return (
    <Text
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? formatRef.current(value)}
      maxFontSizeMultiplier={1.35}
      style={style}
    >
      {display}
    </Text>
  );
}
