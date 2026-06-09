/**
 * Global "no internet" popup. DailyMood is internet-only, so when the device
 * loses connectivity we block the UI with a centered Paper Desk modal until the
 * connection returns. Mounted once at the root (app/_layout) so it covers every
 * screen (auth + tabs). NetInfo drives the state; the popup closes itself the
 * moment we're back online, and the onlineManager wiring in _layout refetches
 * every screen's queries on reconnect.
 *
 * Platforms: web uses navigator.onLine, so Chrome DevTools → Network → Offline
 * triggers it. Native requires a dev build (NetInfo is a native module).
 */
import { useEffect, useState } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { Button } from './Button';
import { WashiTape } from './paper/WashiTape';
import { WifiOffIcon } from './icons/Glyphs';
import { useTheme } from '../theme/ThemeProvider';

/** Dev-only: flip to true to preview the popup without going offline. */
const FORCE_OFFLINE_PREVIEW = false;

export function OfflineNotice() {
  const { colors, space, brand } = useTheme();
  const { t } = useTranslation();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // isInternetReachable / isConnected are `null` until the first probe — treat
    // "unknown" as online so the popup never flashes on a cold start while
    // connectivity is still settling. Only a definitive `false` counts as offline.
    return NetInfo.addEventListener((s) =>
      setOffline(s.isConnected === false || s.isInternetReachable === false),
    );
  }, []);

  const visible = __DEV__ ? FORCE_OFFLINE_PREVIEW || offline : offline;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View
          style={{
            width: '90%',
            maxWidth: 360,
            backgroundColor: colors.surface,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 26,
            borderBottomLeftRadius: 26,
            borderBottomRightRadius: 26,
            boxShadow: '0 44px 100px -24px rgba(40,20,10,0.6)',
            paddingHorizontal: space.xl,
            paddingTop: space.x2,
            paddingBottom: space.xl,
            alignItems: 'center',
            gap: space.md,
          }}
        >
          {/* washi tape on the top edge */}
          <View style={styles.washiWrap} pointerEvents="none">
            <WashiTape color={brand.peach + 'CC'} rotate={-3} width={120} />
          </View>

          {/* wifi-off sticker disc — soft danger tint, gentle not alarming */}
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: colors.dangerBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: space.xs,
            }}
          >
            <WifiOffIcon size={34} color={colors.danger} strokeWidth={2} />
          </View>

          <Text variant="title" center>
            {t('offline.title')}
          </Text>
          <Text variant="body" center color={colors.ink2}>
            {t('offline.body')}
          </Text>

          <Button
            label={t('common.retry')}
            onPress={() => {
              NetInfo.refresh();
            }}
            style={{ marginTop: space.sm, alignSelf: 'stretch' }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,19,32,0.46)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  washiWrap: { position: 'absolute', top: -12, left: 0, right: 0, alignItems: 'center', zIndex: 6 },
});
