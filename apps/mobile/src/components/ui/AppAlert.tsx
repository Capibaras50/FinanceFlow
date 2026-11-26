import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, Platform, Alert, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { typography, strokeWidth, borderRadius, spacing, layout } from '../../theme';

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
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const show = useCallback((cfg: AlertConfig) => {
    setConfig(cfg);
    setVisible(true);
  }, []);

  useEffect(() => {
    globalShow = show;
  }, [show]);

  const contextValue = useMemo(() => ({ show }), [show]);

  const handlePress = (btn: AlertButton) => {
    setVisible(false);
    btn.onPress?.();
  };

  if (!config) return <>{children}</>;

  return (
    <AppAlertContext.Provider value={contextValue}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType={reduceMotion ? 'none' : 'fade'}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: colors.scrim,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
          }}
          onPress={() => setVisible(false)}
        >
          <Pressable
            accessibilityRole="alert"
            accessibilityLabel={config.title}
            style={{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              borderWidth: strokeWidth.medium,
              borderColor: colors.outline,
              width: '100%',
              maxWidth: 340,
              overflow: 'hidden',
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={{ padding: spacing.lg }}>
              <Text
                accessibilityRole="header"
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
                borderTopWidth: strokeWidth.medium,
                borderTopColor: colors.outlineVariant,
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
                    accessibilityRole="button"
                    accessibilityLabel={btn.text}
                    accessibilityHint={
                      isDestructive ? 'Esta acción no se puede deshacer' : undefined
                    }
                    hitSlop={4}
                    style={{
                      minHeight: layout.touchTarget,
                      justifyContent: 'center',
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.lg,
                      ...(isStacked
                        ? {
                            width: '100%',
                            borderTopWidth: i > 0 ? 1 : 0,
                            borderTopColor: colors.outlineVariant,
                          }
                        : {
                            flex: isCancel ? 1 : undefined,
                            borderLeftWidth: i > 0 ? 1 : 0,
                            borderLeftColor: colors.outlineVariant,
                          }),
                    }}
                    activeOpacity={0.85}
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
