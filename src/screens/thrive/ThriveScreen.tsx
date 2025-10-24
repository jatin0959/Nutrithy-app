// ThriveScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search, Trophy, Flame, Target, Users, Star, Calendar as CalendarIcon,
  CheckCircle, MessageCircle, Heart, Share2, Plus, MoreHorizontal,
  ShoppingBag, Sparkles, UserPlus, Send
} from 'lucide-react-native';

interface ThriveScreenProps {
  onNavigate: (screen: string) => void;
}

const stories = [
  { id: 1, title: 'Your Story', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', hasNew: false, isYou: true },
  { id: 2, title: 'Priya', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', hasNew: true },
  { id: 3, title: 'Rahul', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', hasNew: true },
  { id: 4, title: 'Anita', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', hasNew: false },
  { id: 5, title: 'Vikram', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', hasNew: true },
  { id: 6, title: 'Meera', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200', hasNew: true },
];

const feedPosts = [
  {
    id: 1,
    user: { name: 'Priya Sharma', username: '@priya_fit', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', isFollowing: true },
    content: 'Just completed my 10K steps challenge for the 6th day in a row! Feeling amazing!',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
    achievement: '6-Day Streak',
    likes: 24,
    comments: 8,
    time: '2 hours ago',
  },
  {
    id: 2,
    user: { name: 'Rahul Verma', username: '@rahul_wellness', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', isFollowing: true },
    content: 'Morning smoothie bowl prep! Starting the day with nutrition goals on track.',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
    achievement: 'Nutrition Pro',
    likes: 31,
    comments: 12,
    time: '4 hours ago',
  },
  {
    id: 3,
    user: { name: 'Anita Desai', username: '@anita_health', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', isFollowing: true },
    content: 'Completed all 7 days of the Hydration Challenge! 💧 Who else is in?',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
    achievement: 'Challenge Master 🏆',
    likes: 45,
    comments: 15,
    time: '6 hours ago',
  },
];

const groupChallenges = [
  {
    id: 1,
    title: '10K Steps Challenge',
    description: 'Walk 10,000 steps daily for 7 days',
    participants: 24,
    daysLeft: 3,
    icon: Target,
    gradient: ['#ec4899', '#be123c'], // pink->rose
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600',
    joined: true,
    progress: 65,
  },
  {
    id: 2,
    title: 'Hydration Squad',
    description: 'Drink 8 glasses of water daily',
    participants: 18,
    daysLeft: 5,
    icon: Trophy,
    gradient: ['#3b82f6', '#06b6d4'], // blue->cyan
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600',
    joined: true,
    progress: 80,
  },
  {
    id: 3,
    title: 'Mindful Moments',
    description: '15 min meditation every day',
    participants: 32,
    daysLeft: 7,
    icon: Flame,
    gradient: ['#8b5cf6', '#4f46e5'], // purple->indigo
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
    joined: false,
    progress: 0,
  },
];

const leaderboard = [
  { rank: 1, name: 'Priya Sharma', points: 2450, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', badge: '🥇' },
  { rank: 2, name: 'You', points: 2280, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', badge: '🥈', isYou: true },
  { rank: 3, name: 'Anita Desai', points: 2150, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', badge: '🥉' },
  { rank: 4, name: 'Rahul Verma', points: 1980, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', badge: '4' },
  { rank: 5, name: 'Vikram Singh', points: 1850, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', badge: '5' },
];

const onlineFriends = [
  { id: 1, name: 'Priya', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  { id: 2, name: 'Rahul', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { id: 3, name: 'Vikram', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
];

type Section = 'feed' | 'challenges' | 'leaderboard' | 'chat';

export default function ThriveScreen({ onNavigate }: ThriveScreenProps) {
  const [activeSection, setActiveSection] = useState<Section>('feed');
  const [likedPosts, setLikedPosts] = useState<number[]>([2, 3]);
  const [followedUsers, setFollowedUsers] = useState<number[]>([]);

  const toggleLike = (postId: number) => {
    setLikedPosts((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]));
  };

  const toggleFollow = (userId: number) => {
    setFollowedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  // --- UI ---
  return (
    <View style={s.root}>
      {/* Header */}
      <LinearGradient colors={['#ec4899', '#7c3aed']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.headerTitle}>Thrive</Text>
            <Text style={s.headerCaption}>Connect, compete, and grow together</Text>
          </View>
          <Pressable style={s.searchBtn}>
            <Search size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Section Tabs */}
        <View style={s.tabsRow}>
          {[
            { id: 'feed', label: 'Feed', Icon: Heart },
            { id: 'challenges', label: 'Challenges', Icon: Target },
            { id: 'leaderboard', label: 'Leaderboard', Icon: Trophy },
            { id: 'chat', label: 'Chat', Icon: MessageCircle },
          ].map((t) => {
            const active = activeSection === (t.id as Section);
            return (
              <Pressable
                key={t.id}
                onPress={() => setActiveSection(t.id as Section)}
                style={[s.tabBtn, active && s.tabBtnActive]}
              >
                <t.Icon size={20} color={active ? '#fff' : 'rgba(255,255,255,0.6)'} />
                <Text style={[s.tabLabel, { color: active ? '#fff' : 'rgba(255,255,255,0.6)' }]}>{t.label}</Text>
                {active && <View style={s.tabUnderline} />}
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        {/* FEED */}
        {activeSection === 'feed' && (
          <View>
            {/* Stories */}
            <View style={s.storiesWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {stories.map((st) => (
                  <View key={st.id} style={s.storyItem}>
                    <View style={[s.storyRing, { backgroundColor: st.hasNew ? 'transparent' : '#d1d5db' }]}>
                      {st.hasNew && (
                        <LinearGradient colors={['#ec4899', '#7c3aed']} style={s.storyRingGrad} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} />
                      )}
                      <View style={s.storyInner}>
                        <Image source={{ uri: st.image }} style={s.storyAvatar} />
                        {st.isYou && (
                          <View style={s.storyPlus}>
                            <Plus size={12} color="#fff" />
                          </View>
                        )}
                      </View>
                    </View>
                    <Text numberOfLines={1} style={s.storyLabel}>{st.title}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Posts */}
            <View style={{ rowGap: 8 }}>
              {feedPosts.map((post) => {
                const isLiked = likedPosts.includes(post.id);
                return (
                  <View key={post.id} style={s.postCard}>
                    {/* Header */}
                    <View style={s.postHeader}>
                      <View style={s.row}>
                        <Image source={{ uri: post.user.image }} style={s.postAvatar} />
                        <View>
                          <Text style={s.postName}>{post.user.name}</Text>
                          <Text style={s.postTime}>{post.time}</Text>
                        </View>
                      </View>
                      <Pressable style={s.iconPad}>
                        <MoreHorizontal size={20} color="#4b5563" />
                      </Pressable>
                    </View>

                    {/* Content */}
                    <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
                      <Text style={s.postText}>{post.content}</Text>
                      {!!post.achievement && (
                        <View style={s.achPill}>
                          <Trophy size={14} color="#db2777" />
                          <Text style={s.achPillText}>{post.achievement}</Text>
                        </View>
                      )}
                    </View>

                    {/* Image */}
                    {!!post.image && <Image source={{ uri: post.image }} style={s.postImage} />}

                    {/* Actions */}
                    <View style={{ padding: 12 }}>
                      <View style={s.rowBetween}>
                        <View style={s.row}>
                          <Pressable style={s.row} onPress={() => toggleLike(post.id)}>
                            <Heart size={22} color={isLiked ? '#db2777' : '#4b5563'} fill={isLiked ? '#db2777' : 'transparent'} />
                            <Text style={s.actionCount}>{isLiked ? post.likes + 1 : post.likes}</Text>
                          </Pressable>
                          <View style={{ width: 16 }} />
                          <View style={s.row}>
                            <MessageCircle size={22} color="#4b5563" />
                            <Text style={s.actionCount}>{post.comments}</Text>
                          </View>
                        </View>
                        <Pressable>
                          <Share2 size={22} color="#4b5563" />
                        </Pressable>
                      </View>
                      {post.likes > 0 && (
                        <Text style={s.likeMeta}>
                          Liked by <Text style={s.bold}>Anita</Text> and{' '}
                          <Text style={s.bold}>{isLiked ? post.likes : post.likes - 1} others</Text>
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Explore more people */}
            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
              <Pressable
                onPress={() => onNavigate('explore-people')}
                style={s.primaryBtn}
              >
                <UserPlus size={20} color="#fff" />
                <Text style={s.primaryBtnText}>Explore More People</Text>
              </Pressable>
            </View>

            {/* Suggested connections */}
            <View style={s.sectionCard}>
              <View style={s.rowBetween}>
                <Text style={s.sectionTitle}>Suggested for You</Text>
                <Pressable onPress={() => onNavigate('explore-people')}>
                  <Text style={s.linkPink}>See All</Text>
                </Pressable>
              </View>

              <View style={{ rowGap: 8 }}>
                {[
                  { id: 5, name: 'Meera Patel', username: '@meera_health', role: 'Health Coach', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', mutualFriends: 3 },
                  { id: 6, name: 'Arjun Kapoor', username: '@arjun_fitness', role: 'Fitness Trainer', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', mutualFriends: 5 },
                ].map((u) => {
                  const isFollowed = followedUsers.includes(u.id);
                  return (
                    <View key={u.id} style={s.suggestItem}>
                      <View style={s.row}>
                        <Image source={{ uri: u.image }} style={s.suggestAvatar} />
                        <View>
                          <Text style={s.suggestName}>{u.name}</Text>
                          <Text style={s.suggestUser}>{u.username}</Text>
                          <Text style={s.suggestMutual}>{u.mutualFriends} mutual connections</Text>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => toggleFollow(u.id)}
                        style={[
                          s.followBtn,
                          isFollowed ? { backgroundColor: '#e5e7eb' } : { backgroundColor: '#db2777' },
                        ]}
                      >
                        {isFollowed ? (
                          <>
                            <CheckCircle size={14} color="#374151" />
                            <Text style={[s.followText, { color: '#374151' }]}>Following</Text>
                          </>
                        ) : (
                          <>
                            <UserPlus size={14} color="#fff" />
                            <Text style={[s.followText, { color: '#fff' }]}>Connect</Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* CHALLENGES */}
        {activeSection === 'challenges' && (
          <View style={{ padding: 16, rowGap: 16 }}>
            <View>
              <Text style={s.sectionTitle}>Active Challenges</Text>
              <Text style={s.sectionSub}>Join friends in wellness challenges</Text>
            </View>

            {groupChallenges.map((c) => (
              <Pressable key={c.id} onPress={() => onNavigate(`challenge-${c.id}`)} style={s.challengeCard}>
                <Image source={{ uri: c.image }} style={s.challengeImage} />
                <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={s.challengeOverlay} />
                <LinearGradient colors={c.gradient} style={s.challengeTint} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} />
                <View style={s.challengeInner}>
                  <View>
                    <View style={s.rowBetween}>
                      <View style={s.row}>
                        <c.icon size={24} color="#fff" />
                        <View style={s.daysPill}>
                          <Text style={s.daysPillText}>{c.daysLeft} days left</Text>
                        </View>
                      </View>
                      {c.joined && <CheckCircle size={20} color="#fff" />}
                    </View>
                    <Text style={s.challengeTitle}>{c.title}</Text>
                    <Text style={s.challengeDesc}>{c.description}</Text>
                  </View>

                  <View>
                    {c.joined && (
                      <View style={{ marginBottom: 8 }}>
                        <View style={s.rowBetween}>
                          <Text style={s.progressMeta}>Your Progress</Text>
                          <Text style={s.progressMeta}>{c.progress}%</Text>
                        </View>
                        <View style={s.progressBg}>
                          <View style={[s.progressFill, { width: `${c.progress}%` }]} />
                        </View>
                      </View>
                    )}
                    <View style={s.rowBetween}>
                      <View style={s.row}>
                        <Users size={16} color="#fff" />
                        <Text style={s.participantsText}> {c.participants} joined</Text>
                      </View>
                      <Pressable style={[s.primaryChip, c.joined ? { backgroundColor: 'rgba(255,255,255,0.2)' } : { backgroundColor: '#fff' }]}>
                        <Text style={[s.primaryChipText, c.joined ? { color: '#fff' } : { color: '#111827' }]}>
                          {c.joined ? 'View Details' : 'Join Now'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* LEADERBOARD */}
        {activeSection === 'leaderboard' && (
          <View style={{ padding: 16 }}>
            <View style={{ marginBottom: 12 }}>
              <Text style={s.sectionTitle}>This Week</Text>
              <Text style={s.sectionSub}>Top performers in your network</Text>
            </View>

            <View style={{ rowGap: 8 }}>
              {leaderboard.map((u) => (
                <View
                  key={u.rank}
                  style={[
                    s.leaderRow,
                    u.isYou ? { backgroundColor: 'transparent' } : { backgroundColor: '#fff' },
                  ]}
                >
                  {u.isYou ? (
                    <LinearGradient colors={['#ec4899', '#be123c']} style={s.leaderYouBg} />
                  ) : null}
                  <View style={s.row}>
                    <View style={[s.rankIcon, { backgroundColor: u.isYou ? 'rgba(255,255,255,0.2)' : '#f3f4f6' }]}>
                      <Text style={{ fontWeight: '800', color: u.isYou ? '#fff' : '#111827' }}>{u.badge}</Text>
                    </View>
                    <Image source={{ uri: u.image }} style={s.leaderAvatar} />
                    <View>
                      <Text style={[s.leaderName, u.isYou ? { color: '#fff' } : null]}>{u.name}</Text>
                      <Text style={[s.leaderRank, u.isYou ? { color: 'rgba(255,255,255,0.8)' } : null]}>
                        Rank #{u.rank}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={s.row}>
                      <Trophy size={16} color={u.isYou ? '#fde68a' : '#eab308'} />
                      <Text style={[s.leaderPts, u.isYou ? { color: '#fff' } : null]}> {u.points}</Text>
                    </View>
                    <Text style={[s.leaderPtsMeta, u.isYou ? { color: 'rgba(255,255,255,0.8)' } : null]}>points</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Your stats */}
            <View style={s.yourStatsCard}>
              <Text style={s.sectionTitle}>Your Stats This Week</Text>
              <View style={s.statsGrid}>
                {[
                  { label: 'Total Steps', value: '68,450', Icon: Target },
                  { label: 'Challenges Won', value: '3', Icon: Trophy },
                  { label: 'Active Days', value: '7/7', Icon: CalendarIcon },
                  { label: 'Points Earned', value: '+850', Icon: Star },
                ].map((st) => (
                  <View key={st.label} style={s.statBox}>
                    <st.Icon size={24} color="#db2777" />
                    <Text style={s.statBoxValue}>{st.value}</Text>
                    <Text style={s.statBoxLabel}>{st.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* CHAT */}
        {activeSection === 'chat' && (
          <View style={{ padding: 16 }}>
            {/* Search */}
            <View style={{ marginBottom: 12 }}>
              <View style={{ position: 'relative' }}>
                <Search size={18} color="#9ca3af" style={s.searchIcon} />
                <TextInput
                  placeholder="Search messages..."
                  placeholderTextColor="#9ca3af"
                  style={s.searchInput}
                />
              </View>
            </View>

            {/* Online friends */}
            <View style={{ marginBottom: 16 }}>
              <View style={s.rowBetween}>
                <Text style={s.smallMuted}>ONLINE NOW</Text>
                <Pressable><Text style={s.linkPink}>View All</Text></Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
                {onlineFriends.map((f) => (
                  <Pressable key={f.id} style={{ alignItems: 'center', marginRight: 12 }}>
                    <View style={{ position: 'relative' }}>
                      <Image source={{ uri: f.image }} style={s.friendAvatar} />
                      <View style={s.onlineDot} />
                    </View>
                    <Text numberOfLines={1} style={s.friendName}>{f.name}</Text>
                  </Pressable>
                ))}
                {/* Add button */}
                <Pressable style={{ alignItems: 'center', marginRight: 12 }}>
                  <LinearGradient colors={['#ec4899', '#7c3aed']} style={s.addFriendBtn}>
                    <UserPlus size={24} color="#fff" />
                  </LinearGradient>
                  <Text numberOfLines={1} style={[s.friendName, { color: '#db2777' }]}>Add</Text>
                </Pressable>
              </ScrollView>
            </View>

            {/* Messages */}
            <Text style={[s.smallMuted, { marginBottom: 8 }]}>MESSAGES</Text>
            <View style={{ rowGap: 8 }}>
              {[
                { name: 'Priya Sharma', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', message: 'Great job on the challenge!', time: '2m', unread: 2, online: true },
                { name: 'Rahul Verma', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', message: "Let's team up for the next one", time: '1h', unread: 0, online: true },
                { name: 'Vikram Singh', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', message: 'See you at the workshop?', time: '3h', unread: 0, online: false },
                { name: 'Anita Desai', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', message: 'Thanks for the motivation!', time: '5h', unread: 0, online: false },
              ].map((chat, idx) => (
                <Pressable key={idx} style={s.chatRow}>
                  <View style={s.row}>
                    <View style={{ position: 'relative' }}>
                      <Image source={{ uri: chat.image }} style={s.chatAvatar} />
                      {chat.online && <View style={s.onlineDotSmall} />}
                      {chat.unread > 0 && (
                        <View style={s.unreadBadge}>
                          <Text style={s.unreadText}>{chat.unread}</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={s.rowBetween}>
                        <Text numberOfLines={1} style={s.chatName}>{chat.name}</Text>
                        <Text style={s.chatTime}>{chat.time}</Text>
                      </View>
                      <Text numberOfLines={1} style={[s.chatMsg, chat.unread > 0 ? { color: '#111827', fontWeight: '600' } : null]}>
                        {chat.message}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Challenge groups */}
            <View style={{ marginTop: 16 }}>
              <View style={s.rowBetween}>
                <Text style={s.smallMuted}>CHALLENGE GROUPS</Text>
                <Pressable><Text style={s.linkPink}>See All</Text></Pressable>
              </View>
              <View style={{ rowGap: 8, marginTop: 8 }}>
                {groupChallenges.filter((c) => c.joined).map((c) => (
                  <Pressable key={c.id} style={s.groupRow}>
                    <LinearGradient colors={c.gradient} style={s.groupIcon}>
                      <c.icon size={20} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={s.groupTitle}>{c.title}</Text>
                      <Text style={s.groupSub}>{c.participants} members • 3 new</Text>
                    </View>
                    <View style={s.row}>
                      <View style={s.pinkDot} />
                      <MessageCircle size={20} color="#db2777" />
                    </View>
                  </Pressable>
                ))}
              </View>

              <Pressable style={[s.primaryBtn, { marginTop: 12 }]}>
                <Send size={20} color="#fff" />
                <Text style={s.primaryBtnText}>Start New Conversation</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },

  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 0, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerCaption: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  searchBtn: { padding: 8, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.1)' },

  tabsRow: { flexDirection: 'row', marginHorizontal: -16 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, position: 'relative' },
  tabBtnActive: {},
  tabLabel: { marginTop: 4, fontSize: 12, fontWeight: '600' },
  tabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: '#fff', borderTopLeftRadius: 999, borderTopRightRadius: 999 },

  // Stories
  storiesWrap: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 10 },
  storyItem: { alignItems: 'center', marginRight: 12 },
  storyRing: { width: 64, height: 64, borderRadius: 32, padding: 2, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  storyRingGrad: { ...StyleSheet.absoluteFillObject, borderRadius: 32 },
  storyInner: { width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 32, padding: 2 },
  storyAvatar: { width: '100%', height: '100%', borderRadius: 32 },
  storyPlus: { position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#db2777', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  storyLabel: { fontSize: 11, marginTop: 4, width: 64, textAlign: 'center', color: '#111827' },

  // Posts
  postCard: { backgroundColor: '#fff' },
  postHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  postAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  postName: { color: '#111827', fontWeight: '700', fontSize: 14 },
  postTime: { color: '#6b7280', fontSize: 11 },
  iconPad: { padding: 8, borderRadius: 9999 },
  postText: { color: '#111827', fontSize: 14, marginBottom: 8 },
  achPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fde7f3', borderColor: '#fbcfe8', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9999, alignSelf: 'flex-start' },
  achPillText: { color: '#db2777', fontWeight: '800', fontSize: 12, marginLeft: 6 },
  postImage: { width: '100%', height: 220 },

  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionCount: { marginLeft: 6, color: '#111827', fontWeight: '600' },
  likeMeta: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  bold: { fontWeight: '700' },

  // Section card
  sectionCard: { backgroundColor: '#fff', marginTop: 8, padding: 16 },
  sectionTitle: { color: '#111827', fontWeight: '800', fontSize: 16 },
  sectionSub: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  linkPink: { color: '#db2777', fontWeight: '600', fontSize: 12 },

  suggestItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderRadius: 12, padding: 12 },
  suggestAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 10 },
  suggestName: { color: '#111827', fontWeight: '700', fontSize: 14 },
  suggestUser: { color: '#6b7280', fontSize: 12 },
  suggestMutual: { color: '#9ca3af', fontSize: 12 },
  followBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, columnGap: 6 },
  followText: { fontWeight: '700', fontSize: 13 },

  // Primary button
  primaryBtn: { backgroundColor: '#db2777', borderRadius: 16, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', columnGap: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  primaryBtnText: { color: '#fff', fontWeight: '800' },

  // Challenge cards
  challengeCard: { height: 220, borderRadius: 16, overflow: 'hidden' },
  challengeImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  challengeOverlay: { ...StyleSheet.absoluteFillObject },
  challengeTint: { ...StyleSheet.absoluteFillObject, opacity: 0.25 },
  challengeInner: { flex: 1, padding: 16, justifyContent: 'space-between' },
  daysPill: { marginLeft: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)' },
  daysPillText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  challengeTitle: { color: '#fff', fontWeight: '800', fontSize: 20, marginTop: 6 },
  challengeDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
  progressMeta: { color: '#fff', fontSize: 12 },
  progressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 999 },
  participantsText: { color: '#fff', fontSize: 14 },
  primaryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  primaryChipText: { fontWeight: '800' },

  // Leaderboard
  leaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 16, overflow: 'hidden' },
  leaderYouBg: { ...StyleSheet.absoluteFillObject, borderRadius: 16 },
  rankIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  leaderAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 10 },
  leaderName: { fontWeight: '800', color: '#111827' },
  leaderRank: { color: '#6b7280', fontSize: 12 },
  leaderPts: { fontWeight: '800', fontSize: 16, color: '#111827' },
  leaderPtsMeta: { color: '#9ca3af', fontSize: 11 },

  yourStatsCard: { marginTop: 16, borderRadius: 16, padding: 16, backgroundColor: '#fff0', borderWidth: 1, borderColor: '#fce7f3', backgroundGradient: undefined, },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statBox: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center' },
  statBoxValue: { color: '#111827', fontWeight: '800', fontSize: 18, marginTop: 6 },
  statBoxLabel: { color: '#6b7280', fontSize: 12 },

  // Chat
  searchIcon: { position: 'absolute', left: 12, top: 12 },
  searchInput: { backgroundColor: '#fff', paddingVertical: 10, paddingLeft: 40, paddingRight: 14, borderRadius: 999, borderWidth: 1, borderColor: '#e5e7eb', color: '#111827' },
  smallMuted: { color: '#6b7280', fontSize: 12, fontWeight: '600' },

  friendAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#fff' },
  friendName: { color: '#111827', fontSize: 12, marginTop: 6, width: 64, textAlign: 'center', fontWeight: '600' },
  addFriendBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  onlineDot: { position: 'absolute', right: -2, bottom: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#fff' },

  chatRow: { backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  chatAvatar: { width: 56, height: 56, borderRadius: 28 },
  onlineDotSmall: { position: 'absolute', right: -2, bottom: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#fff' },
  unreadBadge: { position: 'absolute', right: -4, top: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#db2777', alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  chatName: { color: '#111827', fontWeight: '800', flexShrink: 1 },
  chatTime: { color: '#9ca3af', fontSize: 12, marginLeft: 8 },
  chatMsg: { color: '#6b7280', fontSize: 13, marginTop: 2 },

  groupRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  groupIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  groupTitle: { color: '#111827', fontWeight: '800' },
  groupSub: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  pinkDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#db2777', marginRight: 8 },
});
