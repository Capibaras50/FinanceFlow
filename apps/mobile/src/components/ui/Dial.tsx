import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { borderRadius, motion, strokeWidth } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface DialProps {
  /** 0–1. The needle turns once when the hero balance settles. */
  progress?: number;
  size?: number;
}

export function Dial({ progress = 1, size = 72 }: DialProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const turns = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const target = Math.max(0, Math.min(1, progress)) * 360;
    if (reduceMotion) {
      turns.setValue(target);
      return;
    }
    const animation = Animated.timing(turns, {
      toValue: target,
      duration: motion.dial,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, reduceMotion, turns]);

  return (
    <View
      accessible={false}
      style={{
        width: size,
        height: size,
        borderRadius: borderRadius.full,
        borderWidth: strokeWidth.thick,
        borderColor: colors.strokeStrong,
        backgroundColor: colors.surfaceContainerHighest,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        accessible={false}
        style={{
          width: size - 18,
          height: size - 18,
          borderRadius: borderRadius.full,
          borderWidth: strokeWidth.medium,
          borderColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [
            {
              rotate: turns.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }}
      >
        <View
          accessible={false}
          style={{
            position: 'absolute',
            top: -strokeWidth.medium,
            width: 4,
            height: 14,
            borderRadius: borderRadius.full,
            backgroundColor: colors.primarySolid,
          }}
        />
        <View
          accessible={false}
          style={{
            width: 12,
            height: 12,
            borderRadius: borderRadius.full,
            backgroundColor: colors.primarySolid,
          }}
        />
      </Animated.View>
    </View>
  );
}
