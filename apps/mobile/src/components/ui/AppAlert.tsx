import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Platform,
  Alert,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { typography, borderRadius, spacing } from '../../theme';

interface AlertButton {
  text: string;
  style?: 'cancel' | 'destructive' | 'default';
  onPress?: () => void;
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

interface AppAlertContextValue {
  show: (config: AlertConfig) => void;
}

const AppAlertContext = createContext<AppAlertContextValue>({ show: () => {} });

export function useAppAlert() {
  return useContext(AppAlertContext);
}

let globalShow: ((config: AlertConfig) => void) | null = null;

export function showAlert(config: AlertConfig) {
  if (Platform.OS !== 'web' || !globalShow) {
    Alert.alert(
      config.title,
      config.message,
      config.buttons.map((b) => ({
        text: b.text,
        style: b.style,
        onPress: b.onPress,
      })),
    );
    return;
  }
  globalShow(config);
}

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const show = useCallback((cfg: AlertConfig) => {
    setConfig(cfg);
    setVisible(true);
  }, []);

  globalShow = show;

  const handlePress = (btn: AlertButton) => {
    setVisible(false);
    btn.onPress?.();
  };

  if (!config) return <>{children}</>;

  return (
    <AppAlertContext.Provider value={{ show }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
          }}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: colors.surfaceContainerHigh,
              borderRadius: borderRadius.xl,
              borderWidth: 1,
              borderColor: colors.outlineVariant + '60',
              width: '100%',
              maxWidth: 340,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 8,
              overflow: 'hidden',
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={{ padding: spacing.lg }}>
              <Text
                style={[
                  typography.titleLg,
                  { color: colors.onSurface, marginBottom: spacing.xs },
                ]}
              >
                {config.title}
              </Text>
              {config.message ? (
                <Text
                  style={[
                    typography.bodyMd,
                    { color: colors.onSurfaceVariant, lineHeight: 20 },
                  ]}
                >
                  {config.message}
                </Text>
              ) : null}
            </View>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.outlineVariant + '40',
                flexDirection: config.buttons.length > 2 ? 'column' : 'row',
                justifyContent: 'flex-end',
              }}
            >
              {config.buttons.map((btn, i) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';
                const isStacked = config.buttons.length > 2;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handlePress(btn)}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      ...(isStacked
                        ? {
                            width: '100%',
                            borderTopWidth: i > 0 ? 1 : 0,
                            borderTopColor: colors.outlineVariant + '40',
                          }
                        : {
                            flex: isCancel ? 1 : undefined,
                            borderLeftWidth: i > 0 ? 1 : 0,
                            borderLeftColor: colors.outlineVariant + '40',
                          }),
                    }}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        typography.labelLg,
                        {
                          color: isDestructive
                            ? colors.error
                            : isCancel
                              ? colors.onSurfaceVariant
                              : colors.primary,
                          textAlign: 'center',
                        },
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </AppAlertContext.Provider>
  );
}
