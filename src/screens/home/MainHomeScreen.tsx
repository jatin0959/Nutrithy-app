// MainHomeScreen.tsx
import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { registerForPushNotificationsAsync } from '../../lib/notifications';


import {
  Calendar,
  ChevronRight,
  Star,
  Bell,
  Flame,
  Moon,
} from 'lucide-react-native';

import {
  connectGoogleFit,
  getLast7DaysSteps,
  getTodaySteps,
  isGoogleFitConnected,
} from '../../lib/googleFit';

// 👇 import challenge APIs + types
import {
  getNotifications,
  getChallenges,
  getChallengeDay,
  type ChallengeDayTask,
} from '../../api/thrive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MainHomeScreenProps {
  logoUri?: string;
}

const services = [
  {
    id: 'consultation',
    title: 'Expert Consultation',
    subtitle: '1-on-1 with nutritionists',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
    gradient: ['#ec4899', '#db2777'],
  },
  {
    id: 'wellness',
    title: 'Corporate Wellness',
    subtitle: 'Team health programs',
    image: 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?w=600',
    gradient: ['#7c3aed', '#a855f7'],
  },
];

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Fallback mock data in case Google Fit is not connected / errors
const MOCK_WEEK_STEPS = [8247, 10532, 9874, 12034, 9345, 7622, 11012];
const WEEK_SLEEP = [7.8, 6.9, 8.2, 7.1, 7.6, 8.0, 6.8];

const DEFAULT_STEP_GOAL = 5000; // ✅ as per requirement
const GOAL_SLEEP = 8;

// rough average: ~0.04 kcal per step (40 kcal / 1000 steps)
const CALORIES_PER_STEP = 0.04;

// --- helpers: extract step goal from challenge tasks ---

function extractStepGoalFromTasks(tasks: ChallengeDayTask[]): number | null {
  for (const t of tasks) {
    const text = `${t.taskName || ''} ${t.taskDesc || ''}`.toLowerCase();
    if (!text.includes('step')) continue;

    // matches e.g. "5000 steps", "10,000 steps", "5k steps", "5 k steps"
    const match = text.match(/(\d[\d,]*)(\s*k)?\s*steps?/i);
    if (match) {
      let numStr = match[1].replace(/,/g, '');
      let value = parseInt(numStr, 10);
      if (Number.isNaN(value)) continue;

      const hasK = !!match[2];
      if (hasK) value = value * 1000;

      return value;
    }
  }
  return null;
}

