/**
 * Soft pre-prompt for notifications — a gentle Paper Desk bottom sheet shown once
 * after login while the OS permission is still undetermined. Asking with context
 * (rather than firing the bare OS prompt) protects iOS's one-shot dialog. Either
 * choice marks the primer "seen" so we never nag again.
 */
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from './BottomSheet';
import { Text } from './Text';
import { Button } from './Button';
import { WashiTape } from './paper/WashiTape';
import { BellIcon } from './icons/Glyphs';
import { useToast } from './Toast';
import { useTheme } from '../theme/ThemeProvider';
import { requestAndRegister, markPrimerSeen } from '../notifications/push';

export function PushPrimerSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, space, brand } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const dismiss = () => {
    markPrimerSeen().catch(() => {});
    onClose();
  };

  const enable = async () => {
    setBusy(true);
    const granted = await requestAndRegister();
    setBusy(false);
    markPrimerSeen().catch(() => {});
    onClose();
    if (!granted) toast.show(t('notifications.deniedHint'), 'error');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={dismiss}
      decoration={<WashiTape color={brand.peach + 'CC'} rotate={-3} width={120} />}
    >
      <View style={{ alignItems: 'center', gap: space.md, paddingTop: space.sm }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: brand.peach + '26',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BellIcon size={34} color={brand.peachShadow} strokeWidth={2} />
        </View>
        <Text variant="title" center>
          {t('notifications.primerTitle')}
        </Text>
        <Text variant="body" center color={colors.ink2}>
          {t('notifications.primerBody')}
        </Text>
        <View style={{ alignSelf: 'stretch', gap: space.sm, marginTop: space.sm }}>
          <Button label={t('notifications.primerEnable')} onPress={enable} loading={busy} />
          <Button label={t('notifications.primerLater')} variant="paper" onPress={dismiss} />
        </View>
      </View>
    </BottomSheet>
  );
}
