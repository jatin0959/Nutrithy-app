// src/screens/thrive/ThriveChatScreen.tsx
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DirectMessage,
  getDirectMessages,
  sendDirectMessage,
  // 👇 you will add these in ../../api/thrive
  getTeamChatMessages,
  sendTeamChatMessage,
} from '../../api/thrive';

// ------- ROUTE PARAMS – supports both direct + group -------

type DirectChatParams = {
  mode?: 'direct'; // default
  userId: string;
  name: string;
  isOnline?: boolean;
  lastSeen?: string;
};

type GroupChatParams = {
  mode: 'group';
  teamId: string;
  name: string;
};

type ChatRouteParams = DirectChatParams | GroupChatParams;

// ------- Presence hook (primarily for direct chats) -------

function useThrivePresence(
  key: string,
  initialOnline?: boolean,
  initialLastSeen?: string
) {
  const [online, setOnline] = useState<boolean>(initialOnline ?? false);
  const [lastSeen, setLastSeen] = useState<string | null>(
    initialLastSeen ?? null
  );
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setOnline(initialOnline ?? false);
    setLastSeen(initialLastSeen ?? null);
  }, [key, initialOnline, initialLastSeen]);

  return { online, lastSeen, typing, setTyping, setOnline, setLastSeen };
}

