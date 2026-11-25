import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GlassCard } from '../../components/ui/GlassCard';
import { ContactCard } from '../../components/ui/ContactCard';
import { Avatar } from '../../components/ui/Avatar';
import { FocusFadeIn } from '../../components/ui/FocusFadeIn';
import { Input } from '../../components/ui/Input';
import { StatePanel } from '../../components/ui/StatePanel';
import { SkeletonContactRows } from '../../components/ui/Skeleton';
import { Glyph } from '../../components/ui/Glyph';
import { typography, strokeWidth, spacing, borderRadius, layout } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { showAlert } from '../../components/ui/AppAlert';
import { getOtherProfile } from '../../utils/debts';
import { goBackOrHome } from '../../utils/navigation';
import { contactsApi, usersApi } from '../../services/api';
import type { RootNavigationProp } from '../../navigation/types';
import type { Contact, Profile } from '@finance-flow/shared-types';

export function ContactsScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showError, showSuccess } = useSnackbar();
  const myProfileId = user?.profile?.id ?? 0;

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Contact[]>([]);
  const [pendingSent, setPendingSent] = useState<Contact[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [accepted, received, sent] = await Promise.all([
        contactsApi.getAll(),
        contactsApi.getPendingReceived(),
        contactsApi.getPendingSent(),
      ]);
      setContacts(accepted);
      setPendingReceived(received);
      setPendingSent(sent);
    } catch {
      showError('Error al cargar contactos');
    } finally {
      setInitialLoading(false);
    }
  }, [showError]);

  const loadDataRef = useRef(loadData);
  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  useFocusEffect(
    useCallback(() => { loadDataRef.current(); }, [])
  );

  const relatedProfileIds = useMemo(() => {
    const ids = new Set<number>();
    for (const c of [...contacts, ...pendingReceived, ...pendingSent]) {
      ids.add(getOtherProfile(c, myProfileId).id);
    }
    return ids;
  }, [contacts, pendingReceived, pendingSent, myProfileId]);

  const openSearch = () => {
    searchRequestId.current += 1;
    setQuery('');
    setResults([]);
    setSearching(false);
    setSearchVisible(true);
  };

  const searchRequestId = useRef(0);
  const relatedProfileIdsRef = useRef(relatedProfileIds);
  useEffect(() => {
    relatedProfileIdsRef.current = relatedProfileIds;
  }, [relatedProfileIds]);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (text.trim().length < 3) {
      searchRequestId.current += 1;
      setResults([]);
      setSearching(false);
    }
  }, []);

  // Debounce typing and ignore out-of-order responses so older results cannot
  // overwrite the latest search.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 3) return;

    const requestId = ++searchRequestId.current;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await usersApi.findProfilesByName(term);
        if (requestId !== searchRequestId.current) return;
        const related = relatedProfileIdsRef.current;
        const seen = new Set<number>();
        setResults(
          data.filter((p) => {
            if (p.id === myProfileId || related.has(p.id) || seen.has(p.id)) {
              return false;
            }
            seen.add(p.id);
            return true;
          })
        );
      } catch {
        if (requestId === searchRequestId.current) setResults([]);
      } finally {
        if (requestId === searchRequestId.current) setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, myProfileId]);

  const handleSendRequest = async (profile: Profile) => {
    try {
      await contactsApi.sendRequest({ addresseeId: profile.id });
      showSuccess(`Solicitud enviada a ${profile.name}`);
      setSearchVisible(false);
      loadData();
    } catch (e) {
      showError('No se pudo enviar la solicitud');
    }
  };

  const handleAccept = async (contact: Contact) => {
    try {
      const updated = await contactsApi.accept(contact.id);
      setPendingReceived((prev) => prev.filter((c) => c.id !== contact.id));
      setContacts((prev) => [...prev, updated]);
      showSuccess('Contacto agregado');
    } catch {
      showError('No se pudo aceptar la solicitud');
      loadData();
    }
  };

  const handleReject = async (contact: Contact) => {
    try {
      await contactsApi.reject(contact.id);
      setPendingReceived((prev) => prev.filter((c) => c.id !== contact.id));
    } catch {
      showError('No se pudo rechazar la solicitud');
      loadData();
    }
  };

  const handleCancelSent = (contact: Contact) => {
    const profile = getOtherProfile(contact, myProfileId);
    showAlert({
      title: 'Cancelar solicitud',
      message: `¿Cancelar la solicitud enviada a ${profile.name}?`,
      buttons: [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: async () => {
            setPendingSent((prev) => prev.filter((c) => c.id !== contact.id));
            try {
              await contactsApi.remove(contact.id);
              showSuccess('Solicitud cancelada');
            } catch {
              showError('No se pudo cancelar la solicitud');
              loadData();
            }
          },
        },
      ],
    });
  };

  const handleRemove = (contact: Contact) => {
    const profile = getOtherProfile(contact, myProfileId);
    showAlert({
      title: 'Eliminar contacto',
      message: `¿Eliminar a ${profile.name} de tus contactos?`,
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await contactsApi.remove(contact.id);
              showSuccess('Contacto eliminado');
              loadData();
            } catch {
              showError('No se pudo eliminar el contacto');
            }
          },
        },
      ],
    });
  };

  const handleBack = () => {
    goBackOrHome(navigation);
  };

  const iconButton = {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: strokeWidth.medium,
    borderColor: colors.outlineVariant,
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Text accessibilityRole="header" style={[typography.titleMd, { color: colors.onSurfaceVariant, marginBottom: spacing.sm }]}>
      {children}
    </Text>
  );

  const addButton = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
    minHeight: layout.touchTarget - 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryContainer,
    borderWidth: strokeWidth.medium,
    borderColor: colors.outline,
  };

  return (
    <FocusFadeIn>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center' }}>
            <TouchableOpacity
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={4}
              style={iconButton}
            >
              <Ionicons accessible={false} name="arrow-back" size={20} color={colors.onSurface} />
            </TouchableOpacity>
            <Glyph name="people" tone="primary" size={44} />
            <Text accessibilityRole="header" style={[typography.headlineSm, { color: colors.onSurface, flex: 1 }]}>
              Contactos
            </Text>
            <TouchableOpacity
              onPress={openSearch}
              accessibilityRole="button"
              accessibilityLabel="Agregar contacto"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ minHeight: layout.touchTarget, minWidth: layout.touchTarget, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons accessible={false} name="add-circle" size={26} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            width: '100%',
            maxWidth: layout.contentMaxWidth,
            alignSelf: 'center',
            paddingHorizontal: spacing.container,
            paddingBottom: spacing['2xl'],
            paddingTop: spacing.lg,
          }}
        >
          <View style={{ gap: spacing.lg }}>

            {pendingReceived.length > 0 && (
              <View>
                <SectionTitle>Solicitudes recibidas</SectionTitle>
                {pendingReceived.map((c) => {
                  const profile = getOtherProfile(c, myProfileId);
                  return (
                    <GlassCard key={c.id} style={{ marginBottom: spacing.sm }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                        <Avatar name={profile.name} avatarUrl={profile.avatarUrl} />
                        <View style={{ flex: 1 }}>
                          <Text style={[typography.titleMd, { color: colors.onSurface }]} numberOfLines={1}>
                            {profile.name}
                          </Text>
                          <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
                            Quiere ser tu contacto
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                        <TouchableOpacity
                          onPress={() => handleAccept(c)}
                          accessibilityRole="button"
                          accessibilityLabel={`Aceptar solicitud de ${profile.name}`}
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: spacing.xs,
                            minHeight: layout.touchTarget,
                            borderRadius: borderRadius.md,
                            backgroundColor: colors.surfaceContainerHigh,
                            borderWidth: strokeWidth.medium,
                            borderColor: colors.success,
                          }}
                        >
                          <Ionicons accessible={false} name="checkmark-circle" size={16} color={colors.success} />
                          <Text style={[typography.labelLg, { color: colors.success }]}>Aceptar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleReject(c)}
                          accessibilityRole="button"
                          accessibilityLabel={`Rechazar solicitud de ${profile.name}`}
                          style={{
                            flex: 1,
                            minHeight: layout.touchTarget,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: borderRadius.md,
                            backgroundColor: colors.surfaceContainerHigh,
                            borderWidth: strokeWidth.medium,
                            borderColor: colors.outlineVariant,
                          }}
                        >
                          <Text style={[typography.labelLg, { color: colors.onSurfaceVariant }]}>Rechazar</Text>
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  );
                })}
              </View>
            )}

            {pendingSent.length > 0 && (
              <View>
                <SectionTitle>Solicitudes enviadas</SectionTitle>
                {pendingSent.map((c) => {
                  const profile = getOtherProfile(c, myProfileId);
                  return (
                    <GlassCard key={c.id} style={{ marginBottom: spacing.sm }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                        <Avatar name={profile.name} avatarUrl={profile.avatarUrl} />
                        <View style={{ flex: 1 }}>
                          <Text style={[typography.titleMd, { color: colors.onSurface }]} numberOfLines={1}>
                            {profile.name}
                          </Text>
                          <Text style={[typography.bodySm, { color: colors.secondary }]}>
                            Pendiente de aceptar
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleCancelSent(c)}
                          accessibilityRole="button"
                          accessibilityLabel={`Cancelar solicitud enviada a ${profile.name}`}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={{ minHeight: layout.touchTarget, minWidth: layout.touchTarget, alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Ionicons accessible={false} name="close-circle" size={22} color={colors.onSurfaceVariant} />
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  );
                })}
              </View>
            )}

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <SectionTitle>Tus contactos</SectionTitle>
                <TouchableOpacity onPress={openSearch} accessibilityRole="button" accessibilityLabel="Agregar contacto" style={addButton}>
                  <Ionicons accessible={false} name="add" size={16} color={colors.primary} />
                  <Text style={[typography.labelMd, { color: colors.primary }]}>Agregar</Text>
                </TouchableOpacity>
              </View>
              {initialLoading ? (
                <SkeletonContactRows rows={3} label="Cargando contactos…" />
              ) : contacts.length === 0 ? (
                <StatePanel
                  state="empty"
                  title="Aún no tienes contactos"
                  message="Busca a tus amigos para registrar deudas con ellos"
                />
              ) : (
                contacts.map((c) => {
                  const profile = getOtherProfile(c, myProfileId);
                  return (
                    <ContactCard
                      key={c.id}
                      profile={profile}
                      onPress={() => navigation.navigate('ContactDetail', { contactId: c.id })}
                      onLongPress={() => handleRemove(c)}
                      onDelete={() => handleRemove(c)}
                    />
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>

        <Modal visible={searchVisible} transparent animationType="slide" onRequestClose={() => setSearchVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View
              accessible={false}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: colors.surfaceContainerLowest,
                opacity: 0.75,
              }}
            />
            <View
              style={{
                backgroundColor: colors.surface,
                borderTopLeftRadius: borderRadius['2xl'],
                borderTopRightRadius: borderRadius['2xl'],
                borderTopWidth: strokeWidth.medium,
                borderTopColor: colors.outlineVariant,
                padding: spacing.container,
                paddingBottom: insets.bottom + spacing.md,
                minHeight: '60%',
              }}
            >
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: spacing.lg }} accessible={false} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
                <Text accessibilityRole="header" style={[typography.titleLg, { color: colors.onSurface }]}>Agregar contacto</Text>
                <TouchableOpacity
                  onPress={() => setSearchVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar búsqueda"
                  hitSlop={8}
                  style={{ minHeight: layout.touchTarget, minWidth: layout.touchTarget, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons accessible={false} name="close" size={22} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
              <Input
                label="Buscar por nombre"
                placeholder="Escribe al menos 3 letras..."
                value={query}
                onChangeText={handleSearch}
                autoCapitalize="none"
              />
              <ScrollView style={{ marginTop: spacing.md }} keyboardShouldPersistTaps="handled">
                {searching ? (
                  <SkeletonContactRows rows={3} label="Buscando contactos…" />
                ) : query.trim().length >= 3 && results.length === 0 ? (
                  <StatePanel state="empty" title="Sin resultados" message="Prueba con otro nombre." />
                ) : (
                  results.map((profile) => (
                    <TouchableOpacity
                      key={profile.id}
                      onPress={() => handleSendRequest(profile)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Agregar a ${profile.name}`}
                    >
                      <GlassCard style={{ marginBottom: spacing.sm }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                          <Avatar name={profile.name} avatarUrl={profile.avatarUrl} size={40} />
                          <View style={{ flex: 1 }}>
                            <Text style={[typography.titleMd, { color: colors.onSurface }]} numberOfLines={1}>
                              {profile.name}
                            </Text>
                          </View>
                          <View style={addButton}>
                            <Ionicons accessible={false} name="person-add" size={14} color={colors.primary} />
                            <Text style={[typography.labelMd, { color: colors.primary }]}>Agregar</Text>
                          </View>
                        </View>
                      </GlassCard>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </FocusFadeIn>
  );
}
