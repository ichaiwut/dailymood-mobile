/**
 * Google + Apple sign-in buttons. Native sign-in needs a dev build (handover
 * §2.6) and provisioned backend client IDs, so in Expo Go these render but,
 * when pressed, surface a gentle "coming in the next build" notice instead of
 * silently failing. Wiring the real SDKs is the dev-build milestone.
 *
 * Apple is shown on iOS only (it is required there by App Store §4.8 once
 * Google is offered).
 */
import { View, Platform } from 'react-native';
import { Button } from '../Button';
import { Text } from '../Text';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';

export function SocialButtons({ onUnavailable }: { onUnavailable: () => void }) {
  const { t } = useTranslation();
  const { colors, space } = useTheme();
  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline2 }} />
        <Text variant="label" color={colors.ink3}>
          {t('auth.or')}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline2 }} />
      </View>

      <Button
        variant="paper"
        label={t('auth.continueWithGoogle')}
        onPress={onUnavailable}
        leading={
          <Text variant="label" color={colors.ink}>
            G
          </Text>
        }
      />
      {Platform.OS === 'ios' ? (
        <Button
          variant="ink"
          label={t('auth.continueWithApple')}
          onPress={onUnavailable}
          leading={
            <Text variant="label" color="#fff">

            </Text>
          }
        />
      ) : null}
    </View>
  );
}
