import { View, ScrollView, type ViewStyle, type StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface ScreenLayoutProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Reading views (chat, detail) use a narrower centred column on wide screens. */
  variant?: 'default' | 'reading';
}

export function ScreenLayout({ children, scroll = true, style, variant = 'default' }: ScreenLayoutProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { contentMaxWidth, readingMaxWidth } = useResponsiveLayout();
  const maxWidth = variant === 'reading' ? readingMaxWidth : contentMaxWidth;

  const content = (
    <View
      style={[
        {
          flex: 1,
          width: '100%',
          maxWidth,
          alignSelf: 'center',
          paddingHorizontal: spacing.container,
        },
        style,
      ]}
    >
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
          contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing['2xl'], alignItems: 'center' }}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, alignItems: 'center' }}>{content}</View>
      )}
    </View>
  );
}
