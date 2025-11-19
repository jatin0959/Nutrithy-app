// src/screens/thrive/NotificationsScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell } from 'lucide-react-native';

import {
  getNotifications,
  markNotificationRead,
  ThriveNotification,
} from '../../api/thrive';

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();

  const [items, setItems] = useState<ThriveNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const loadNotifications = useCallback(
    async (opts?: { loadMore?: boolean }) => {
      if (loading) return;

      try {
        setLoading(true);

        const res = await getNotifications(
          30,
          opts?.loadMore ? nextCursor || undefined : undefined
        );

        if (opts?.loadMore) {
          setItems((prev) => [...prev, ...res.items]);
        } else {
          setItems(res.items);
        }

        setNextCursor(res.nextCursor);
      } catch (err) {
        console.log('[Notifications] load error', err);
      } finally {
        setLoading(false);
      }
    },
    [loading, nextCursor]
  );

  // initial load (only once)
  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadNotifications();
    } finally {
      setRefreshing(false);
    }
  };

  const onPressNotification = async (n: ThriveNotification) => {
    // mark as read locally
    setItems((prev) =>
      prev.map((item) =>
        item.id === n.id ? { ...item, read: true } : item
      )
    );

    try {
      await markNotificationRead(n.id);
    } catch (err) {
      console.log('[Notifications] mark read error', err);
    }

    // Optional route based on type
    if (n.type === 'direct_message' && n.data?.fromUserId) {
      navigation.navigate('ThriveChat', {
        userId: n.data.fromUserId,
        name: n.data.senderName || 'Chat',
      });
    }
  };

  const renderItem = ({ item }: { item: ThriveNotification }) => {
    const created = new Date(item.createdAt);
    const timeLabel = created.toLocaleString();

    return (
      <Pressable
        onPress={() => onPressNotification(item)}
        style={[
          styles.card,
          !item.read && styles.cardUnread,
        ]}
      >
        <View style={styles.iconWrap}>
          <Bell size={18} color="#ec4899" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.time}>{timeLabel}</Text>
        </View>
        {!item.read && <View style={styles.dot} />}
      </Pressable>
    );
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      {/* In-screen header just under nav bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {items.length > 0 && (
          <Text style={styles.headerMeta}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </Text>
        )}
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            items.length === 0 ? styles.emptyContainer : styles.listContainer
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.emptyText}>
                No notifications yet. You’re all caught up 🎉
              </Text>
            ) : null
          }
          onEndReached={() => {
            if (nextCursor && !loading) {
              loadNotifications({ loadMore: true });
            }
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loading && items.length > 0 ? (
              <ActivityIndicator style={{ marginVertical: 12 }} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerMeta: {
    fontSize: 12,
    color: '#6b7280',
  },

  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#fff',
    marginBottom: 8,
    alignItems: 'center',
  },
  cardUnread: {
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.4)',
    backgroundColor: 'rgba(236,72,153,0.03)',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(236,72,153,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  body: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ec4899',
    marginLeft: 8,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
