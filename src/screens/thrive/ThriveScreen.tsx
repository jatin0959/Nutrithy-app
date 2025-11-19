// src/screens/thrive/ThriveScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Trophy,
  Target,
  Users,
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  PenSquare,
  CheckCircle,
  PlusCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  getThriveFeed,
  getChallenges,
  getIndividualLeaderboard,
  getTeamLeaderboard,
  getDirectMessageThreads,
  getUserTeams,
  ThriveFeedPost,
  ChallengeCard,
  LeaderboardItem,
  TeamLeaderboardItem,
  DirectMessageThreadSummary,
  TeamSummary,
  getPostComments,
  addPostComment,
  likeThrivePost,
  unlikeThrivePost,
  shareThrivePost,
} from '../../api/thrive';
import { api } from '../../api/client';

interface ThriveScreenProps {
  onNavigate?: (screen: string) => void;
}

type Section = 'feed' | 'challenges' | 'leaderboard' | 'thrivetalk';
type LeaderboardMode = 'individual' | 'teams';

// Match your Thrive stack navigation
type ThriveStackParamList = {
  ThriveChallengeDetail: { challengeId: string };
  ThriveChallengeJoined: { challengeId: string };
  ExplorePeople:
  | {
    creatingTeam?: boolean;
  }
  | undefined;
  UserProfile: { userId: string };
  TeamDetail: { teamId: string };

  ThriveChat:
  | { mode: 'dm'; userId: string; name: string }
  | { mode: 'group'; teamId: string; name: string };
  ThriveCreatePost: undefined;
};

/* -------- Fallback post data -------- */

const fallbackFeedPosts: ThriveFeedPost[] = [
  {
    id: '1',
    caption:
      'Just completed my 10K steps challenge for the 6th day in a row! Feeling amazing!',
    mediaUrl:
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
    mediaType: 'image',
    likesCount: 24,
    commentsCount: 8,
    createdAt: new Date().toISOString(),
    likedByMe: false,
    author: {
      id: 'u1',
      firstName: 'Priya',
      lastName: 'Sharma',
      profilePicture: null,
    },
  },
];

/* -------- Helpers: initials + avatar -------- */

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  const first = parts[0][0] || '';
  const last = parts[parts.length - 1][0] || '';
  return (first + last).toUpperCase();
};

const Avatar = ({
  size,
  uri,
  name,
  style,
}: {
  size: number;
  uri?: string | null;
  name: string;
  style?: any;
}) => {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );
  }
  const initials = getInitials(name);
  return (
    <View
      style={[
        s.avatarFallback,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Text style={s.avatarFallbackText}>{initials}</Text>
    </View>
  );
};

// ---- small helper so post.mediaUrl = "/uploads/..." becomes full URL ----
const API_BASE =
  (api.defaults?.baseURL as string | undefined)?.replace(/\/$/, '') || '';

function resolveMediaUrl(url?: string | null) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (!API_BASE) return url;
  return `${API_BASE}${url}`;
}

// Lightweight local type for comments rendered in the feed
type FeedComment = {
  id: string;
  text: string;
  createdAt: string;
  authorName: string; // already formatted; avoids author undefined crash
};

