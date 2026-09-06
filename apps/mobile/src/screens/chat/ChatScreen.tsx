import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
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
  const { colors } = useTheme();
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
  }, [dot1, dot2, dot3, fadeAnim]);

  return (
    <Animated.View
      style={{ opacity: fadeAnim, alignSelf: 'flex-start', maxWidth: '80%', marginBottom: spacing.md, marginLeft: spacing.container }}
      accessibilityLabel="El asistente está escribiendo"
      accessibilityLiveRegion="polite"
    >
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

// Memoized bubble: the Markdown parser is expensive, so avoid re-rendering
// every previous message when a new one arrives.
const MessageBubble = memo(function MessageBubble({ item }: { item: ChatMessage }) {
  const { colors } = useTheme();
  const markdownStyles = useMemo(
    () => ({
      body: { color: colors.onSurface, ...typography.bodyMd },
      heading1: { color: colors.onSurface, fontSize: 20, fontWeight: '700' as const, marginBottom: 4, marginTop: 4 },
      heading2: { color: colors.onSurface, fontSize: 18, fontWeight: '700' as const, marginBottom: 4, marginTop: 4 },
      heading3: { color: colors.onSurface, fontSize: 16, fontWeight: '600' as const, marginBottom: 4, marginTop: 4 },
      strong: { color: colors.primary, fontWeight: '700' as const },
      link: { color: colors.tertiary },
      blockquote: { borderLeftColor: colors.primary, borderLeftWidth: 3, paddingLeft: 8, opacity: 0.8 },
      bullet_list: { marginVertical: 2 },
      ordered_list: { marginVertical: 2 },
      list_item: { marginVertical: 1 },
      code_inline: { backgroundColor: colors.surfaceContainerHighest, color: colors.secondary, paddingHorizontal: 4, borderRadius: 4 },
      fence: { backgroundColor: colors.surfaceContainerHighest, padding: 8, borderRadius: 8, marginVertical: 4 },
      code_block: { backgroundColor: colors.surfaceContainerHighest, padding: 8, borderRadius: 8 },
    }),
    [colors]
  );

  const isUser = item.role === 'user';
  return (
    <View
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        marginBottom: spacing.md,
      }}
      accessibilityLabel={isUser ? `Tú: ${item.message}` : `Asistente: ${item.message}`}
    >
      {isUser ? (
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
          <Markdown style={markdownStyles}>
            {item.message}
          </Markdown>
        </GlassCard>
      )}
    </View>
  );
});

const chatKeyExtractor = (item: ChatMessage) => item.id.toString();

export function ChatScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showError } = useSnackbar();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlashListRef<ChatMessage>>(null);
  const hasScrolledToBottom = useRef(false);

  useEffect(() => {
    if (messages.length === 0 || hasScrolledToBottom.current) return;
    let attempts = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const tryScroll = () => {
      if (attempts >= 10 || hasScrolledToBottom.current) return;
      attempts++;
      flatListRef.current?.scrollToEnd({ animated: true });
      if (attempts < 10) timeout = setTimeout(tryScroll, 300);
    };
    tryScroll();
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [messages]);

  const loadMessages = useCallback(async () => {
    try {
      const data = await chatApi.getMessages(50);
      setMessages(data.reverse());
    } catch {
      showError('Error al cargar mensajes');
    }
  }, [showError]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => <MessageBubble item={item} />,
    []
  );

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
          <TouchableOpacity
            onPress={() => goBackOrHome(navigation)}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
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
            accessibilityRole="button"
            accessibilityLabel="Más opciones"
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

      <FlashList
        ref={flatListRef}
        data={messages}
        keyExtractor={chatKeyExtractor}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: spacing.container, paddingBottom: spacing.md }}
        ListFooterComponent={loading ? <TypingIndicator /> : null}
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
          accessibilityRole="button"
          accessibilityLabel="Adjuntar archivo"
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
            accessibilityLabel="Escribe tu mensaje para el asistente"
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
            accessibilityRole="button"
            accessibilityLabel="Enviar mensaje"
            accessibilityState={{ disabled: !input.trim() || loading }}
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