/** Helper to format last-seen text */
function formatLastSeen(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `Last seen ${d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

// Extend DirectMessage in your API file to include:
// status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export default function ThriveChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as ChatRouteParams;

  const isGroup = params.mode === 'group';
  const directUserId = !isGroup ? params.userId : null;
  const teamId = isGroup ? params.teamId : null;
  const displayName = params.name;

  // presence key – for group we just pass team-based key, but we won't show online/last seen
  const presenceKey = isGroup
    ? `team-${teamId}`
    : `user-${directUserId}`;

  const presence = useThrivePresence(
    presenceKey,
    !isGroup ? (params as DirectChatParams).isOnline : false,
    !isGroup ? (params as DirectChatParams).lastSeen : undefined
  );

  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<DirectMessage>>(null);

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const goBack = () => {
    // @ts-ignore
    navigation.goBack();
  };

  const scrollToBottom = (animated = true) => {
    flatListRef.current?.scrollToEnd({ animated });
  };

  // ---------- Load messages (direct or group based on mode) ----------

  const loadMessages = useCallback(
    async (initial = false) => {
      try {
        if (initial) {
          setLoading(true);
          setError(null);
        }

        let res:
          | {
              items: DirectMessage[];
              nextCursor: string | null;
            }
          | undefined;

        if (isGroup && teamId) {
          // GROUP CHAT
          res = await getTeamChatMessages(teamId, { limit: 50 });
        } else if (!isGroup && directUserId) {
          // DIRECT CHAT
          res = await getDirectMessages(directUserId, { limit: 50 });
        }

        const items =
          res?.items?.map((m) => ({
            ...m,
            status: (m as any).status || 'sent',
          })) ?? [];

        setMessages(items);
        setNextCursor(res?.nextCursor ?? null);

        if (initial && items.length) {
          setTimeout(() => scrollToBottom(false), 0);
        }
      } catch (e) {
        console.log('[Chat] loadMessages error', e);
        setError('Could not load messages.');
      } finally {
        if (initial) setLoading(false);
      }
    },
    [isGroup, directUserId, teamId]
  );

  useEffect(() => {
    loadMessages(true);
  }, [loadMessages]);

  // Keep pinned to latest when messages length changes
  useEffect(() => {
    if (!messages.length) return;
    const t = setTimeout(() => scrollToBottom(true), 50);
    return () => clearTimeout(t);
  }, [messages.length]);

  // Scroll down when keyboard opens
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => scrollToBottom(true), 80);
    });
    return () => sub.remove();
  }, []);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    try {
      setLoadingMore(true);

      let res:
        | {
            items: DirectMessage[];
            nextCursor: string | null;
          }
        | undefined;

      if (isGroup && teamId) {
        res = await getTeamChatMessages(teamId, {
          cursor: nextCursor,
          limit: 50,
        });
      } else if (!isGroup && directUserId) {
        res = await getDirectMessages(directUserId, {
          cursor: nextCursor,
          limit: 50,
        });
      }

      const older =
        res?.items?.map((m) => ({
          ...m,
          status: (m as any).status || 'sent',
        })) ?? [];
      setMessages((prev) => [...older, ...prev]); // prepend older
      setNextCursor(res?.nextCursor ?? null);
    } catch (e) {
      console.log('[Chat] loadMore error', e);
    } finally {
      setLoadingMore(false);
    }
  };

  // ---------- Send message (direct or group) ----------

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');

    const now = new Date().toISOString();

    // optimistic message
    const tempId = `temp-${Date.now()}`;
    const tempMsg: DirectMessage = {
      id: tempId,
      senderId: 'me',
      senderName: 'You',
      body: text,
      createdAt: now,
      isMine: true,
      // @ts-ignore
      status: 'sending',
    };

    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom(true);

    try {
      setSending(true);

      let res:
        | {
            success: boolean;
            message: DirectMessage;
          }
        | undefined;

      if (isGroup && teamId) {
        res = await sendTeamChatMessage(teamId, text);
      } else if (!isGroup && directUserId) {
        res = await sendDirectMessage(directUserId, text);
      }

      const realMsg: DirectMessage = {
        ...(res?.message || {
          ...tempMsg,
          id: `sent-${Date.now()}`,
        }),
        // @ts-ignore
        status: 'sent',
      };

      // replace temp by real
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? realMsg : m))
      );
    } catch (e) {
      console.log('[Chat] handleSend error', e);
      // mark as failed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, status: 'failed' as const } : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    presence.setTyping(true);
    setTimeout(() => presence.setTyping(false), 1200);
  };

  // ---------- Status & message rendering ----------

  const renderStatusIcon = (status?: string) => {
    if (!status || status === 'sent') {
      return <Ionicons name="checkmark" size={12} color="#e5e7eb" />;
    }
    if (status === 'delivered') {
      return (
        <Ionicons name="checkmark-done" size={12} color="#e5e7eb" />
      );
    }
    if (status === 'read') {
      return (
        <Ionicons name="checkmark-done" size={12} color="#22c55e" />
      );
    }
    if (status === 'sending') {
      return (
        <ActivityIndicator size="small" style={{ width: 12 }} />
      );
    }
    if (status === 'failed') {
      return <Ionicons name="warning" size={12} color="#f97316" />;
    }
    return null;
  };

  const renderMessage = ({ item }: { item: DirectMessage }) => {
    const isMine = item.isMine;

    return (
      <View
        style={[
          styles.messageRow,
          isMine ? styles.messageRowMine : styles.messageRowTheirs,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine
              ? styles.messageBubbleMine
              : styles.messageBubbleTheirs,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine && styles.messageTextMine,
            ]}
          >
            {item.body}
          </Text>
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.messageTime,
                isMine && styles.messageTimeMine,
              ]}
            >
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isMine && (
              <View style={styles.statusIcon}>
                {renderStatusIcon((item as any).status)}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const keyExtractor = (item: DirectMessage) => item.id;

  // Header subtitle
  let subtitleText = isGroup ? 'Group chat' : 'Direct messages';
  if (!isGroup) {
    if (presence.typing && presence.online) {
      subtitleText = 'Typing...';
    } else if (presence.online) {
      subtitleText = 'Online';
    } else if (presence.lastSeen) {
      subtitleText = formatLastSeen(presence.lastSeen);
    }
  }

  return (
    <LinearGradient colors={['#ec4899', '#7c3aed']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 110 : 40}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {displayName}
            </Text>
            {!!subtitleText && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {subtitleText}
              </Text>
            )}
          </View>
        </View>

        {/* Curved white panel */}
        <View style={styles.panel}>
          {loading && (
            <View className={styles.centerRow}>
              <ActivityIndicator />
            </View>
          )}

          {!loading && error && (
            <View style={styles.centerRow}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && (
            <>
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={keyExtractor}
                renderItem={renderMessage}
                contentContainerStyle={[
                  styles.messagesContent,
                  { paddingBottom: 12 + insets.bottom },
                ]}
                keyboardShouldPersistTaps="handled"
                onEndReachedThreshold={0.15}
                onEndReached={loadMore}
                ListHeaderComponent={
                  loadingMore ? (
                    <View style={styles.loadingMoreRow}>
                      <ActivityIndicator size="small" />
                    </View>
                  ) : null
                }
                onContentSizeChange={() => {
                  scrollToBottom(false);
                }}
              />

              {/* Input bar */}
              <View
                style={[
                  styles.inputRow,
                  { paddingBottom: 4 + insets.bottom },
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder={
                    isGroup ? 'Message the team…' : 'Type a message…'
                  }
                  placeholderTextColor="#9ca3af"
                  value={input}
                  onChangeText={handleInputChange}
                  multiline
                />
                <Pressable
                  style={[
                    styles.sendBtn,
                    (!input.trim() || sending) &&
                      styles.sendBtnDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={!input.trim() || sending}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={18} color="#fff" />
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
    borderRadius: 999,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fdf2f8',
    marginTop: 2,
  },
  panel: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 8,
  },
  centerRow: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  loadingMoreRow: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageRowTheirs: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  messageBubbleMine: {
    backgroundColor: '#db2777',
    borderBottomRightRadius: 6,
  },
  messageBubbleTheirs: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 14,
    color: '#111827',
  },
  messageTextMine: {
    color: '#f9fafb',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  messageTimeMine: {
    color: '#fecdd3',
  },
  statusIcon: {
    marginLeft: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  input: {
    flex: 1,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  sendBtn: {
    marginLeft: 8,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#db2777',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#f9a8d4',
  },
});