export function MainHomeScreen({ logoUri }: MainHomeScreenProps) {
  const navigation = useNavigation<any>();

  const [fitConnected, setFitConnected] = useState(false);
  const [fitLoading, setFitLoading] = useState(false);

  const [todaySteps, setTodaySteps] = useState<number | null>(null);
  const [weekSteps, setWeekSteps] = useState<number[] | null>(null);
  const [stepsLoading, setStepsLoading] = useState(false);

  const [displayName, setDisplayName] = useState('Nutrithy member');
  const [refreshing, setRefreshing] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  // challenge / daily-task related state
  const [stepGoal, setStepGoal] = useState<number>(DEFAULT_STEP_GOAL);
  const [dailyTasks, setDailyTasks] = useState<ChallengeDayTask[] | null>(null);
  const [tasksMessage, setTasksMessage] = useState<string | null>(null);

  const lastNightSleep = 7.6;

  // --- navigation helper ---

  function onNavigate(dest: string): void {
    if (!navigation || typeof navigation.navigate !== 'function') {
      console.warn('Navigation not available');
      return;
    }

    try {
      if (dest.startsWith('service-')) {
        const [, id] = dest.split('-');
        navigation.navigate('ServiceDetail' as any, { id });
        return;
      }

      switch (dest) {
        case 'tasks':
          navigation.navigate('Tasks' as any);
          break;
        case 'services':
          navigation.navigate('Services' as any);
          break;
        case 'consultation':
          navigation.navigate('Consultation' as any);
          break;
        case 'CoinsRewards':
          navigation.navigate('CoinsRewards' as any);
          break;
        default:
          navigation.navigate(dest as any);
      }
    } catch (err) {
      console.warn('Navigation failed for', dest, err);
    }
  }

  // --- Google Fit steps ---

  const loadStepsFromFit = async () => {
    try {
      setStepsLoading(true);
      const [today, week] = await Promise.all([
        getTodaySteps(),
        getLast7DaysSteps(),
      ]);

      if (today != null) setTodaySteps(today);
      if (Array.isArray(week) && week.length) setWeekSteps(week);
    } catch (e) {
      console.log('[HOME_LOAD_STEPS_ERROR]', e);
    } finally {
      setStepsLoading(false);
    }
  };

  const handleConnectGoogleFit = async () => {
    try {
      setFitLoading(true);
      const ok = await connectGoogleFit();
      console.log('[HOME] connectGoogleFit ok=', ok);
      setFitConnected(ok);
      if (ok) {
        await loadStepsFromFit();
      }
    } finally {
      setFitLoading(false);
    }
  };

  // --- Challenges / Daily Tasks: load joined challenge + today’s day ---

  const loadChallengeTasksAndGoal = async () => {
    try {
      console.log('[HOME] loading challenges & challengeDay');
      setTasksMessage(null);

      const challengesRes = await getChallenges({ status: 'active', limit: 10 });
      const joined =
        challengesRes.items.find((c) => c.joined) || challengesRes.items[0];

      if (!joined) {
        console.log('[HOME] no active challenges found');
        setDailyTasks([]);
        setStepGoal(DEFAULT_STEP_GOAL);
        setTasksMessage('Join a challenge to start getting daily tasks.');
        return;
      }

      // today as YYYY-MM-DD
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      const dayPayload = await getChallengeDay(joined.id, todayStr);
      console.log('[HOME] challenge day payload:', JSON.stringify(dayPayload));

      const tasks = dayPayload.tasks || [];
      setDailyTasks(tasks);

      if (dayPayload.status === 'pending' || tasks.length === 0) {
        // ✅ requirement: show message when task not assigned / not active
        setTasksMessage(
          "Today's challenge tasks are not active yet. You'll be notified once they go live."
        );
        setStepGoal(DEFAULT_STEP_GOAL);
        return;
      }

      const extractedGoal = extractStepGoalFromTasks(tasks);
      if (extractedGoal) {
        setStepGoal(extractedGoal);
      } else {
        setStepGoal(DEFAULT_STEP_GOAL); // fallback 5k
      }
    } catch (e) {
      console.log('[HOME] loadChallengeTasksAndGoal error', e);
      setTasksMessage("Couldn't load today’s challenge tasks.");
      setStepGoal(DEFAULT_STEP_GOAL);
    }
  };

  // --- Refresh (pull-down + header tap) ---

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const connected = await isGoogleFitConnected();
      setFitConnected(connected);
      if (connected) {
        await loadStepsFromFit();
      }

      await loadChallengeTasksAndGoal();
    } catch (e) {
      console.log('[HOME_REFRESH_ERROR]', e);
    } finally {
      setRefreshing(false);
    }
  };

  // On mount → load user name, Google Fit, challenges & tasks
  useEffect(() => {
    let isMounted = true;

    (async () => {
      // 1) Register device for push notifications (once after login)
      try {
        await registerForPushNotificationsAsync();
      } catch (e) {
        console.log('[PUSH_REGISTER_ERROR]', e);
      }

      // 2) Load stored user display name
      try {
        const storedName = await AsyncStorage.getItem('userName');
        if (storedName && isMounted) {
          setDisplayName(storedName);
        }
      } catch (e) {
        console.warn('[LOAD_USER_NAME_ERROR]', e);
      }

      // 3) Google Fit status + steps
      try {
        const connected = await isGoogleFitConnected();
        if (!isMounted) return;

        setFitConnected(connected);
        if (connected) {
          await loadStepsFromFit();
        }
      } catch (e) {
        console.log('[HOME_LOAD_STEPS_ERROR]', e);
      }

      // 4) Challenge day + tasks + step goal
      try {
        if (!isMounted) return;
        await loadChallengeTasksAndGoal();
      } catch (e) {
        console.log('[HOME_LOAD_CHALLENGE_TASKS_ERROR]', e);
      }

      // 5) Quick unread notifications check (for bell badge)
      try {
        if (!isMounted) return;
        const res = await getNotifications(5); // small batch is enough
        const anyUnread = res.items.some((n) => !n.read);
        setHasUnread(anyUnread);
      } catch (e) {
        console.log('[HOME_CHECK_UNREAD_NOTIFICATIONS_ERROR]', e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);



  // --- derived values ---

  const effectiveTodaySteps = useMemo(
    () =>
      todaySteps != null
        ? todaySteps
        : MOCK_WEEK_STEPS[MOCK_WEEK_STEPS.length - 1],
    [todaySteps]
  );

  const stepsSeries = useMemo(
    () => (weekSteps && weekSteps.length === 7 ? weekSteps : MOCK_WEEK_STEPS),
    [weekSteps]
  );

  const todayGoal = stepGoal;
  const todayProgress = Math.min(effectiveTodaySteps / todayGoal, 1);

  // REAL calorie burn based on real steps (falls back to mock only if steps are mocked)
  const todayCalories = useMemo(
    () => Math.round(effectiveTodaySteps * CALORIES_PER_STEP),
    [effectiveTodaySteps]
  );

  const avgSteps =
    stepsSeries.reduce((a, b) => a + b, 0) / stepsSeries.length;
  const avgSleep =
    WEEK_SLEEP.reduce((a, b) => a + b, 0) / WEEK_SLEEP.length;

  // map ChallengeDayTask -> UI tasks
  const uiTasks = useMemo(() => {
    if (!dailyTasks || dailyTasks.length === 0) return null;

    return dailyTasks.map((t) => {
      const text = `${t.taskName || ''} ${t.taskDesc || ''}`.toLowerCase();
      const isStepTask = text.includes('step');

      let progress = 0;
      let completed = t.status === 'completed';

      if (isStepTask) {
        progress = Math.round(Math.min(effectiveTodaySteps / todayGoal, 1) * 100);
        if (progress >= 100) completed = true;
      } else {
        progress = t.status === 'completed' ? 100 : 0;
      }

      return {
        id: t.taskId,
        label: t.taskName || t.taskDesc || 'Task',
        progress,
        completed,
        coins: t.points ?? 0,
      };
    });
  }, [dailyTasks, effectiveTodaySteps, todayGoal]);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <View style={s.brandRow}>
            <Image
              source={
                logoUri
                  ? { uri: logoUri }
                  : require('../../assets/images/logo.png')
              }
              style={[s.logo, s.logoFallback]}
            />
            <Text style={s.brand}>Nutrithy</Text>
          </View>

          <View style={s.headerActions}>
            {/* Tap bell area to refresh */}
            <Pressable
              style={s.iconBtn}
              onPress={() => navigation.navigate('Notifications')}
              onLongPress={handleRefresh} // optional: keep long-press for refresh
            >
              <Bell size={20} color="#374151" />
              {hasUnread && <View style={s.badge} />}
            </Pressable>

          </View>
        </View>
      </View>

      {/* Content */}
      <View style={s.content}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Greeting & Coins */}
          <View style={[s.block, s.whiteCard]}>
            <View style={s.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={s.subtle}>Good Morning</Text>
                <Text style={s.h2}>{displayName}</Text>
                <Text style={s.subtleSmall}>
                  Let’s close your rings & finish today’s tasks.
                </Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate('CoinsRewards')}
                style={s.coinBtn}
              >
                <Star size={16} color="#fff" fill="#fff" />
                <Text style={s.coinText}>850</Text>
              </Pressable>
            </View>
          </View>

          {/* Google Fit connect CTA */}
          {!fitConnected && (
            <View style={s.block}>
              <View
                style={[
                  s.whiteCard,
                  { flexDirection: 'row', alignItems: 'center' },
                ]}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={s.h3}>Connect Google Fit</Text>
                  <Text style={s.subtleSmall}>
                    Sync your steps and activity automatically to keep your
                    dashboard and challenges up to date.
                  </Text>
                </View>

                <Pressable
                  onPress={handleConnectGoogleFit}
                  disabled={fitLoading}
                  style={[
                    s.coinBtn,
                    { paddingHorizontal: 16 },
                    fitLoading && { opacity: 0.7 },
                  ]}
                >
                  <Text style={s.coinText}>
                    {fitLoading ? 'Connecting…' : 'Connect'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Today – steps snapshot */}
          <View style={s.block}>
            <LinearGradient
              colors={['#ec4899', '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.progressCard}
            >
              <View style={s.rowBetween}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={s.progressLabel}>Today</Text>
                  <Text style={s.progressSteps}>
                    {stepsLoading
                      ? '…'
                      : effectiveTodaySteps.toLocaleString()}{' '}
                    steps
                  </Text>
                  <Text style={s.progressGoal}>
                    Goal: {todayGoal.toLocaleString()} steps
                  </Text>

                  <View style={s.todayRow}>
                    {/* 🔥 Calories burned (real data from current steps) */}
                    <View style={s.todayItem}>
                      <Flame size={18} color="#ffffff" />
                      <View style={s.todayItemTextWrap}>
                        <Text style={s.todayItemLabel}>Calories burned</Text>
                        <Text style={s.todayItemValue}>
                          {stepsLoading
                            ? '…'
                            : `${todayCalories.toLocaleString()} kcal`}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Right: circular progress */}
                <View style={s.progressRingWrap}>
                  <Svg width={92} height={92} style={s.progressSvg}>
                    <Circle
                      cx={46}
                      cy={46}
                      r={38}
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth={8}
                      fill="none"
                    />
                    <Circle
                      cx={46}
                      cy={46}
                      r={38}
                      stroke="#fff"
                      strokeWidth={8}
                      fill="none"
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={
                        2 * Math.PI * 38 * (1 - todayProgress)
                      }
                      strokeLinecap="round"
                    />
                  </Svg>

                  <View style={s.progressInner}>
                    <Text style={s.progressPct}>
                      {Math.round(todayProgress * 100)}%
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Sleep card (still mocked) */}
          <View style={s.block}>
            <View style={[s.whiteCard, s.sleepCard]}>
              <View style={s.sleepHeaderRow}>
                <View style={s.row}>
                  <View style={s.sleepIconWrap}>
                    <Moon size={18} color="#ec4899" />
                  </View>
                  <View>
                    <Text style={s.h3}>Last night</Text>
                    <Text style={s.subtle}>
                      {lastNightSleep.toFixed(1)} hrs · Deep & restful
                    </Text>
                  </View>
                </View>
              </View>

              <View style={s.sleepRow}>
                <View style={s.sleepMetaBlock}>
                  <Text style={s.subtleSmall}>Bedtime</Text>
                  <Text style={s.sleepMetaValue}>11:15 pm</Text>
                </View>
                <View style={s.sleepMetaBlock}>
                  <Text style={s.subtleSmall}>Wake up</Text>
                  <Text style={s.sleepMetaValue}>6:55 am</Text>
                </View>
                <View style={s.sleepMetaBlock}>
                  <Text style={s.subtleSmall}>Consistency</Text>
                  <Text style={s.sleepMetaValue}>4 / 5</Text>
                </View>
              </View>

              <View style={s.sleepSourceRow}>
                <View style={s.sourcePill}>
                  <View style={s.sourceDot} />
                  <Text style={s.sourceText}>
                    Syncing with Google Fit / Apple Health
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Weekly charts – steps & sleep */}
          <View style={s.block}>
            <View style={[s.whiteCard, { paddingVertical: 16 }]}>
              <Text style={[s.h3, { marginBottom: 10 }]}>This week</Text>

              {/* Steps chart */}
              <View style={s.chartSection}>
                <View style={s.rowBetween}>
                  <Text style={s.chartTitle}>Steps</Text>
                  <Text style={s.chartMeta}>
                    Avg {Math.round(avgSteps).toLocaleString()} /day
                  </Text>
                </View>
                <View style={s.chartBarsRow}>
                  {stepsSeries.map((value, idx) => {
                    const ratio = Math.min(value / todayGoal, 1);
                    return (
                      <View key={idx} style={s.chartBarItem}>
                        <View style={s.chartBarTrack}>
                          <View style={s.chartGoalCap} />
                          <View
                            style={[
                              s.chartBarFillSteps,
                              { height: `${Math.max(ratio * 100, 8)}%` },
                            ]}
                          />
                        </View>
                        <Text style={s.chartDayLabel}>{WEEK_DAYS[idx]}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={s.divider} />

              {/* Sleep chart */}
              <View style={s.chartSection}>
                <View style={s.rowBetween}>
                  <Text style={s.chartTitle}>Sleep</Text>
                  <Text style={s.chartMeta}>
                    Avg {avgSleep.toFixed(1)} hrs
                  </Text>
                </View>
                <View style={s.chartBarsRow}>
                  {WEEK_SLEEP.map((value, idx) => {
                    const ratio = Math.min(value / GOAL_SLEEP, 1);
                    return (
                      <View key={idx} style={s.chartBarItem}>
                        <View style={s.chartBarTrack}>
                          <View style={s.chartGoalCap} />
                          <View
                            style={[
                              s.chartBarFillSleep,
                              { height: `${Math.max(ratio * 100, 10)}%` },
                            ]}
                          />
                        </View>
                        <Text style={s.chartDayLabel}>{WEEK_DAYS[idx]}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* Daily Tasks */}
          <View style={s.block}>
            <View style={s.rowBetween}>
              <Text style={s.h3}>Daily tasks</Text>
              <Pressable onPress={() => onNavigate('tasks')}>
                <Text style={s.linkPink}>View all</Text>
              </Pressable>
            </View>

            {/* message when tasks not yet active */}
            {tasksMessage && (
              <Text style={[s.subtleSmall, { marginBottom: 8 }]}>
                {tasksMessage}
              </Text>
            )}

            <View style={{ rowGap: 8 }}>
              {uiTasks && uiTasks.length > 0 ? (
                uiTasks.map((task) => (
                  <View
                    key={task.id}
                    style={[
                      s.taskCard,
                      task.completed ? s.taskCardDone : s.taskCardTodo,
                    ]}
                  >
                    <View style={s.rowBetween}>
                      <View style={s.row}>
                        <View
                          style={[
                            s.chk,
                            task.completed ? s.chkOn : s.chkOff,
                          ]}
                        >
                          {task.completed && (
                            <ChevronRight size={14} color="#fff" />
                          )}
                        </View>
                        <Text
                          style={[
                            s.taskText,
                            task.completed ? s.taskTextDone : undefined,
                          ]}
                          numberOfLines={2}
                        >
                          {task.label}
                        </Text>
                      </View>
                      <View style={s.row}>
                        <Star size={12} color="#fbbf24" fill="#fbbf24" />
                        <Text style={s.coinSmall}>+{task.coins}</Text>
                      </View>
                    </View>

                    {!task.completed && (
                      <View style={{ marginLeft: 28, marginTop: 8 }}>
                        <View style={s.progressBarBg}>
                          <View
                            style={[
                              s.progressBarFill,
                              { width: `${task.progress}%` },
                            ]}
                          />
                        </View>
                        <Text style={s.progressSmall}>
                          {task.progress}% complete
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                // fallback if no tasks loaded AND no message:
                !tasksMessage && (
                  <View
                    style={[
                      s.taskCard,
                      s.taskCardTodo,
                      { borderStyle: 'dashed' },
                    ]}
                  >
                    <Text style={s.subtleSmall}>
                      No tasks for today yet. Check back soon.
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>

          {/* Services */}
          <View style={s.block}>
            <View style={s.rowBetween}>
              <Text style={s.h3}>Services</Text>
              <Pressable onPress={() => onNavigate('services')}>
                <Text style={s.linkPink}>See all</Text>
              </Pressable>
            </View>

            <View style={{ rowGap: 12 }}>
              {services.map((service) => (
                <Pressable
                  key={service.id}
                  onPress={() => onNavigate(`service-${service.id}`)}
                  style={s.serviceCard}
                >
                  <Image
                    source={{ uri: service.image }}
                    style={s.serviceImage}
                  />
                  <LinearGradient
                    colors={service.gradient}
                    style={s.serviceOverlay}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                  <View style={s.serviceContent}>
                    <View>
                      <Text style={s.serviceTitle}>{service.title}</Text>
                      <Text style={s.serviceSubtitle}>
                        {service.subtitle}
                      </Text>
                    </View>
                    <View style={s.serviceBtn}>
                      <Text style={s.serviceBtnText}>Book now</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Quick Access */}
          <View style={[s.block, s.whiteCard, { marginTop: 8 }]}>
            <Text style={s.h3}>Quick access</Text>
            <View style={s.quickAccessRow}>
              <Pressable
                onPress={() => onNavigate('consultation')}
                style={[s.accessCard, { backgroundColor: '#ec4899' }]}
              >
                <Calendar size={24} color="#fff" />
                <Text style={s.accessTitle}>Book consultation</Text>
                <Text style={s.accessSubtitle}>
                  Talk to a Nutrithy expert
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onNavigate('CoinsRewards')}
                style={[s.accessCard, { backgroundColor: '#7c3aed' }]}
              >
                <Star size={24} color="#fff" fill="#fff" />
                <Text style={s.accessTitle}>View rewards</Text>
                <Text style={s.accessSubtitle}>
                  See how to earn more coins
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const CARD_RADIUS = 20;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.select({ ios: 12, android: 12 }),
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 28, height: 28, borderRadius: 6, marginRight: 8 },
  logoFallback: { backgroundColor: '#f3f4f6' },
  brand: { fontWeight: '700', color: '#111827', fontSize: 16 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 6, marginHorizontal: 2, borderRadius: 9999 },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    backgroundColor: '#ec4899',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },

  content: { flex: 1 },
  block: { paddingHorizontal: 16, paddingVertical: 12 },
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: { flexDirection: 'row', alignItems: 'center', columnGap: 8 },
  subtle: { color: '#6b7280', fontSize: 13 },
  subtleSmall: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  h2: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  coinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    backgroundColor: '#db2777',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  coinText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  progressCard: {
    borderRadius: CARD_RADIUS + 6,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
    marginBottom: 4,
  },
  progressSteps: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
  progressGoal: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 4,
  },

  progressRingWrap: { width: 92, height: 92, position: 'relative' },
  progressSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [{ rotate: '-90deg' }],
  },
  progressInner: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  progressPct: { color: '#fff', fontSize: 18, fontWeight: '800' },

  todayRow: {
    flexDirection: 'row',
    marginTop: 12,
    columnGap: 10,
  },
  todayItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayItemTextWrap: { marginLeft: 6 },
  todayItemLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
  },
  todayItemValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  sleepCard: { paddingVertical: 16 },
  sleepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  h3: {
    fontWeight: '700',
    color: '#111827',
    fontSize: 16,
    marginBottom: 4,
  },
  sleepRow: {
    flexDirection: 'row',
    marginTop: 12,
    columnGap: 16,
  },
  sleepMetaBlock: { flex: 1 },
  sleepMetaValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  sleepIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sleepSourceRow: {
    marginTop: 12,
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236,72,153,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ec4899',
    marginRight: 6,
  },
  sourceText: {
    fontSize: 11,
    color: '#ec4899',
  },

  linkPink: { color: '#db2777', fontWeight: '600', fontSize: 13 },

  chartSection: {
    marginTop: 6,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  chartMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  chartBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    columnGap: 10,
    marginTop: 10,
  },
  chartBarItem: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarTrack: {
    width: 10,
    height: 80,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartGoalCap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#e5e7eb',
  },
  chartBarFillSteps: {
    width: '100%',
    backgroundColor: '#ec4899',
    borderRadius: 999,
  },
  chartBarFillSleep: {
    width: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 999,
  },
  chartDayLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },

  taskCard: { borderRadius: 16, padding: 12, borderWidth: 2 },
  taskCardDone: {
    backgroundColor: 'rgba(236,72,153,0.05)',
    borderColor: 'rgba(236,72,153,0.3)',
  },
  taskCardTodo: { backgroundColor: '#fff', borderColor: '#f3f4f6' },
  chk: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chkOn: { backgroundColor: '#ec4899' },
  chkOff: { backgroundColor: '#e5e7eb' },
  taskText: { fontSize: 14, color: '#111827' },
  taskTextDone: {
    color: '#ec4899',
    textDecorationLine: 'line-through',
  },
  coinSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
    marginLeft: 4,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ec4899',
    borderRadius: 9999,
  },
  progressSmall: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  serviceCard: { height: 128, borderRadius: 16, overflow: 'hidden' },
  serviceImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  serviceOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.9,
    borderRadius: 16,
  },
  serviceContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  serviceTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 4,
  },
  serviceSubtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
  },
  serviceBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
  },
  serviceBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },

  quickAccessRow: { flexDirection: 'row', columnGap: 12, marginTop: 8 },
  accessCard: { flex: 1, borderRadius: 16, padding: 16 },
  accessTitle: { color: '#fff', fontWeight: '800', marginTop: 8 },
  accessSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2,
  },
});

export default memo(MainHomeScreen);
