// src/screens/thrive/TeamDetailScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, MessageCircle, Trophy } from 'lucide-react-native';

import {
  getTeamDetailApi,
  TeamDetail,
  TeamMember,
} from '../../api/thrive';

type TeamDetailRouteParams = {
  teamId: string;
};

function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function TeamDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { teamId } = route.params as TeamDetailRouteParams;

  const [team, setTeam] = useState<TeamDetail | (TeamDetail & any) | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ only call team-detail endpoint
      const res = await getTeamDetailApi(teamId);
      const dto: any = res.data;

      setTeam(dto);

      // Backend already sends: data.members = [{ id, firstName, lastName, profilePicture }]
      const mappedMembers: TeamMember[] = (dto.members || []).map((m: any) => ({
        userId: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        profilePicture: m.profilePicture ?? null,
        role: 'member', // you can refine this later
      }));

      setMembers(mappedMembers);
    } catch (e) {
      console.log('[TeamDetail] load error', e);
      setError('Could not load team details.');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenChat = () => {
    if (!team) return;
    navigation.navigate('ThriveChat', {
      isGroup: true,
      groupId: (team as any).id,
      name: (team as any).name,
    });
  };

  const handleBack = () => navigation.goBack();

  // convenience values (support both old TeamDetail type and your actual DTO)
  const points =
    (team as any)?.stats?.points ??
    (team as any)?.points ??
    0;
  const membersCount =
    (team as any)?.membersCount ?? members.length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <LinearGradient
        colors={['#ec4899', '#7c3aed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>{'‹'}</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {team?.name || 'Team Detail'}
        </Text>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : !team ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Team not found.</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top card: avatar + meta */}
          <View style={styles.card}>
            <View style={styles.row}>
              <LinearGradient
                colors={['#ec4899', '#7c3aed']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {getInitials(team.name)}
                </Text>
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.teamName} numberOfLines={2}>
                  {team.name}
                </Text>
                <Text style={styles.teamMeta}>
                  {membersCount} member{membersCount === 1 ? '' : 's'}
                </Text>
                <Text style={styles.teamMeta}>
                  {points} pts
                </Text>
              </View>
            </View>

            {!!(team as any).description && (
              <Text style={styles.teamDesc}>{(team as any).description}</Text>
            )}

            <Pressable style={styles.chatBtn} onPress={handleOpenChat}>
              <MessageCircle size={20} color="#fff" />
              <Text style={styles.chatBtnText}>Open group chat</Text>
            </Pressable>
          </View>

          {/* Stats card */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.statItem}>
                <Users size={18} color="#6b7280" />
                <Text style={styles.statLabel}>Members</Text>
                <Text style={styles.statValue}>{membersCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Trophy size={18} color="#f59e0b" />
                <Text style={styles.statLabel}>Points</Text>
                <Text style={styles.statValue}>{points}</Text>
              </View>
            </View>
          </View>

          {/* Members list */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Members</Text>
              <Text style={styles.sectionCount}>
                {members.length} total
              </Text>
            </View>

            {members.length === 0 ? (
              <Text style={styles.emptyText}>
                No members loaded yet.
              </Text>
            ) : (
              <View style={{ marginTop: 8 }}>
                {members.map((m) => {
                  const initials = getInitials(
                    `${m.firstName || ''} ${m.lastName || ''}`.trim()
                  );

                  return (
                    <View key={m.userId} style={styles.memberRow}>
                      <View style={styles.row}>
                        <View style={styles.memberAvatar}>
                          <Text style={styles.memberAvatarText}>
                            {initials}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.memberName}>
                            {`${m.firstName} ${m.lastName || ''}`.trim()}
                          </Text>
                          <Text style={styles.memberRole}>
                            {m.role === 'owner'
                              ? 'Owner'
                              : m.role === 'admin'
                              ? 'Admin'
                              : 'Member'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backBtn: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  backText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#db2777',
  },
  retryText: {
    color: '#db2777',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 20,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  teamMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  teamDesc: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 10,
  },
  chatBtn: {
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: '#db2777',
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 6,
  },
  chatBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#6b7280',
  },
  statValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  sectionCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
  },
  memberRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b91c1c',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  memberRole: {
    fontSize: 11,
    color: '#6b7280',
  },
});
