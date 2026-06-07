/**
 * Floating-pill bottom nav with a center peach FAB (Paper Desk signature).
 * The 4 tabs are real routes; the center FAB opens the Smart Log sheet.
 */
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '../Text';
import { useTheme } from '../../theme/ThemeProvider';
import { useSmartLog } from './smartlog/SmartLogProvider';

/** Minimal shape of the props expo-router passes to a custom `tabBar`. */
interface TabRoute {
  key: string;
  name: string;
}
interface TabBarProps {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
}

const GLYPH: Record<string, string> = {
  index: '◔',
  calendar: '▦',
  stats: '◴',
  profile: '◍',
};
const LABEL_KEY: Record<string, string> = {
  index: 'tabs.today',
  calendar: 'tabs.calendar',
  stats: 'tabs.stats',
  profile: 'tabs.profile',
};

export function FloatingNav({ state, navigation }: TabBarProps) {
  const { t } = useTranslation();
  const { colors, radius, brand, space } = useTheme();
  const insets = useSafeAreaInsets();
  const smartLog = useSmartLog();

  const routes = state.routes;
  const left = routes.slice(0, 2);
  const right = routes.slice(2);

  const renderTab = (route: (typeof routes)[number]) => {
    const idx = routes.findIndex((r) => r.key === route.key);
    const focused = state.index === idx;
    const color = focused ? colors.primary : colors.ink3;
    return (
      <Pressable
        key={route.key}
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        }}
        style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 6 }}
      >
        <Text style={{ fontSize: 20, color }}>{GLYPH[route.name] ?? '•'}</Text>
        <Text variant="label" weight={focused ? 'bold' : 'medium'} color={color}>
          {t(LABEL_KEY[route.name] ?? route.name)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 10, alignItems: 'center' }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: radius.pill,
          paddingHorizontal: space.md,
          height: 64,
          width: '92%',
          maxWidth: 440,
          borderWidth: 1,
          borderColor: colors.hairline,
          shadowColor: colors.paperShadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        {left.map(renderTab)}

        {/* center FAB */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Smart Log"
          onPress={() => smartLog.open()}
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: brand.peach,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 4,
            marginTop: -22,
            borderWidth: 3,
            borderColor: colors.bg,
            shadowColor: colors.paperShadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 6,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 30, color: '#fff', marginTop: -2 }}>+</Text>
        </Pressable>

        {right.map(renderTab)}
      </View>
    </View>
  );
}
