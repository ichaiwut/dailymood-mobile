/**
 * Initial route. Shows a loader while the session restores; the root layout
 * redirects to (auth) or (tabs) once auth status resolves.
 */
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../src/theme/ThemeProvider';

export default function Index() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
