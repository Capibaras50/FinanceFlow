import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { typography, strokeWidth, spacing, borderRadius, layout, motion } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { SkeletonChatBubble, SkeletonScreen } from '../../components/ui/Skeleton';
import { Glyph } from '../../components/ui/Glyph';
import { useSnackbar } from '../../context/SnackbarContext';
import { useNavigation } from '@react-navigation/native';
import type { RootNavigationProp } from '../../navigation/types';
import { chatApi } from '../../services/api';
import { goBackOrHome } from '../../utils/navigation';
import type { ChatMessage } from '@finance-flow/shared-types';

function TypingIndicator() {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      // No looping motion and no staggered dots: show the static state at once.
      fadeAnim.setValue(1);
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
      return;
    }

    const bounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -8, duration: 350, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 350, useNativeDriver: true }),
          Animated.delay(500),
        ])
      );

    const fade = Animated.timing(fadeAnim, { toValue: 1, duration: motion.reveal, useNativeDriver: true });
    fade.start();
    const b1 = bounce(dot1, 0);
    const b2 = bounce(dot2, 200);
    const b3 = bounce(dot3, 400);
    b1.start();
    b2.start();
    b3.start();
    return () => { fade.stop(); b1.stop(); b2.stop(); b3.stop(); };
  }, [dot1, dot2, dot3, fadeAnim, reduceMotion]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        alignSelf: 'flex-start',
        maxWidth: '80%',
        marginBottom: spacing.md,
        marginLeft: spacing.container,
      }}
      accessibilityLabel="El asistente está escribiendo"
      accessibilityLiveRegion="polite"
    >
      <View
        style={{
          paddingHorizontal: spacing.md,
          backgroundColor: colors.surfaceContainerHigh,
          borderRadius: borderRadius.lg,
          borderWidth: strokeWidth.medium,
          borderColor: colors.outlineVariant,
        }}
      >
        <View accessible={false} style={{ flexDirection: 'row', gap: 6, paddingVertical: spacing.xs }}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={{
                width: 9,
                height: 9,
                borderRadius: 4.5,
                backgroundColor: colors.primary,
                transform: reduceMotion ? undefined : [{ translateY: dot }],
              }}
            />
          ))}
        </View>
      </View>
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
      link: { color: colors.primary },
      blockquote: { borderLeftColor: colors.outline, borderLeftWidth: 2, paddingLeft: 8 },
      bullet_list: { marginVertical: 2 },
      ordered_list: { marginVertical: 2 },
      list_item: { marginVertical: 1 },
      code_inline: { backgroundColor: colors.surfaceContainerHighest, color: colors.onSurface, paddingHorizontal: 4, borderRadius: borderRadius.sm },
      fence: { backgroundColor: colors.surfaceContainerHighest, padding: 8, borderRadius: borderRadius.md, marginVertical: 4 },
      code_block: { backgroundColor: colors.surfaceContainerHighest, padding: 8, borderRadius: borderRadius.md },
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
            backgroundColor: colors.primaryContainer,
            borderWidth: strokeWidth.medium,
            borderColor: colors.outline,
            borderRadius: borderRadius.lg,
            borderBottomRightRadius: borderRadius.sm,
            padding: spacing.md,
          }}
        >
          <Text style={[typography.bodyMd, { color: colors.onPrimaryContainer }]}>
            {item.message}
          </Text>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: colors.surfaceContainerHigh,
            borderWidth: strokeWidth.medium,
            borderColor: colors.outlineVariant,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            gap: spacing.xs,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
            <Ionicons accessible={false} name="sparkles" size={14} color={colors.primary} />
            <Text style={[typography.labelMd, { color: colors.primary }]}>Finance Flow IA</Text>
          </View>
          <Markdown style={markdownStyles}>
            {item.message}
          </Markdown>
        </View>
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
  const [messagesLoading, setMessagesLoading] = useState(true);
  const flatListRef = useRef<FlashListRef<ChatMessage>>(null);
  const hasScrolledToBottom = useRef(false);

  useEffect(() => {
    if (messages.length === 0 || hasScrolledToBottom.current) return;
    let attempts = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const tryScroll = () => {
      if (attempts >= 10 || hasScrolledToBottom.current) return;
      attempts++;
      if (!flatListRef.current) {
        if (attempts < 10) timeout = setTimeout(tryScroll, 300);
        return;
      }
      flatListRef.current.scrollToEnd({ animated: true });
      // One successful scroll is enough; repeated message updates should not
      // re-arm ten timers and yank the user back down while reading history.
      hasScrolledToBottom.current = true;
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
    } finally {
      setMessagesLoading(false);
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
    // A new exchange should follow the conversation again.
    hasScrolledToBottom.current = false;
    setMessages((prev) => [...prev, tempUser]);
    setLoading(true);

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
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomWidth: strokeWidth.medium,
          borderBottomColor: colors.outlineVariant,
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.md,
          paddingHorizontal: spacing.container,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: '100%', maxWidth: layout.readingMaxWidth, alignSelf: 'center' }}>
          <TouchableOpacity
            onPress={() => goBackOrHome(navigation)}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons accessible={false} name="arrow-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Glyph name="sparkles" tone="primary" size={44} />
          <View style={{ flex: 1 }}>
            <Text accessibilityRole="header" style={[typography.titleLg, { color: colors.onSurface }]}>
              Asistente IA
            </Text>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
              Pregúntame sobre tus finanzas
            </Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Más opciones"
            style={{
              width: 36,
              height: 36,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surfaceContainerHigh,
              borderWidth: strokeWidth.medium,
              borderColor: colors.outlineVariant,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons accessible={false} name="ellipsis-vertical" size={18} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      <FlashList
        ref={flatListRef}
        data={messages}
        keyExtractor={chatKeyExtractor}
        renderItem={renderMessage}
        contentContainerStyle={{
          width: '100%',
          maxWidth: layout.readingMaxWidth,
          alignSelf: 'center',
          padding: spacing.container,
          paddingBottom: spacing.md,
        }}
        ListFooterComponent={loading ? <TypingIndicator /> : null}
        ListEmptyComponent={messagesLoading ? (
          <SkeletonScreen label="Cargando conversación" style={{ gap: spacing.md, paddingTop: spacing.container }}>
            <SkeletonChatBubble role="user" lines={1} width="64%" />
            <SkeletonChatBubble role="assistant" lines={2} width="82%" />
            <SkeletonChatBubble role="user" lines={1} width="52%" />
          </SkeletonScreen>
        ) : loading ? null :
          <View style={{ alignItems: 'center', marginTop: spacing['2xl'], gap: spacing.md }}>
            <View
              accessible={false}
              style={{
                width: 64,
                height: 64,
                borderRadius: borderRadius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.primaryContainer,
                borderWidth: strokeWidth.medium,
                borderColor: colors.outline,
              }}
            >
              <Ionicons name="sparkles" size={32} color={colors.primary} />
            </View>
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
          borderTopWidth: strokeWidth.medium,
          borderTopColor: colors.outlineVariant,
        }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Adjuntar archivo"
          style={{
            width: 40,
            height: 40,
            borderRadius: borderRadius.md,
            backgroundColor: colors.surfaceContainerHigh,
            borderWidth: strokeWidth.medium,
            borderColor: colors.outlineVariant,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons accessible={false} name="attach" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceContainerHigh,
            borderRadius: borderRadius.full,
            paddingLeft: spacing.md,
            borderWidth: strokeWidth.medium,
            borderColor: colors.outlineVariant,
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
              borderRadius: borderRadius.full,
              backgroundColor: !input.trim() || loading ? colors.surfaceContainerHighest : colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              margin: 4,
            }}
          >
            <Ionicons
              accessible={false}
              name="send"
              size={18}
              color={!input.trim() || loading ? colors.onSurfaceVariant : colors.onPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
