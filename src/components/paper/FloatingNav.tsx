/**
 * Floating bottom nav (handoff Floating-nav spec): white pill (76px, radius 38,
 * soft float shadow + 1px hairline) with 4 route tabs and a raised peach FAB in
 * the center that opens the Smart Log drawer. Active tab = purple (home/profile
 * also get a soft interior fill). Mobile-only.
 */
import type { ComponentType } from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '../Text';
import { useTheme } from '../../theme/ThemeProvider';
import { useSmartLog } from './smartlog/SmartLogProvider';
import {
  HomeNavIcon,
  CalendarNavIcon,
  StatsNavIcon,
  UserNavIcon,
  PlusIcon,
} from '../icons/Glyphs';

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

type NavIcon = ComponentType<{ size?: number; color?: string; fill?: string }>;
interface TabMeta {
  icon: NavIcon;
  labelKey: string;
  /** Home & profile get a soft interior fill when active. */
  fillsWhenActive?: boolean;
}
const TABS: Record<string, TabMeta> = {
  index: { icon: HomeNavIcon, labelKey: 'tabs.today', fillsWhenActive: true },
  calendar: { icon: CalendarNavIcon, labelKey: 'tabs.calendar' },
  stats: { icon: StatsNavIcon, labelKey: 'tabs.stats' },
  profile: { icon: UserNavIcon, labelKey: 'tabs.profile', fillsWhenActive: true },
};

const ACTIVE_FILL = 'rgba(166,115,241,0.15)';

export function FloatingNav({ state, navigation }: TabBarProps) {
  const { t } = useTranslation();
  const { colors, brand } = useTheme();
  const insets = useSafeAreaInsets();
  const smartLog = useSmartLog();

  const routes = state.routes;
  const left = routes.slice(0, 2);
  const right = routes.slice(2);

  const renderTab = (route: TabRoute) => {
    const meta = TABS[route.name];
    if (!meta) return null;
    const idx = routes.findIndex((r) => r.key === route.key);
    const focused = state.index === idx;
    const color = focused ? brand.purple : colors.ink3;
    const Icon = meta.icon;
    return (
      <Pressable
        key={route.key}
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        }}
        style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 6, opacity: focused ? 1 : 0.85 }}
      >
        <Icon size={22} color={color} fill={meta.fillsWhenActive && focused ? ACTIVE_FILL : 'none'} />
        <Text variant="label" weight={focused ? 'bold' : 'medium'} color={color} numberOfLines={1}>
          {t(meta.labelKey)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + 18,
        alignItems: 'center',
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: colors.surface,
          borderRadius: 38,
          paddingHorizontal: 14,
          height: 76,
          width: '100%',
          maxWidth: 736,
          borderWidth: 1,
          borderColor: colors.hairline,
          boxShadow: '0 14px 40px rgba(0,0,0,0.10)',
        }}
      >
        {left.map(renderTab)}

        {/* center FAB — opens Smart Log */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Smart Log"
          onPress={() => smartLog.open()}
          style={({ pressed }) => ({
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: brand.peach,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 6,
            marginTop: -28,
            boxShadow: '0 10px 22px rgba(252,164,91,0.5)',
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
        >
          <PlusIcon size={26} color="#fff" />
        </Pressable>

        {right.map(renderTab)}
      </View>
    </View>
  );
}
