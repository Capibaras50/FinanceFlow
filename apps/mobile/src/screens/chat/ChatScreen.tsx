import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useSnackbar } from '../../context/SnackbarContext';
import { useNavigation } from '@react-navigation/native';
import type { RootNavigationProp } from '../../navigation/types';
import { chatApi } from '../../services/api';
import { goBackOrHome } from '../../utils/navigation';
import type { ChatMessage } from '@finance-flow/shared-types';

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -8, duration: 350, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 350, useNativeDriver: true }),
          Animated.delay(500),
        ])
      );

    const fade = Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true });
    fade.start();
    const b1 = bounce(dot1, 0);
    const b2 = bounce(dot2, 200);
    const b3 = bounce(dot3, 400);
    b1.start();
    b2.start();
    b3.start();
    return () => { fade.stop(); b1.stop(); b2.stop(); b3.stop(); };
  }, []);

  const { colors } = useTheme();
  return (
    <Animated.View style={{ opacity: fadeAnim, alignSelf: 'flex-start', maxWidth: '80%', marginBottom: spacing.md, marginLeft: spacing.container }}>
      <GlassCard glowColor={colors.primary} style={{ borderColor: `${colors.primary}40`, paddingHorizontal: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: 6, paddingVertical: spacing.xs }}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={{
                width: 9,
                height: 9,
                borderRadius: 4.5,
                backgroundColor: colors.primary,
                transform: [{ translateY: dot }],
              }}
            />
          ))}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export function ChatScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showError } = useSnackbar();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const hasScrolledToBottom = useRef(false);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (messages.length === 0 || hasScrolledToBottom.current) return;
    let attempts = 0;
    const tryScroll = () => {
      if (attempts >= 10 || hasScrolledToBottom.current) return;
      attempts++;
      flatListRef.current?.scrollToEnd({ animated: true });
      if (attempts < 10) setTimeout(tryScroll, 300);
    };
    tryScroll();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await chatApi.getMessages(50);
      setMessages(data.reverse());
    } catch {
      showError('Error al cargar mensajes');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    const tempUser: ChatMessage = {
      id: Date.now(),
      role: 'user',
      message: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUser]);
    setLoading(true);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await chatApi.sendMessage(text, timezone);
      setMessages((prev) => [...prev, response]);
    } catch {
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        message: 'Lo siento, hubo un error. Intenta de nuevo.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <LinearGradient
        colors={colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.container }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity onPress={() => goBackOrHome(navigation)}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.titleLg, { color: '#FFFFFF' }]}>
              Asistente IA
            </Text>
            <Text style={[typography.bodySm, { color: 'rgba(255,255,255,0.7)' }]}>
              Pregúntame sobre tus finanzas
            </Text>
          </View>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="ellipsis-vertical" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: spacing.container, paddingBottom: spacing.md }}
        initialNumToRender={messages.length}
        maxToRenderPerBatch={messages.length}
        windowSize={messages.length + 1}
        ListFooterComponent={loading ? <TypingIndicator /> : null}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              marginBottom: spacing.md,
            }}
          >
            {item.role === 'user' ? (
              <View
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.xl,
                  borderBottomRightRadius: borderRadius.sm,
                  padding: spacing.md,
                }}
              >
                <Text style={[typography.bodyMd, { color: '#FFFFFF' }]}>
                  {item.message}
                </Text>
              </View>
            ) : (
              <GlassCard
                glowColor={colors.primary}
                style={{ borderColor: `${colors.primary}40`, padding: spacing.md, gap: spacing.xs }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                  <Text style={[typography.labelMd, { color: colors.primary }]}>Finance Flow IA</Text>
                </View>
                <Markdown
                  style={{
                    body: { color: colors.onSurface, ...typography.bodyMd },
                    heading1: { color: colors.onSurface, fontSize: 20, fontWeight: '700', marginBottom: 4, marginTop: 4 },
                    heading2: { color: colors.onSurface, fontSize: 18, fontWeight: '700', marginBottom: 4, marginTop: 4 },
                    heading3: { color: colors.onSurface, fontSize: 16, fontWeight: '600', marginBottom: 4, marginTop: 4 },
                    strong: { color: colors.primary, fontWeight: '700' },
                    link: { color: colors.tertiary },
                    blockquote: { borderLeftColor: colors.primary, borderLeftWidth: 3, paddingLeft: 8, opacity: 0.8 },
                    bullet_list: { marginVertical: 2 },
                    ordered_list: { marginVertical: 2 },
                    list_item: { marginVertical: 1 },
                    code_inline: { backgroundColor: colors.surfaceContainerHighest, color: colors.secondary, paddingHorizontal: 4, borderRadius: 4 },
                    fence: { backgroundColor: colors.surfaceContainerHighest, padding: 8, borderRadius: 8, marginVertical: 4 },
                    code_block: { backgroundColor: colors.surfaceContainerHighest, padding: 8, borderRadius: 8 },
                  }}
                >
                  {item.message}
                </Markdown>
              </GlassCard>
            )}
          </View>
        )}
        ListEmptyComponent={loading ? null :
          <View style={{ alignItems: 'center', marginTop: spacing['2xl'], gap: spacing.md }}>
            <LinearGradient
              colors={colors.gradient.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="sparkles" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[typography.titleLg, { color: colors.onSurface }]}>
              ¿En qué puedo ayudarte?
            </Text>
            <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center', maxWidth: '80%' }]}>
              Pregúntame sobre tus finanzas, presupuestos o proyecciones de ahorro.
            </Text>
          </View>
        }
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          paddingHorizontal: spacing.container,
          paddingVertical: spacing.md,
          paddingBottom: insets.bottom + spacing.md,
          backgroundColor: colors.surfaceContainer,
          borderTopWidth: 1,
          borderTopColor: colors.outlineVariant + '80',
        }}
      >
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.surfaceContainerHigh,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="attach" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceContainerHigh,
            borderRadius: borderRadius.full,
            paddingLeft: spacing.md,
            borderWidth: 1,
            borderColor: colors.outlineVariant + '60',
          }}
        >
          <TextInput
            placeholder="Pregúntame sobre tus finanzas..."
            placeholderTextColor={colors.onSurfaceVariant}
            value={input}
            onChangeText={setInput}
            multiline
            style={[
              typography.bodyMd,
              {
                flex: 1,
                color: colors.onSurface,
                paddingVertical: spacing.sm + 2,
                maxHeight: 100,
              },
            ]}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: !input.trim() || loading ? colors.surfaceContainerHighest : colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              margin: 4,
            }}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