export default function ThriveScreen({ onNavigate }: ThriveScreenProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<ThriveStackParamList>>();

  const goTo = useCallback(
    (screen: keyof ThriveStackParamList, params?: any) => {
      if (onNavigate) {
        onNavigate(screen as string);
      } else {
        navigation.navigate(screen as any, params);
      }
    },
    [onNavigate, navigation]
  );

  const [activeSection, setActiveSection] = useState<Section>('feed');

  // global pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // FEED
  const [feed, setFeed] = useState<ThriveFeedPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedLikedIds, setFeedLikedIds] = useState<string[]>([]);

  // COMMENTS state
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, FeedComment[]>
  >({});
  const [commentsLoadingByPost, setCommentsLoadingByPost] = useState<
    Record<string, boolean>
  >({});
  const [commentInputByPost, setCommentInputByPost] = useState<
    Record<string, string>
  >({});
  const [commentsExpandedByPost, setCommentsExpandedByPost] = useState<
    Record<string, boolean>
  >({});

  // CHALLENGES
  const [challenges, setChallenges] = useState<ChallengeCard[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [challengesError, setChallengesError] = useState<string | null>(null);

  // LEADERBOARD (individuals)
  const [leaders, setLeaders] = useState<LeaderboardItem[]>([]);
  const [leaderLoading, setLeaderLoading] = useState(false);
  const [leaderError, setLeaderError] = useState<string | null>(null);

  // LEADERBOARD (teams)
  const [leaderboardMode, setLeaderboardMode] =
    useState<LeaderboardMode>('individual');
  const [teamLeaders, setTeamLeaders] = useState<TeamLeaderboardItem[]>([]);
  const [teamLeaderLoading, setTeamLeaderLoading] = useState(false);
  const [teamLeaderError, setTeamLeaderError] = useState<string | null>(null);

  // THRIVETALK – direct message threads
  const [dmThreads, setDmThreads] = useState<DirectMessageThreadSummary[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadsError, setThreadsError] = useState<string | null>(null);

  // TEAMS / GROUPS
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  /* ------------------ Loaders ------------------ */

  const loadFeed = useCallback(async () => {
    try {
      setFeedLoading(true);
      setFeedError(null);
      const res = await getThriveFeed(20);
      if (res?.success && Array.isArray(res.data)) {
        setFeed(res.data);
        const liked = res.data.filter((p) => p.likedByMe).map((p) => p.id);
        setFeedLikedIds(liked);
      } else {
        setFeed([]);
      }
    } catch (e: any) {
      console.log('loadFeed error', e);
      setFeedError('Could not load feed.');
    } finally {
      setFeedLoading(false);
    }
  }, []);

  const loadChallenges = useCallback(async () => {
    try {
      setChallengesLoading(true);
      setChallengesError(null);

      const res = await getChallenges({ status: 'active', limit: 10 });

      if (res && Array.isArray(res.items)) {
        setChallenges(res.items);
      } else {
        setChallenges([]);
      }
    } catch (e: any) {
      console.log('loadChallenges error', e);
      setChallengesError('Could not load challenges.');
    } finally {
      setChallengesLoading(false);
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLeaderLoading(true);
      setLeaderError(null);
      const res = await getIndividualLeaderboard('weekly');
      if (res?.success && Array.isArray(res.items)) {
        setLeaders(res.items);
      } else {
        setLeaders([]);
      }
    } catch (e: any) {
      console.log('loadLeaderboard error', e);
      setLeaderError('Could not load leaderboard.');
    } finally {
      setLeaderLoading(false);
    }
  }, []);

  const loadTeamLeaderboard = useCallback(async () => {
    try {
      setTeamLeaderLoading(true);
      setTeamLeaderError(null);

      const res = await getTeamLeaderboard('weekly');
      if (res?.success && Array.isArray(res.items)) {
        setTeamLeaders(res.items);
      } else {
        setTeamLeaders([]);
      }
    } catch (e: any) {
      console.log('loadTeamLeaderboard error', e);
      setTeamLeaderError('Could not load team leaderboard.');
    } finally {
      setTeamLeaderLoading(false);
    }
  }, []);

  const loadDmThreads = useCallback(async () => {
    try {
      setThreadsLoading(true);
      setThreadsError(null);

      const res = await getDirectMessageThreads(30);
      if (res?.success && Array.isArray(res.items)) {
        setDmThreads(res.items);
      } else {
        setDmThreads([]);
      }
    } catch (e: any) {
      console.log('loadDmThreads error', e);
      setThreadsError('Could not load conversations.');
    } finally {
      setThreadsLoading(false);
    }
  }, []);

  const loadTeams = useCallback(async () => {
    try {
      setTeamsLoading(true);
      setTeamsError(null);

      const res = await getUserTeams();
      if (res?.items && Array.isArray(res.items)) {
        setTeams(res.items);
      } else {
        setTeams([]);
      }
    } catch (e: any) {
      console.log('loadTeams error', e);
      setTeamsError('Could not load your teams.');
    } finally {
      setTeamsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFeed();
    loadChallenges();
    loadLeaderboard();
    loadTeamLeaderboard();
    loadDmThreads();
    loadTeams();
  }, [
    loadFeed,
    loadChallenges,
    loadLeaderboard,
    loadTeamLeaderboard,
    loadDmThreads,
    loadTeams,
  ]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        loadFeed(),
        loadChallenges(),
        loadLeaderboard(),
        loadTeamLeaderboard(),
        loadDmThreads(),
        loadTeams(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    loadFeed,
    loadChallenges,
    loadLeaderboard,
    loadTeamLeaderboard,
    loadDmThreads,
    loadTeams,
  ]);

  /* ------------------ Helpers ------------------ */

  // like / unlike with backend call
  const handleToggleLike = async (post: ThriveFeedPost) => {
    const isLiked = feedLikedIds.includes(post.id);

    // Optimistic UI
    setFeedLikedIds((prev) =>
      isLiked ? prev.filter((id) => id !== post.id) : [...prev, post.id]
    );
    setFeed((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
            ...p,
            likesCount: p.likesCount + (isLiked ? -1 : 1),
            likedByMe: !isLiked,
          }
          : p
      )
    );

    try {
      const res = isLiked
        ? await unlikeThrivePost(post.id)
        : await likeThrivePost(post.id);

      if (!res.success) {
        throw new Error('Backend like/unlike failed');
      }

      // sync from backend counts
      setFeed((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
              ...p,
              likesCount: res.data.likesCount,
              likedByMe: res.data.likedByMe,
            }
            : p
        )
      );
    } catch (err) {
      console.log('handleToggleLike error', err);
      // revert optimistic change
      setFeedLikedIds((prev) =>
        isLiked ? [...prev, post.id] : prev.filter((id) => id !== post.id)
      );
      setFeed((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
              ...p,
              likesCount: p.likesCount + (isLiked ? 1 : -1),
              likedByMe: isLiked,
            }
            : p
        )
      );
      Alert.alert('Error', 'Could not update like. Please try again.');
    }
  };

  const renderTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const feedToRender: ThriveFeedPost[] =
    !feedLoading && !feedError && feed.length === 0 ? fallbackFeedPosts : feed;

  // load all comments when user taps "View comments"
  const handleToggleComments = async (postId: string) => {
    const expanded = commentsExpandedByPost[postId];

    // If we already have comments and just collapsing/expanding, no API call
    if (expanded) {
      setCommentsExpandedByPost((prev) => ({
        ...prev,
        [postId]: false,
      }));
      return;
    }

    try {
      setCommentsExpandedByPost((prev) => ({ ...prev, [postId]: true }));
      setCommentsLoadingByPost((prev) => ({ ...prev, [postId]: true }));

      const res = await getPostComments(postId);
      if (!res.success || !Array.isArray(res.data)) {
        setCommentsByPost((prev) => ({ ...prev, [postId]: [] }));
        return;
      }

      const mapped: FeedComment[] = res.data.map((c) => ({
        id: c.id,
        text: c.text,
        createdAt: c.createdAt,
        authorName: c.author
          ? `${c.author.firstName || ''} ${c.author.lastName || ''}`
            .trim() || 'Someone'
          : 'Someone',
      }));

      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: mapped,
      }));
    } catch (err) {
      console.log('handleToggleComments error', err);
      Alert.alert('Error', 'Could not load comments.');
    } finally {
      setCommentsLoadingByPost((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // send a new comment
  const handleSendComment = async (postId: string) => {
    const text = (commentInputByPost[postId] || '').trim();
    if (!text) return;

    // optimistic append
    const tempComment: FeedComment = {
      id: `temp-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
      authorName: 'You',
    };

    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), tempComment],
    }));
    setCommentInputByPost((prev) => ({ ...prev, [postId]: '' }));
    setFeed((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
          : p
      )
    );

    try {
      const res = await addPostComment(postId, text);
      if (!res.success) {
        throw new Error('Comment not accepted on server');
      }

      const real = res.data; // { id, text, createdAt, ... }

      const finalComment: FeedComment = {
        id: real.id,
        text: real.text,
        createdAt: real.createdAt,
        // backend does not return author object, so fallback to "You"
        authorName: 'You',
      };

      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((c) =>
          c.id === tempComment.id ? finalComment : c
        ),
      }));
    } catch (err) {
      console.log('handleSendComment error', err);
      Alert.alert('Error', 'Could not send comment.');

      // rollback optimistic change
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(
          (c) => c.id !== tempComment.id
        ),
      }));
      setFeed((prev) =>
        
          prev.map((p) =>
            p.id === postId
              ? { ...p, commentsCount: Math.max((p.commentsCount || 1) - 1, 0) }
              : p
          )
        );
    }
  };

  // share button
  const handleSharePost = async (post: ThriveFeedPost) => {
    try {
      // backend share counter (for points / analytics)
      await shareThrivePost(post.id).catch(() => { });

      const fullUrl = resolveMediaUrl(post.mediaUrl);

      await Share.share({
        message: post.caption || 'Check this Thrive post',
        url: fullUrl,
        title: 'Thrive post',
      });
    } catch (err) {
      console.log('handleSharePost error', err);
      Alert.alert('Error', 'Could not share this post.');
    }
  };

  /* ------------------ UI ------------------ */

  return (
    <View style={s.root}>
      {/* Header */}
      <LinearGradient
        colors={['#ec4899', '#7c3aed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.header}
      >
        <View style={s.headerTop}>
          <View>
            <Text style={s.headerTitle}>Thrive</Text>
            <Text style={s.headerCaption}>
              Connect, compete, and grow together
            </Text>
          </View>

          <View style={s.headerActions}>
            {/* Explore people */}
            <Pressable
              style={s.iconBtn}
              onPress={() => goTo('ExplorePeople', { creatingTeam: false })}
            >
              <Search size={20} color="#fff" />
            </Pressable>

            {/* Create post */}
            <Pressable
              style={s.iconBtn}
              onPress={() => {
                goTo('ThriveCreatePost');
              }}
            >
              <PlusCircle size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabsRow}>
          {[
            { id: 'feed' as Section, label: 'Feed', Icon: Heart },
            { id: 'challenges' as Section, label: 'Challenges', Icon: Target },
            { id: 'leaderboard' as Section, label: 'Leaderboard', Icon: Trophy },
            {
              id: 'thrivetalk' as Section,
              label: 'ThriveTalk',
              Icon: MessageCircle,
            },
          ].map((t) => {
            const active = activeSection === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setActiveSection(t.id)}
                style={s.tabBtn}
              >
                <t.Icon
                  size={20}
                  color={active ? '#fff' : 'rgba(255,255,255,0.6)'}
                />
                <Text
                  style={[
                    s.tabLabel,
                    { color: active ? '#fff' : 'rgba(255,255,255,0.6)' },
                  ]}
                >
                  {t.label}
                </Text>
                {active && <View style={s.tabUnderline} />}
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ========= FEED ========= */}
        {activeSection === 'feed' && (
          <View>
            {feedLoading && (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <ActivityIndicator />
              </View>
            )}
            {!!feedError && (
              <View style={{ padding: 16 }}>
                <Text style={{ color: '#b91c1c', fontWeight: '600' }}>
                  {feedError}
                </Text>
              </View>
            )}

            <View style={{ rowGap: 8 }}>
              {feedToRender.map((post) => {
                const isLiked = feedLikedIds.includes(post.id);
                const baseLikes = post.likesCount || 0;
                const displayedLikes = isLiked
                  ? baseLikes + (post.likedByMe ? 0 : 1)
                  : baseLikes - (post.likedByMe ? 1 : 0);

                const authorName = `${post.author.firstName} ${post.author.lastName || ''
                  }`.trim();

                const comments = commentsByPost[post.id] || [];
                const commentsExpanded = !!commentsExpandedByPost[post.id];
                const commentsLoading =
                  commentsLoadingByPost[post.id] || false;
                const commentInput = commentInputByPost[post.id] || '';

                return (
                  <View key={post.id} style={s.postCard}>
                    {/* Header */}
                    <View style={s.postHeader}>
                      <Pressable
                        style={s.row}
                        onPress={() =>
                          goTo('UserProfile', { userId: post.author.id })
                        }
                      >
                        <Avatar
                          size={40}
                          uri={post.author.profilePicture || undefined}
                          name={authorName}
                          style={{ marginRight: 10 }}
                        />
                        <View>
                          <Text style={s.postName}>{authorName}</Text>
                          <Text style={s.postTime}>
                            {renderTime(post.createdAt)}
                          </Text>
                        </View>
                      </Pressable>
                      <Pressable style={s.iconPad}>
                        <MoreHorizontal size={20} color="#4b5563" />
                      </Pressable>
                    </View>

                    {/* Caption */}
                    <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
                      <Text style={s.postText}>{post.caption}</Text>
                    </View>

                    {/* Media */}
                    {!!post.mediaUrl && (
                      <Image
                        source={{ uri: resolveMediaUrl(post.mediaUrl) }}
                        style={s.postImage}
                      />
                    )}

                    {/* Actions */}
                    <View style={{ padding: 12 }}>
                      <View style={s.rowBetween}>
                        <View style={s.row}>
                          <Pressable
                            style={s.row}
                            onPress={() => handleToggleLike(post)}
                          >
                            <Heart
                              size={22}
                              color={isLiked ? '#db2777' : '#4b5563'}
                              fill={isLiked ? '#db2777' : 'transparent'}
                            />
                            <Text style={s.actionCount}>
                              {Math.max(displayedLikes, 0)}
                            </Text>
                          </Pressable>
                          <View style={{ width: 16 }} />
                          <Pressable
                            style={s.row}
                            onPress={() => handleToggleComments(post.id)}
                          >
                            <MessageCircle size={22} color="#4b5563" />
                            <Text style={s.actionCount}>
                              {post.commentsCount || 0}
                            </Text>
                          </Pressable>
                        </View>
                        <Pressable onPress={() => handleSharePost(post)}>
                          <Share2 size={22} color="#4b5563" />
                        </Pressable>
                      </View>
                      {baseLikes > 0 && (
                        <Text style={s.likeMeta}>
                          <Text style={s.bold}>
                            {Math.max(displayedLikes, 0)} likes
                          </Text>
                        </Text>
                      )}
                    </View>

                    {/* Comments list */}
                    <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
                      <Pressable
                        onPress={() => handleToggleComments(post.id)}
                      >
                        <Text style={{ color: '#6b7280', fontSize: 12 }}>
                          {commentsExpanded
                            ? 'Hide comments'
                            : post.commentsCount
                              ? `View all ${post.commentsCount} comments`
                              : 'Add a comment'}
                        </Text>
                      </Pressable>

                      {commentsExpanded && (
                        <View style={{ marginTop: 8 }}>
                          {commentsLoading && (
                            <ActivityIndicator size="small" />
                          )}
                          {!commentsLoading &&
                            comments.map((c) => (
                              <View
                                key={c.id}
                                style={{ marginBottom: 4 }}
                              >
                                <Text style={{ fontSize: 13 }}>
                                  <Text style={{ fontWeight: '700' }}>
                                    {c.authorName}:{' '}
                                  </Text>
                                  <Text>{c.text}</Text>
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 10,
                                    color: '#9ca3af',
                                    marginTop: 2,
                                  }}
                                >
                                  {renderTime(c.createdAt)}
                                </Text>
                              </View>
                            ))}
                          {!commentsLoading && comments.length === 0 && (
                            <Text
                              style={{
                                fontSize: 12,
                                color: '#9ca3af',
                              }}
                            >
                              No comments yet. Start the conversation.
                            </Text>
                          )}
                        </View>
                      )}

                      {/* Add comment input – like Instagram */}
                      <View style={s.commentRow}>
                        <TextInput
                          value={commentInput}
                          onChangeText={(txt) =>
                            setCommentInputByPost((prev) => ({
                              ...prev,
                              [post.id]: txt,
                            }))
                          }
                          placeholder="Add a comment..."
                          placeholderTextColor="#9ca3af"
                          style={s.commentInput}
                        />
                        <Pressable
                          disabled={!commentInput.trim()}
                          onPress={() => handleSendComment(post.id)}
                        >
                          <Text
                            style={[
                              s.commentSend,
                              !commentInput.trim() && { opacity: 0.4 },
                            ]}
                          >
                            Send
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ========= CHALLENGES ========= */}
        {activeSection === 'challenges' && (
          <View style={{ padding: 16, rowGap: 16 }}>
            <View>
              <Text style={s.sectionTitle}>Active Challenges</Text>
              <Text style={s.sectionSub}>
                Join friends in wellness challenges
              </Text>
            </View>

            {challengesLoading && (
              <View style={{ paddingVertical: 8 }}>
                <ActivityIndicator />
              </View>
            )}
            {!!challengesError && (
              <Text style={{ color: '#b91c1c', fontWeight: '600' }}>
                {challengesError}
              </Text>
            )}

            {!challengesLoading && !challenges.length && !challengesError && (
              <Text style={{ color: '#6b7280', fontSize: 13 }}>
                No active challenges yet.
              </Text>
            )}

            {challenges.map((c) => {
              const gradient =
                c.category === 'hydration'
                  ? ['#3b82f6', '#06b6d4']
                  : c.category === 'steps'
                    ? ['#ec4899', '#be123c']
                    : ['#8b5cf6', '#4f46e5'];

              return (
                <Pressable
                  key={c.id}
                  onPress={() =>
                    c.joined
                      ? goTo('ThriveChallengeJoined', { challengeId: c.id })
                      : goTo('ThriveChallengeDetail', { challengeId: c.id })
                  }
                  style={s.challengeCard}
                >
                  <Image
                    source={{
                      uri:
                        c.coverImage ||
                        'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600',
                    }}
                    style={s.challengeImage}
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={s.challengeOverlay}
                  />
                  <LinearGradient
                    colors={gradient}
                    style={s.challengeTint}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                  />
                  <View style={s.challengeInner}>
                    <View>
                      <View style={s.rowBetween}>
                        <View style={s.row}>
                          <Target size={24} color="#fff" />
                          <View style={s.daysPill}>
                            <Text style={s.daysPillText}>
                              {c.daysLeft} days left
                            </Text>
                          </View>
                        </View>
                        {c.joined && <CheckCircle size={20} color="#fff" />}
                      </View>
                      <Text style={s.challengeTitle}>{c.title}</Text>
                      {!!c.subtitle && (
                        <Text style={s.challengeDesc}>{c.subtitle}</Text>
                      )}
                    </View>

                    <View>
                      {c.joined && (
                        <View style={{ marginBottom: 8 }}>
                          <View style={s.rowBetween}>
                            <Text style={s.progressMeta}>Your Progress</Text>
                            <Text style={s.progressMeta}>
                              {c.progressPct}%
                            </Text>
                          </View>
                          <View style={s.progressBg}>
                            <View
                              style={[
                                s.progressFill,
                                { width: `${c.progressPct}%` },
                              ]}
                            />
                          </View>
                        </View>
                      )}
                      <View style={s.rowBetween}>
                        <View style={s.row}>
                          <Users size={16} color="#fff" />
                          <Text style={s.participantsText}>
                            {' '}
                            {c.participantsCount} joined
                          </Text>
                        </View>
                        <Pressable
                          style={[
                            s.primaryChip,
                            c.joined
                              ? {
                                backgroundColor: 'rgba(255,255,255,0.2)',
                              }
                              : { backgroundColor: '#fff' },
                          ]}
                        >
                          <Text
                            style={[
                              s.primaryChipText,
                              c.joined
                                ? { color: '#fff' }
                                : { color: '#111827' },
                            ]}
                          >
                            {c.ctaLabel ||
                              (c.joined ? 'View Details' : 'Join Now')}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ========= LEADERBOARD ========= */}
        {activeSection === 'leaderboard' && (
          <View style={{ padding: 16 }}>
            <View style={{ marginBottom: 12 }}>
              <Text style={s.sectionTitle}>This Week</Text>
              <Text style={s.sectionSub}>Top performers in your network</Text>
            </View>

            <View style={s.leaderTabs}>
              <Pressable
                onPress={() => setLeaderboardMode('individual')}
                style={[
                  s.leaderTabBtn,
                  leaderboardMode === 'individual' && s.leaderTabBtnActive,
                ]}
              >
                <Text
                  style={[
                    s.leaderTabText,
                    leaderboardMode === 'individual' &&
                    s.leaderTabTextActive,
                  ]}
                >
                  Individuals
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setLeaderboardMode('teams')}
                style={[
                  s.leaderTabBtn,
                  leaderboardMode === 'teams' && s.leaderTabBtnActive,
                ]}
              >
                <Text
                  style={[
                    s.leaderTabText,
                    leaderboardMode === 'teams' && s.leaderTabTextActive,
                  ]}
                >
                  Teams
                </Text>
              </Pressable>
            </View>

            {leaderboardMode === 'individual' ? (
              <>
                {leaderLoading && (
                  <View style={{ paddingVertical: 8 }}>
                    <ActivityIndicator />
                  </View>
                )}
                {!!leaderError && (
                  <Text style={{ color: '#b91c1c', fontWeight: '600' }}>
                    {leaderError}
                  </Text>
                )}
                {!leaderLoading && !leaders.length && !leaderError && (
                  <Text style={{ color: '#6b7280', fontSize: 13 }}>
                    No leaderboard data yet.
                  </Text>
                )}

                <View style={{ rowGap: 8 }}>
                  {leaders.map((u) => (
                    <View
                      key={u.rank}
                      style={[
                        s.leaderRow,
                        u.isCurrentUser
                          ? { backgroundColor: 'transparent' }
                          : { backgroundColor: '#fff' },
                      ]}
                    >
                      {u.isCurrentUser && (
                        <LinearGradient
                          colors={['#ec4899', '#be123c']}
                          style={s.leaderYouBg}
                        />
                      )}
                      <View style={s.row}>
                        <View
                          style={[
                            s.rankIcon,
                            {
                              backgroundColor: u.isCurrentUser
                                ? 'rgba(255,255,255,0.2)'
                                : '#f3f4f6',
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontWeight: '800',
                              color: u.isCurrentUser ? '#fff' : '#111827',
                            }}
                          >
                            {u.rank}
                          </Text>
                        </View>
                        <Avatar
                          size={48}
                          uri={u.profilePic || undefined}
                          name={u.name}
                          style={{ marginRight: 10 }}
                        />
                        <View>
                          <Text
                            style={[
                              s.leaderName,
                              u.isCurrentUser ? { color: '#fff' } : null,
                            ]}
                          >
                            {u.name}
                          </Text>
                          <Text
                            style={[
                              s.leaderRank,
                              u.isCurrentUser
                                ? { color: 'rgba(255,255,255,0.8)' }
                                : null,
                            ]}
                          >
                            Rank #{u.rank}
                          </Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <View style={s.row}>
                          <Trophy
                            size={16}
                            color={u.isCurrentUser ? '#fde68a' : '#eab308'}
                          />
                          <Text
                            style={[
                              s.leaderPts,
                              u.isCurrentUser ? { color: '#fff' } : null,
                            ]}
                          >
                            {' '}
                            {u.points}
                          </Text>
                        </View>
                        <Text
                          style={[
                            s.leaderPtsMeta,
                            u.isCurrentUser
                              ? { color: 'rgba(255,255,255,0.8)' }
                              : null,
                          ]}
                        >
                          coins
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <>
                {teamLeaderLoading && (
                  <View style={{ paddingVertical: 8 }}>
                    <ActivityIndicator />
                  </View>
                )}
                {!!teamLeaderError && (
                  <Text style={{ color: '#b91c1c', fontWeight: '600' }}>
                    {teamLeaderError}
                  </Text>
                )}
                {!teamLeaderLoading &&
                  !teamLeaders.length &&
                  !teamLeaderError && (
                    <Text style={{ color: '#6b7280', fontSize: 13 }}>
                      No team leaderboard data yet.
                    </Text>
                  )}

                <View style={{ rowGap: 8 }}>
                  {teamLeaders.map((team) => (
                    <Pressable
                      key={team.id}
                      style={[s.leaderRow, { backgroundColor: '#fff' }]}
                      onPress={() => goTo('TeamDetail', { teamId: team.id })}
                    >
                      <View style={s.row}>
                        <View
                          style={[s.rankIcon, { backgroundColor: '#f3f4f6' }]}
                        >
                          <Text
                            style={{
                              fontWeight: '800',
                              color: '#111827',
                            }}
                          >
                            {team.rank}
                          </Text>
                        </View>
                        <Avatar
                          size={48}
                          uri={team.avatarUrl || undefined}
                          name={team.name}
                          style={{ marginRight: 10 }}
                        />
                        <View>
                          <Text style={s.leaderName}>{team.name}</Text>
                          <Text style={s.leaderRank}>
                            {team.membersCount} members
                          </Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <View style={s.row}>
                          <Trophy size={16} color="#eab308" />
                          <Text style={s.leaderPts}> {team.points}</Text>
                        </View>
                        <Text style={s.leaderPtsMeta}>team points</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* ========= THRIVETALK ========= */}
        {activeSection === 'thrivetalk' && (
          <View style={{ padding: 16 }}>
            {/* Search bar – future filtering */}
            <View style={{ marginBottom: 12 }}>
              <View style={{ position: 'relative' }}>
                <Search size={18} color="#9ca3af" style={s.searchIcon} />
                <TextInput
                  placeholder="Search ThriveTalk..."
                  placeholderTextColor="#9ca3af"
                  style={s.searchInput}
                  editable={false}
                />
              </View>
            </View>

            {/* Direct message threads */}
            <Text style={[s.smallMuted, { marginBottom: 8 }]}>
              DIRECT MESSAGES
            </Text>

            {threadsLoading && (
              <View style={{ paddingVertical: 8 }}>
                <ActivityIndicator />
              </View>
            )}
            {!!threadsError && (
              <Text style={{ color: '#b91c1c', fontWeight: '600' }}>
                {threadsError}
              </Text>
            )}
            {!threadsLoading && !dmThreads.length && !threadsError && (
              <Text style={{ color: '#6b7280', fontSize: 13 }}>
                No conversations yet. Start chatting from a profile or
                connections list.
              </Text>
            )}

            <View style={{ rowGap: 8 }}>
              {dmThreads.map((thread) => {
                const hasUnread =
                  !!thread.unreadCount && thread.unreadCount > 0;
                return (
                  <Pressable
                    key={thread.userId}
                    style={[s.chatRow, hasUnread && s.chatRowUnread]}
                    onPress={() =>
                      navigation.navigate('ThriveChat', {
                        mode: 'dm',
                        userId: thread.userId,
                        name: thread.name,
                      })
                    }
                  >
                    <View style={s.rowBetween}>
                      <View style={{ flexDirection: 'row', flex: 1 }}>
                        <Avatar
                          size={40}
                          uri={thread.profilePicture || undefined}
                          name={thread.name}
                          style={{ marginRight: 10 }}
                        />
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text
                            numberOfLines={1}
                            style={[
                              s.chatName,
                              hasUnread && { color: '#111827' },
                            ]}
                          >
                            {thread.name}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[
                              s.chatMsg,
                              hasUnread && {
                                color: '#4b5563',
                                fontWeight: '500',
                              },
                            ]}
                          >
                            {thread.lastMessageBody}
                          </Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text
                          style={[
                            s.chatTime,
                            hasUnread && {
                              color: '#db2777',
                              fontWeight: '600',
                            },
                          ]}
                        >
                          {renderTime(thread.lastMessageAt)}
                        </Text>
                        {hasUnread && (
                          <View style={s.unreadBadge}>
                            <Text style={s.unreadBadgeText}>
                              {thread.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Teams / Groups */}
            <View style={{ marginTop: 16 }}>
              <View style={s.rowBetween}>
                <Text style={s.smallMuted}>YOUR TEAMS</Text>
                <Pressable
                  onPress={() =>
                    goTo('ExplorePeople', { creatingTeam: true })
                  }
                >
                  <Text style={s.linkPink}>Create Team</Text>
                </Pressable>
              </View>

              {teamsLoading && (
                <View style={{ paddingVertical: 8 }}>
                  <ActivityIndicator />
                </View>
              )}
              {!!teamsError && (
                <Text style={{ color: '#b91c1c', fontWeight: '600' }}>
                  {teamsError}
                </Text>
              )}
              {!teamsLoading && !teams.length && !teamsError && (
                <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>
                  You’re not part of any team yet. Once you join a group, it
                  will appear here and on the team leaderboard.
                </Text>
              )}

              <View style={{ rowGap: 8, marginTop: 8 }}>
                {teams.map((team) => (
                  <Pressable
                    key={team.id}
                    style={s.groupRow}
                    onPress={() => goTo('TeamDetail', { teamId: team.id })}
                  >
                    <LinearGradient
                      colors={['#ec4899', '#7c3aed']}
                      style={s.groupIcon}
                    >
                      <Users size={20} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={s.groupTitle}>{team.name}</Text>
                      <Text style={s.groupSub}>
                        {team.membersCount} members
                      </Text>
                    </View>
                    <View style={s.row}>
                      {!!team.unreadCount && team.unreadCount > 0 && (
                        <View style={s.pinkDot} />
                      )}
                      <MessageCircle size={20} color="#db2777" />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* -------- Styles -------- */

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },

  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerCaption: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  tabsRow: { flexDirection: 'row', marginHorizontal: -16 },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  tabLabel: { marginTop: 4, fontSize: 12, fontWeight: '600' },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#fff',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },

  // avatar fallback
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
  },
  avatarFallbackText: {
    color: '#fff',
    fontWeight: '800',
  },

  // Posts
  postCard: { backgroundColor: '#fff', marginBottom: 8 },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  postName: { color: '#111827', fontWeight: '700', fontSize: 14 },
  postTime: { color: '#6b7280', fontSize: 11 },
  iconPad: { padding: 8, borderRadius: 9999 },
  postText: { color: '#111827', fontSize: 14, marginBottom: 8 },
  postImage: { width: '100%', height: 220 },

  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCount: { marginLeft: 6, color: '#111827', fontWeight: '600' },
  likeMeta: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  bold: { fontWeight: '700' },

  // Section titles
  sectionTitle: { color: '#111827', fontWeight: '800', fontSize: 16 },
  sectionSub: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  linkPink: { color: '#db2777', fontWeight: '600', fontSize: 12 },

  primaryBtn: {
    backgroundColor: '#db2777',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800' },

  // Challenge cards
  challengeCard: { height: 220, borderRadius: 16, overflow: 'hidden' },
  challengeImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  challengeOverlay: { ...StyleSheet.absoluteFillObject },
  challengeTint: { ...StyleSheet.absoluteFillObject, opacity: 0.25 },
  challengeInner: { flex: 1, padding: 16, justifyContent: 'space-between' },
  daysPill: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  daysPillText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  challengeTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 20,
    marginTop: 6,
  },
  challengeDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 2,
  },
  progressMeta: { color: '#fff', fontSize: 12 },
  progressBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 999 },
  participantsText: { color: '#fff', fontSize: 14 },
  primaryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  primaryChipText: { fontWeight: '800' },

  // Leaderboard
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    overflow: 'hidden',
  },
  leaderYouBg: { ...StyleSheet.absoluteFillObject, borderRadius: 16 },
  rankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  leaderName: { fontWeight: '800', color: '#111827' },
  leaderRank: { color: '#6b7280', fontSize: 12 },
  leaderPts: { fontWeight: '800', fontSize: 16, color: '#111827' },
  leaderPtsMeta: { color: '#9ca3af', fontSize: 11 },

  // Leaderboard mode toggle
  leaderTabs: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    padding: 2,
    marginBottom: 12,
  },
  leaderTabBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderTabBtnActive: {
    backgroundColor: '#fff',
  },
  leaderTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  leaderTabTextActive: {
    color: '#111827',
  },

  // Chat (ThriveTalk)
  searchIcon: { position: 'absolute', left: 12, top: 12 },
  searchInput: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingLeft: 40,
    paddingRight: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  smallMuted: { color: '#6b7280', fontSize: 12, fontWeight: '600' },

  chatRow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  chatRowUnread: {
    backgroundColor: '#fdf2f8',
    borderColor: '#f9a8d4',
  },
  chatName: { color: '#111827', fontWeight: '800', flexShrink: 1 },
  chatTime: { color: '#9ca3af', fontSize: 12, marginLeft: 8 },
  chatMsg: { color: '#6b7280', fontSize: 13, marginTop: 2 },

  unreadBadge: {
    marginTop: 4,
    minWidth: 20,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#db2777',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  groupTitle: { color: '#111827', fontWeight: '800' },
  groupSub: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  pinkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#db2777',
    marginRight: 8,
  },

  // comments UI
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
  },
  commentInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
    paddingRight: 8,
    color: '#111827',
  },
  commentSend: {
    fontSize: 13,
    fontWeight: '700',
    color: '#db2777',
  },
});
