// src/screens/thrive/UserProfileScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  getThriveUserProfile,
  sendConnectionRequest,
  respondToConnectionRequest,
  ThriveUserProfile,
} from '../../api/thrive';

type UserProfileRouteParams = {
  userId: string;
};

export default function UserProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as UserProfileRouteParams;

  const [profile, setProfile] = useState<ThriveUserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getThriveUserProfile(userId);
      if (res?.success) {
        setProfile(res.data);
      } else {
        setProfile(null);
        setError('Could not load profile.');
      }
    } catch (e: any) {
      console.log('[UserProfile] loadProfile error', e);
      setError('Could not load profile.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const goBack = () => {
    // @ts-ignore
    navigation.goBack();
  };

  const handleOpenChat = () => {
  if (!profile) return;
  const targetName = `${profile.firstName} ${profile.lastName || ''}`.trim();

  // Make sure you have this route registered in your navigator as "ThriveChat"
  // @ts-ignore
  navigation.navigate('ThriveChat', {
    userId: profile.id,
    name: targetName || profile.firstName,
  });
};


  const handleConnect = async () => {
    if (!profile || profile.isCurrentUser) return;
    if (actionBusy) return;

    try {
      setActionBusy(true);
      await sendConnectionRequest(profile.id);
      Alert.alert('Request sent', 'Your connection request has been sent.');
      await loadProfile();
    } catch (e: any) {
      console.log('[UserProfile] handleConnect error', e);

      const status = e?.response?.status;
      const code = e?.response?.data?.error?.code;
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        '';

      if (status === 409 && code === 'REQUEST_EXISTS') {
        Alert.alert(
          'Already requested',
          msg || 'A connection request is already pending.'
        );
        await loadProfile();
        return;
      }

      if (status === 409 && code === 'ALREADY_CONNECTED') {
        Alert.alert(
          'Already connected',
          msg || 'You are already connected with this person.'
        );
        await loadProfile();
        return;
      }

      Alert.alert('Error', 'Could not send connection request.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleRespond = async () => {
    if (!profile || profile.isCurrentUser) return;
    if (!profile.requestId) {
      Alert.alert('Error', 'No pending request found.');
      return;
    }
    if (actionBusy) return;

    try {
      setActionBusy(true);
      await respondToConnectionRequest(profile.requestId, 'accept');
      Alert.alert('Connected', `You are now connected with ${profile.firstName}.`);
      await loadProfile();
    } catch (e: any) {
      console.log('[UserProfile] handleRespond error', e);
      Alert.alert('Error', 'Could not respond to connection request.');
    } finally {
      setActionBusy(false);
    }
  };

  // Decide button label / behavior based on status
  const getPrimaryAction = () => {
    if (!profile) {
      return { label: '', disabled: true, onPress: undefined as (() => void) | undefined };
    }

    if (profile.isCurrentUser) {
      return {
        label: 'Edit Profile',
        disabled: true, // you can wire to Edit screen later
        onPress: undefined,
      };
    }

    const status = profile.connectionStatus;

    if (status === 'none') {
      return { label: 'Connect', disabled: actionBusy, onPress: handleConnect };
    }

    if (status === 'requested_by_me') {
      return { label: 'Requested', disabled: true, onPress: undefined };
    }

    if (status === 'requested_to_me') {
      return { label: 'Respond', disabled: actionBusy, onPress: handleRespond };
    }

    if (status === 'connected') {
      return { label: 'Connected', disabled: true, onPress: undefined };
    }

    return { label: 'Connect', disabled: true, onPress: undefined };
  };

  const action = getPrimaryAction();

  const fullName = profile
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : '';

  const displayName =
    profile && profile.isCurrentUser ? `${fullName} (You)` : fullName;

  return (
    <LinearGradient colors={['#ec4899', '#7c3aed']} style={{ flex: 1 }}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Content panel */}
      <View style={styles.panel}>
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

        {!loading && !error && profile && (
          <ScrollView
            contentContainerStyle={styles.panelContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top: avatar + name + role */}
            <View style={styles.topRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile.firstName?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{displayName}</Text>
                {!!profile.headline && (
                  <Text style={styles.headline}>{profile.headline}</Text>
                )}
                {(profile.department || profile.location) && (
                  <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    {!!profile.department && (
                      <Text style={styles.metaText}>
                        {profile.department}
                      </Text>
                    )}
                    {!!profile.department && !!profile.location && (
                      <Text style={styles.metaDot}> • </Text>
                    )}
                    {!!profile.location && (
                      <Text style={styles.metaText}>
                        {profile.location}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Primary action button */}
            <View style={styles.actionRow}>
              <Pressable
                disabled={action.disabled || !action.onPress}
                onPress={action.onPress}
                style={[
                  styles.primaryBtn,
                  (action.disabled || !action.onPress) &&
                  styles.primaryBtnDisabled,
                ]}
              >
                {actionBusy && action.label === 'Connect' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>{action.label}</Text>
                )}
              </Pressable>

              {/* Placeholder Message button for later DM feature */}
              {!profile.isCurrentUser && (
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={handleOpenChat}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#db2777" />
                  <Text style={styles.secondaryBtnText}>Message</Text>
                </Pressable>
              )}


            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {profile.stats?.posts ?? 0}
                </Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {profile.stats?.connections ?? 0}
                </Text>
                <Text style={styles.statLabel}>Connections</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {profile.stats?.coins ?? 0}
                </Text>
                <Text style={styles.statLabel}>Coins</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {profile.stats?.challengesJoined ?? 0}
                </Text>
                <Text style={styles.statLabel}>Challenges</Text>
              </View>
            </View>

            {/* About / bio */}
            {!!profile.bio && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.sectionBody}>{profile.bio}</Text>
              </View>
            )}

            {/* Placeholder sections for future expansions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wellness Activity</Text>
              <Text style={styles.sectionBody}>
                In future, you can show their recent challenges, streaks,
                and highlights here.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Teams</Text>
              <Text style={styles.sectionBody}>
                You can list their Thrive teams / groups here later.
              </Text>
            </View>
          </ScrollView>
        )}
      </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
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
  panel: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
  },
  panelContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    rowGap: 16,
  },
  centerRow: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#b91c1c',
    fontWeight: '800',
    fontSize: 28,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  headline: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  metaDot: {
    fontSize: 12,
    color: '#9ca3af',
    marginHorizontal: 4,
  },
  actionRow: {
    flexDirection: 'row',
    columnGap: 8,
    marginTop: 8,
  },
  primaryBtn: {
    flex: 1,
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
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#db2777',
    backgroundColor: '#fff',
  },
  secondaryBtnText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#db2777',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  section: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 13,
    color: '#4b5563',
  },
});
