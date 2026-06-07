/**
 * Dedicated "AI กำลังวิเคราะห์" state — a spinning purple/peach ring around 🧠
 * plus three step chips that light up in sequence. Honors reduced-motion: the
 * ring stops and the content stays (handover/web parity).
 */
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  useReducedMotion,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { useTheme } from '../../../theme/ThemeProvider';

export function SLAnalyzing() {
  const { t } = useTranslation();
  const { colors, brand, radius, space } = useTheme();
  const reduceMotion = useReducedMotion();
  const spin = useSharedValue(0);
  const [step, setStep] = useState(0);

  const steps = [t('smartlog.stepMood'), t('smartlog.stepTrigger'), t('smartlog.stepSummary')];

  useEffect(() => {
    if (!reduceMotion) {
      spin.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.linear }), -1);
    }
    const id = setInterval(() => setStep((s) => (s + 1) % 3), 900);
    return () => {
      cancelAnimation(spin);
      clearInterval(id);
    };
  }, [reduceMotion, spin]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  return (
    <View style={{ alignItems: 'center', gap: space.xl, paddingVertical: space.x2 }}>
      <View style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 96,
              height: 96,
              borderRadius: 48,
              borderWidth: 5,
              borderColor: brand.purple,
              borderTopColor: brand.peach,
              borderRightColor: brand.peach,
            },
            ringStyle,
          ]}
        />
        <Text style={{ fontSize: 38 }}>🧠</Text>
      </View>

      <Text variant="title" center>
        {t('smartlog.analyzing')}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm }}>
        {steps.map((label, i) => {
          const active = i === step;
          return (
            <View
              key={label}
              style={{
                backgroundColor: active ? brand.purple : colors.surface2,
                borderRadius: radius.pill,
                paddingHorizontal: space.md,
                paddingVertical: 7,
              }}
            >
              <Text variant="label" weight="medium" color={active ? '#fff' : colors.ink3}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
