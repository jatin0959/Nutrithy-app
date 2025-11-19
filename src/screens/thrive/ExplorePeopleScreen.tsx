// src/screens/thrive/ExplorePeopleScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  searchPeople,
  sendConnectionRequest,
  createTeam,
  ThrivePerson,
  respondToConnectionRequest,
} from '../../api/thrive';

type ExplorePeopleRouteParams = {
  creatingTeam?: boolean;
};

export default function ExplorePeopleScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as ExplorePeopleRouteParams | undefined;
  const isTeamMode = !!params?.creatingTeam;

  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<ThrivePerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // team-creation state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [teamName, setTeamName] = useState('');
  const [creatingTeamBusy, setCreatingTeamBusy] = useState(false);

  const loadPeople = useCallback(
    async (searchTerm: string) => {
      try {
        setLoading(true);
        setError(null);

        const res = await searchPeople(searchTerm, 30);
        setPeople(res.items || []);
      } catch (e: any) {
        console.log('[ExplorePeople] loadPeople error', e);
        setError('Could not load people.');
        setPeople([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPeople('');
  }, [loadPeople]);

  const onChangeSearch = (text: string) => {
    setQuery(text);
    loadPeople(text);
  };

  const toggleSelect = (userId: string) => {
    if (!isTeamMode) return;
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleConnect = async (userId: string) => {
    try {
      await sendConnectionRequest(userId);
      Alert.alert('Request sent', 'Your connection request has been sent.');
      await loadPeople(query);
    } catch (e: any) {
      console.log('[ExplorePeople] handleConnect error', e);

      const status = e?.response?.status;
      const code = e?.response?.data?.error?.code;
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        '';

      if (status === 409 && code === 'REQUEST_EXISTS') {
        Alert.alert(
          'Already requested',
          msg || 'A request already exists between you both.'
        );
        await loadPeople(query);
        return;
      }

      if (status === 409 && code === 'ALREADY_CONNECTED') {
        Alert.alert(
          'Already connected',
          msg || 'You are already connected with this person.'
        );
        await loadPeople(query);
        return;
      }

      Alert.alert('Error', 'Could not send connection request.');
    }
  };

  const handleRespond = async (person: ThrivePerson) => {
    if (!person.requestId) {
      Alert.alert('Error', 'No pending request found.');
      return;
    }

    try {
      await respondToConnectionRequest(person.requestId, 'accept');
      Alert.alert(
        'Connected',
        `You are now connected with ${person.firstName}.`
      );
      await loadPeople(query);
    } catch (e: any) {
      console.log('[ExplorePeople] handleRespond error', e);
      Alert.alert('Error', 'Could not respond to connection request.');
    }
  };

  const handleCreateTeam = async () => {
    if (!selectedIds.length || creatingTeamBusy) return;

    const trimmedName = teamName.trim();
    if (!trimmedName) {
      Alert.alert('Team name required', 'Please enter a name for your team.');
      return;
    }

    try {
      setCreatingTeamBusy(true);

      const res = await createTeam({
        name: trimmedName,
        description: 'Team created from Explore People',
        memberIds: selectedIds,
      });

      console.log('[ExplorePeople] createTeam response', res);

      Alert.alert(
        'Team created',
        `Your team "${trimmedName}" is ready. You can find it in ThriveTalk and the Teams leaderboard.`
      );

      // reset state and go back
      setTeamName('');
      setSelectedIds([]);
      // @ts-ignore
      navigation.goBack();
    } catch (e: any) {
      console.log('[ExplorePeople] handleCreateTeam error', e);

      const status = e?.response?.status;
      const code = e?.response?.data?.error?.code;
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        'Could not create team.';

      // backend enforces: each user can only be in ONE team
      if (status === 409 && code === 'ALREADY_IN_TEAM') {
        Alert.alert(
          'Already in a team',
          msg ||
            'One or more selected members are already part of another team. Each user can only join one team.'
        );
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setCreatingTeamBusy(false);
    }
  };

  const goBack = () => {
    // @ts-ignore
    navigation.goBack();
  };

  const openProfile = (userId: string) => {
    // @ts-ignore
    navigation.navigate('UserProfile', { userId });
  };

  return (
    <LinearGradient colors={['#ec4899', '#7c3aed']} style={{ flex: 1 }}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Explore People</Text>
          <Text style={styles.headerSubtitle}>
            Connect with colleagues and build your wellness tribe
          </Text>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchInner}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#9ca3af"
            style={{ marginHorizontal: 8 }}
          />
          <TextInput
            placeholder="Search by name, department, or role..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={query}
            onChangeText={onChangeSearch}
            autoCorrect={false}
          />
        </View>
      </View>

      {isTeamMode && (
        <View style={styles.teamBanner}>
          <Ionicons name="people-outline" size={18} color="#f9fafb" />
          <Text style={styles.teamBannerText}>
            Team mode: select people and give your team a name.
          </Text>
        </View>
      )}

      <View style={styles.panel}>
        <ScrollView
          contentContainerStyle={styles.panelContent}
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <View style={styles.centerRow}>
              <ActivityIndicator />
            </View>
          )}

          {!!error && !loading && (
            <View style={styles.centerRow}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && !people.length && (
            <View style={styles.centerRow}>
              <Text style={styles.emptyTitle}>No people found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different name or keyword.
              </Text>
            </View>
          )}

          {!loading &&
            !error &&
            people.map((p) => {
              const fullName = `${p.firstName} ${p.lastName || ''}`.trim();
              const isMe = p.isCurrentUser === true;
              const displayName = isMe ? `${fullName} (You)` : fullName;

              const isSelected = selectedIds.includes(p.id);
              const secondary =
                p.headline || p.department || p.location || null;

              let connectionLabel: string | null = null;
              if (isMe) {
                connectionLabel = 'This is you';
              } else if (p.connectionStatus === 'connected') {
                connectionLabel = 'Connected';
              } else if (p.connectionStatus === 'requested_by_me') {
                connectionLabel = 'Request sent';
              } else if (p.connectionStatus === 'requested_to_me') {
                connectionLabel = 'Requested you';
              }

              let buttonLabel = 'Connect';
              let buttonDisabled = false;
              let buttonOnPress: (() => void) | undefined;

              if (isMe) {
                buttonLabel = 'You';
                buttonDisabled = true;
              } else if (p.connectionStatus === 'none') {
                buttonLabel = 'Connect';
                buttonOnPress = () => handleConnect(p.id);
              } else if (p.connectionStatus === 'requested_by_me') {
                buttonLabel = 'Requested';
                buttonDisabled = true;
              } else if (p.connectionStatus === 'requested_to_me') {
                buttonLabel = 'Respond';
                buttonOnPress = () => handleRespond(p);
              } else if (p.connectionStatus === 'connected') {
                buttonLabel = 'Connected';
                buttonDisabled = true;
              }

              return (
                <Pressable
                  key={p.id}
                  style={styles.personCard}
                  onPress={() => openProfile(p.id)}
                >
                  <View style={styles.personAvatar}>
                    <Text style={styles.personAvatarText}>
                      {p.firstName?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName}>{displayName}</Text>
                    {!!secondary && (
                      <Text style={styles.personSecondary}>{secondary}</Text>
                    )}
                    {!!connectionLabel && (
                      <Text style={styles.personStatus}>
                        {connectionLabel}
                      </Text>
                    )}
                  </View>

                  {isTeamMode ? (
                    <Pressable
                      disabled={isMe}
                      onPress={() => toggleSelect(p.id)}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                        isMe && styles.chipDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                          isMe && styles.chipTextDisabled,
                        ]}
                      >
                        {isMe ? 'You' : isSelected ? 'Selected' : 'Add'}
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      disabled={buttonDisabled || !buttonOnPress}
                      onPress={buttonOnPress}
                      style={[
                        styles.chip,
                        (buttonDisabled || !buttonOnPress) &&
                          styles.chipDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          (buttonDisabled || !buttonOnPress) &&
                            styles.chipTextDisabled,
                        ]}
                      >
                        {buttonLabel}
                      </Text>
                    </Pressable>
                  )}
                </Pressable>
              );
            })}
        </ScrollView>

        {isTeamMode && (
          <View style={styles.footer}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
              >
                <Ionicons
                  name="people-circle-outline"
                  size={24}
                  color="#4b5563"
                />
                <Text style={styles.footerMeta}>
                  {selectedIds.length
                    ? `${selectedIds.length} member${
                        selectedIds.length > 1 ? 's' : ''
                      } selected`
                    : 'Select at least one member'}
                </Text>
              </View>
              <TextInput
                placeholder="Enter team name"
                placeholderTextColor="#9ca3af"
                style={styles.teamNameInput}
                value={teamName}
                onChangeText={setTeamName}
              />
            </View>

            <Pressable
              onPress={handleCreateTeam}
              disabled={
                !selectedIds.length || !teamName.trim() || creatingTeamBusy
              }
              style={[
                styles.primaryBtn,
                (!selectedIds.length || !teamName.trim() || creatingTeamBusy) &&
                  styles.primaryBtnDisabled,
              ]}
            >
              {creatingTeamBusy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Create Team</Text>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontSize: 14,
    color: '#111827',
  },
  teamBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.25)',
  },
  teamBannerText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#f9fafb',
  },
  panel: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
  },
  panelContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    rowGap: 10,
  },
  centerRow: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  personAvatarText: {
    color: '#b91c1c',
    fontWeight: '800',
    fontSize: 18,
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  personSecondary: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  personStatus: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#db2777',
  },
  chipSelected: {
    backgroundColor: '#db2777',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#db2777',
  },
  chipTextSelected: {
    color: '#fff',
  },
  chipDisabled: {
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  chipTextDisabled: {
    color: '#9ca3af',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerMeta: {
    marginLeft: 8,
    fontSize: 12,
    color: '#4b5563',
  },
  teamNameInput: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  primaryBtn: {
    width: 130,
    backgroundColor: '#db2777',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: '#f9a8d4',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});
