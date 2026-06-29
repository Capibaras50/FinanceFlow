import { View, ScrollView, type ViewStyle, type StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ScreenLayout({ children, scroll = true, style }: ScreenLayoutProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[{ flex: 1, paddingHorizontal: spacing.container }, style]}>
      {children}
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}
