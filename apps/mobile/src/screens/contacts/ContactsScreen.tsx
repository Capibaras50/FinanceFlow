import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GlassCard } from '../../components/ui/GlassCard';
import { ContactCard } from '../../components/ui/ContactCard';
import { Avatar } from '../../components/ui/Avatar';
import { FocusFadeIn } from '../../components/ui/FocusFadeIn';
import { Input } from '../../components/ui/Input';
import { typography, spacing, borderRadius } from '../../theme';
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

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

  const loadData = async () => {
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
    }
  };

  const relatedProfileIds = useMemo(() => {
    const ids = new Set<number>();
    for (const c of [...contacts, ...pendingReceived, ...pendingSent]) {
      ids.add(getOtherProfile(c, myProfileId).id);
    }
    return ids;
  }, [contacts, pendingReceived, pendingSent, myProfileId]);

  const openSearch = () => {
    setQuery('');
    setResults([]);
    setSearchVisible(true);
  };

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim().length < 3) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await usersApi.findProfilesByName(text.trim());
      const seen = new Set<number>();
      setResults(
        data.filter((p) => {
          if (p.id === myProfileId || relatedProfileIds.has(p.id) || seen.has(p.id)) {
            return false;
          }
          seen.add(p.id);
          return true;
        })
      );
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

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

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginLeft: spacing.xs, marginBottom: spacing.sm, marginTop: spacing.md }]}>
      {children}
    </Text>
  );

  return (
    <FocusFadeIn>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LinearGradient
          colors={colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.container }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <TouchableOpacity
              onPress={handleBack}
              style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="people" size={20} color="#FFFFFF" />
            </View>
            <Text style={[typography.headlineSm, { color: '#FFFFFF', flex: 1 }]}>
              Contactos
            </Text>
            <TouchableOpacity onPress={openSearch}>
              <Ionicons name="add-circle" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
        >
          <View style={{ paddingTop: spacing.lg, paddingHorizontal: spacing.container, gap: spacing.lg }}>

            {pendingReceived.length > 0 && (
              <View>
                <SectionTitle>SOLICITUDES RECIBIDAS</SectionTitle>
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
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            paddingVertical: spacing.sm + 2,
                            borderRadius: borderRadius.full,
                            backgroundColor: colors.success + '1F',
                            borderWidth: 1,
                            borderColor: colors.success + '50',
                          }}
                        >
                          <Text style={[typography.labelLg, { color: colors.success }]}>Aceptar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleReject(c)}
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            paddingVertical: spacing.sm + 2,
                            borderRadius: borderRadius.full,
                            backgroundColor: colors.surfaceContainerHighest,
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
                <SectionTitle>SOLICITUDES ENVIADAS</SectionTitle>
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
                          <Text style={[typography.bodySm, { color: colors.warning }]}>
                            Pendiente de aceptar
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => handleCancelSent(c)}>
                          <Ionicons name="close-circle" size={22} color={colors.onSurfaceVariant} />
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  );
                })}
              </View>
            )}

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionTitle>TUS CONTACTOS</SectionTitle>
                <TouchableOpacity onPress={openSearch}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primaryContainer, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.full }}>
                    <Ionicons name="add" size={16} color={colors.onPrimaryContainer} />
                    <Text style={[typography.labelMd, { color: colors.onPrimaryContainer }]}>Agregar</Text>
                  </View>
                </TouchableOpacity>
              </View>
              {contacts.length === 0 ? (
                <GlassCard>
                  <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
                    Aún no tienes contactos
                  </Text>
                  <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.xs }]}>
                    Busca a tus amigos para registrar deudas con ellos
                  </Text>
                </GlassCard>
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
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: borderRadius['2xl'], borderTopRightRadius: borderRadius['2xl'], padding: spacing.container, paddingBottom: insets.bottom + spacing.md, minHeight: '60%' }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: spacing.lg }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
                <Text style={[typography.titleLg, { color: colors.onSurface }]}>Agregar contacto</Text>
                <TouchableOpacity onPress={() => setSearchVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.onSurfaceVariant} />
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
                  <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
                ) : query.trim().length >= 3 && results.length === 0 ? (
                  <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.xl }]}>
                    Sin resultados
                  </Text>
                ) : (
                  results.map((profile) => (
                    <TouchableOpacity
                      key={profile.id}
                      onPress={() => handleSendRequest(profile)}
                      activeOpacity={0.7}
                    >
                      <GlassCard style={{ marginBottom: spacing.sm }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                          <Avatar name={profile.name} avatarUrl={profile.avatarUrl} size={40} />
                          <View style={{ flex: 1 }}>
                            <Text style={[typography.titleMd, { color: colors.onSurface }]} numberOfLines={1}>
                              {profile.name}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primaryContainer, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.full }}>
                            <Ionicons name="person-add" size={14} color={colors.onPrimaryContainer} />
                            <Text style={[typography.labelMd, { color: colors.onPrimaryContainer }]}>Agregar</Text>
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
