import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  isPlaying: boolean;
  barCount?: number;
  color?: string;
  height?: number;
}

export default function WaveformVisualizer({
  isPlaying,
  barCount = 20,
  color = Colors.primary,
  height = 40,
}: Props) {
  const animations = useRef<Animated.Value[]>(
    Array.from({ length: barCount }, () => new Animated.Value(0.2)),
  ).current;

  useEffect(() => {
    if (isPlaying) {
      const anims = animations.map((anim, i) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(i * 60),
            Animated.timing(anim, {
              toValue: 0.3 + Math.random() * 0.7,
              duration: 300 + Math.random() * 400,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.1 + Math.random() * 0.3,
              duration: 300 + Math.random() * 300,
              useNativeDriver: false,
            }),
          ]),
        );
      });
      Animated.parallel(anims).start();
    } else {
      animations.forEach((anim) =>
        Animated.timing(anim, {
          toValue: 0.15,
          duration: 300,
          useNativeDriver: false,
        }).start(),
      );
    }
  }, [isPlaying]);

  return (
    <View style={[styles.container, { height }]}>
      {animations.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [2, height],
              }),
              opacity: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
});
