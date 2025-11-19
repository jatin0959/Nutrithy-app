// src/screens/thrive/ChallengeJoinedScreen.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import {
  ArrowLeft,
  Share2,
  Zap,
  Trophy,
  Users,
  Calendar as CalendarIcon,
  Camera,
  ChevronRight,
  AlertCircle,
  BookOpen,
} from 'lucide-react-native';

import {
  ChallengeDetail,
  ChallengeDayPayload,
  ChallengeDayTask,
  getChallengeDetail,
  getChallengeDay,
  submitChallengeTaskProof,
} from '../../api/thrive';
import { RootMainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<
  RootMainStackParamList,
  'ThriveChallengeJoined'
>;

const HEADER_GRADIENT = ['#ec4899', '#7c3aed'];

export default function ChallengeJoinedScreen({ route, navigation }: Props) {
  const { challengeId } = route.params;

  const [detail, setDetail] = useState<ChallengeDetail | null>(null);
  const [day, setDay] = useState<ChallengeDayPayload | null>(null);

  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadingDay, setLoadingDay] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Task modal state
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ChallengeDayTask | null>(
    null
  );
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // NEW: trivia + module modals
  const [triviaModalVisible, setTriviaModalVisible] = useState(false);
  const [moduleModalVisible, setModuleModalVisible] = useState(false);

  /* ----------------- Loaders ------------------ */

  const loadDetail = useCallback(async () => {
    try {
      setLoadingDetail(true);
      setError(null);
      console.log(
        '[JOINED] calling getChallengeDetail with',
        challengeId
      );
      const res = await getChallengeDetail(challengeId);
      console.log('[JOINED] getChallengeDetail response:', res);
      setDetail(res.data);
    } catch (e: any) {
      console.log('getChallengeDetail error', e);
      setError('Could not load challenge details.');
    } finally {
      setLoadingDetail(false);
    }
  }, [challengeId]);

  const loadDay = useCallback(async () => {
    try {
      setLoadingDay(true);
      setError(null);
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      console.log('[JOINED] calling getChallengeDay with', {
        challengeId,
        date: today,
      });
      const res = await getChallengeDay(challengeId, today);
      console.log('[JOINED] getChallengeDay response:', res);
      setDay(res);
    } catch (e: any) {
      console.log('getChallengeDay error', e);
      setError('Could not load today’s challenge.');
    } finally {
      setLoadingDay(false);
    }
  }, [challengeId]);

  useEffect(() => {
    loadDetail();
    loadDay();
  }, [loadDetail, loadDay]);

  const primaryTask: ChallengeDayTask | null = useMemo(() => {
    if (!day || !day.tasks || day.tasks.length === 0) return null;
    return day.tasks[0];
  }, [day]);

  const triviaItem = useMemo(
    () => (day && day.trivia && day.trivia.length ? day.trivia[0] : null),
    [day]
  );

  const learningModule = useMemo(
    () =>
      day && day.learningModules && day.learningModules.length
        ? day.learningModules[0]
        : null,
    [day]
  );

  const workshop = useMemo(
    () =>
      day &&
        Array.isArray(day.workshops) &&
        day.workshops.length > 0
        ? day.workshops[0]
        : null,
    [day]
  );

  /* ----------------- Task modal helpers ------------------ */

  const openTaskModal = (task: ChallengeDayTask) => {
    setSelectedTask(task);
    setCapturedImageUri(null);
    setTaskModalVisible(true);
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeTaskModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setTaskModalVisible(false);
      setSelectedTask(null);
      setCapturedImageUri(null);
    });
  };

  const handleOpenCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert(
          'Camera permission needed',
          'Please allow camera access to capture your progress photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        console.log('[JOINED] captured image uri:', uri);
        setCapturedImageUri(uri);
      }
    } catch (e) {
      console.log('handleOpenCamera error', e);
      Alert.alert('Error', 'Unable to open camera.');
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedTask || !day) return;
    if (!capturedImageUri) {
      Alert.alert('Photo required', 'Please capture a photo to continue.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        challengeId,
        taskId: selectedTask.taskId,
        date: day.date,
        proof: {
          type: 'photo' as const,
          url: capturedImageUri,
        },
      };
      console.log('[JOINED] submitChallengeTaskProof payload:', payload);
      const res = await submitChallengeTaskProof(payload);
      console.log('[JOINED] submitChallengeTaskProof response:', res);

      await loadDay();
      closeTaskModal();
      Alert.alert('Submitted', 'Your progress has been submitted.');
    } catch (e) {
      console.log('submitChallengeTaskProof error', e);
      Alert.alert('Error', 'Could not submit task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------- Derived UI values ------------------ */

  const completedDays = detail?.yourProgress.completedDays ?? 0;
  const totalDays =
    detail?.yourProgress.totalDays ?? detail?.totalDays ?? day?.tasks.length ?? 0;
  const progressPct = detail?.yourProgress.progressPct ?? 0;
  const daysLeft = detail?.daysLeft ?? 0;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const isLoading = loadingDetail || loadingDay;

  /* ----------------- Render ------------------ */

  if (isLoading && !detail && !day) {
    return (
      <View style={styles.fullCenter}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!detail || !day) {
    return (
      <View style={styles.fullCenter}>
        <Text style={{ color: '#111827', fontWeight: '600', marginBottom: 8 }}>
          Something went wrong
        </Text>
        {!!error && (
          <Text style={{ color: '#6b7280', textAlign: 'center' }}>{error}</Text>
        )}
        <Pressable
          style={styles.retryBtn}
          onPress={() => {
            loadDetail();
            loadDay();
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* HEADER */}
      <LinearGradient
        colors={HEADER_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <Pressable
            style={styles.headerIconBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={20} color="#fff" />
          </Pressable>
          <Pressable style={styles.headerIconBtn}>
            <Share2 size={20} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.headerTitle}>{detail.title}</Text>

        <Text style={styles.headerSub}>
          Day {detail.currentDay} of {detail.totalDays}
        </Text>

        {/* Progress bar + days left */}
        <View style={{ marginTop: 8 }}>
          <View style={styles.progressOuter}>
            <View style={[styles.progressInner, { width: `${progressPct}%` }]} />
          </View>
          <View style={styles.progressMetaRow}>
            <Text style={styles.progressMetaLabel}>
              {completedDays}/{totalDays} days completed
            </Text>
            <Text style={styles.progressMetaLabel}>{daysLeft} days left</Text>
          </View>
        </View>

        {/* Stats cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Zap size={18} color="#fde68a" />
            <Text style={styles.statLabel}>Points</Text>
            <Text style={styles.statValue}>
              {detail.yourProgress.points ?? 0}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={18} color="#fef3c7" />
            <Text style={styles.statLabel}>Rank</Text>
            <Text style={styles.statValue}>
              {detail.yourProgress.rank != null
                ? `#${detail.yourProgress.rank}`
                : '--'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Users size={18} color="#e0f2fe" />
            <Text style={styles.statLabel}>Active</Text>
            <Text style={styles.statValue}>
              {detail.yourProgress.activeFriendsCount ?? 0}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* MAIN CONTENT */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Friend nudge banner */}
        <View style={styles.nudgeWrap}>
          <View style={styles.nudgeCard}>
            <View style={styles.nudgeAccent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.nudgeTitle}>
                🔥 Your friends are crushing it!
              </Text>
              <Text style={styles.nudgeBody}>
                {detail.yourProgress.activeFriendsCount > 0
                  ? `${detail.yourProgress.activeFriendsCount} friends completed today's task. Don't get left behind!`
                  : "Stay on track and complete today's task to keep your streak alive."}
              </Text>


            </View>
          </View>
        </View>

        {/* Today's Challenge */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Challenge</Text>
          <View style={styles.dayPill}>
            <Text style={styles.dayPillText}>Day {detail.currentDay}</Text>
          </View>
        </View>

        {primaryTask && (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <LinearGradient
              colors={['#ec4899', '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.todayCard}
            >
              <View style={styles.todayTopRow}>
                <View style={styles.cameraCircle}>
                  <Camera size={22} color="#fff" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.todayTitle}>{primaryTask.taskName}</Text>
                  <Text style={styles.todayBody}>
                    {primaryTask.taskDesc
                      ? primaryTask.taskDesc
                      : 'Complete your daily step goal and share a progress photo to finish today’s task.'}
                  </Text>
                </View>
              </View>

              {/* Task image from API */}
              {primaryTask.taskimg ? (
                <Image
                  source={{ uri: primaryTask.taskimg }}
                  style={styles.taskImage}
                  resizeMode="cover"
                />
              ) : null}

              {/* Chips */}
              <View style={styles.todayChipsRow}>
                <View style={styles.chipOutline}>
                  <Text style={styles.chipOutlineText}>
                    {primaryTask.videoRequired === 'photo'
                      ? 'Photo Required'
                      : 'Proof Required'}
                  </Text>
                </View>
                <View style={styles.chipSolid}>
                  <Text style={styles.chipSolidText}>
                    +{primaryTask.points} points
                  </Text>
                </View>
              </View>

              {/* CTA */}
              <Pressable
                style={styles.todayCta}
                onPress={() => openTaskModal(primaryTask)}
              >
                <Text style={styles.todayCtaText}>
                  Post photo to Thrive to complete
                </Text>
                <ChevronRight size={18} color="#fff" />
              </Pressable>
            </LinearGradient>
          </View>
        )}

        {/* More Activities */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={styles.sectionTitle}>More Activities</Text>
        </View>

        <View style={styles.moreGrid}>
          {triviaItem && (
            <Pressable
              style={styles.activityCard}
              onPress={() => setTriviaModalVisible(true)}
            >
              <View style={styles.activityIconCircle}>
                <AlertCircle size={18} color="#2563eb" />
              </View>
              <Text style={styles.activityTitle}>Daily Trivia</Text>
              <Text style={styles.activitySub}>
                Test your knowledge and earn extra points.
              </Text>
              <View style={styles.activityFooterRow}>
                <Text style={styles.activityPoints}>+10 pts</Text>
                <ChevronRight size={16} color="#9ca3af" />
              </View>
            </Pressable>
          )}

          {learningModule && (
            <Pressable
              style={styles.activityCard}
              onPress={() => setModuleModalVisible(true)}
            >
              <View style={styles.activityIconCircle}>
                <BookOpen size={18} color="#7c3aed" />
              </View>
              <Text style={styles.activityTitle}>{learningModule.title}</Text>
              <Text style={styles.activitySub}>
                {learningModule.durationMins} min read • Learn & grow
              </Text>
              <View style={styles.activityFooterRow}>
                <Text style={styles.activityPoints}>+15 pts</Text>
                <ChevronRight size={16} color="#9ca3af" />
              </View>
            </Pressable>
          )}
        </View>

        {/* Workshop block – only if backend sent one */}
        {workshop && (
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            <LinearGradient
              colors={['#f97316', '#ef4444']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.workshopCard}
            >
              <View style={styles.workshopTagRow}>
                <View style={styles.workshopTag}>
                  <Text style={styles.workshopTagText}>LIVE WORKSHOP</Text>
                </View>
                <View style={styles.workshopTag}>
                  <Text style={styles.workshopTagText}>
                    {workshop.startAt
                      ? `Today at ${new Date(
                        workshop.startAt
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                      : 'Upcoming'}
                  </Text>
                </View>
              </View>

              <Text style={styles.workshopTitle}>{workshop.title}</Text>
              {!!workshop.LWSDesc && (
                <Text style={styles.workshopDesc} numberOfLines={2}>
                  {workshop.LWSDesc}
                </Text>
              )}

              <View style={styles.workshopHostRow}>
                <View style={styles.workshopAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.workshopHostName}>
                    {workshop.platform || 'Online session'}
                  </Text>
                  <Text style={styles.workshopHostMeta}>
                    {workshop.LWSDate
                      ? new Date(workshop.LWSDate).toDateString()
                      : ''}
                  </Text>
                </View>
                <Text style={styles.workshopRegistered}>
                  {workshop.joined ? 'You’re registered' : ''}
                </Text>
              </View>

              <Pressable style={styles.workshopCta}>
                <Text style={styles.workshopCtaText}>
                  {workshop.joined ? 'View Details' : 'Reserve Your Spot'}
                </Text>
              </Pressable>
            </LinearGradient>
          </View>
        )}
      </ScrollView>

      {/* TASK MODAL (Blinkit-style bottom sheet) */}
      <Modal
        transparent
        visible={taskModalVisible}
        animationType="none"
        onRequestClose={closeTaskModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeTaskModal} />
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY }],
              },
            ]}
          >
            {selectedTask && (
              <>
                <View style={styles.sheetHeaderRow}>
                  <Text style={styles.sheetTitle}>Complete Today’s Task</Text>
                  <Pressable onPress={closeTaskModal}>
                    <Text style={styles.sheetClose}>✕</Text>
                  </Pressable>
                </View>

                {/* Task summary card */}
                <View style={styles.sheetCard}>
                  <View style={styles.sheetTaskRow}>
                    <View style={styles.cameraCircleSmall}>
                      <Camera size={18} color="#fff" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.sheetTaskTitle}>
                        {selectedTask.taskName}
                      </Text>
                      <Text style={styles.sheetTaskBody}>
                        {selectedTask.taskDesc ||
                          'Complete your daily step goal and share a clear photo of your progress.'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.todayChipsRow}>
                    <View style={styles.chipOutline}>
                      <Text style={styles.chipOutlineText}>Photo Required</Text>
                    </View>
                    <View style={styles.chipSolid}>
                      <Text style={styles.chipSolidText}>
                        +{selectedTask.points} points
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Photo guidelines */}
                <View style={styles.sheetCard}>
                  <View style={styles.sheetRow}>
                    <AlertCircle size={18} color="#2563eb" />
                    <Text style={[styles.sheetTaskTitle, { marginLeft: 8 }]}>
                      Photo Guidelines
                    </Text>
                  </View>
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.sheetBullet}>
                      • Take photo in good lighting
                    </Text>
                    <Text style={styles.sheetBullet}>
                      • Show yourself doing the activity
                    </Text>
                    <Text style={styles.sheetBullet}>
                      • Make sure photo is clear and focused
                    </Text>
                  </View>
                </View>

                {/* Example photo from API (no black box) */}
                {selectedTask.taskimg && (
                  <View style={styles.examplePhotoWrap}>
                    <Image
                      source={{ uri: selectedTask.taskimg }}
                      style={styles.examplePhoto}
                      resizeMode="cover"
                    />
                    <Text style={styles.exampleCaption}>
                      Credit: Clean view of exercise
                    </Text>
                  </View>
                )}

                {/* Capture photo box */}
                <Pressable
                  style={[
                    styles.captureBox,
                    capturedImageUri ? styles.captureBoxFilled : null,
                  ]}
                  onPress={handleOpenCamera}
                >
                  {!capturedImageUri ? (
                    <>
                      <Camera size={28} color="#db2777" />
                      <Text style={styles.captureTitle}>
                        Take a progress photo
                      </Text>
                      <Text style={styles.captureSub}>
                        Capture from your camera to share your progress
                      </Text>
                    </>
                  ) : (
                    <>
                      <Image
                        source={{ uri: capturedImageUri }}
                        style={styles.capturePreview}
                        resizeMode="cover"
                      />
                      <Text style={styles.captureTitle}>
                        Photo ready to submit
                      </Text>
                      <Text style={styles.captureSub}>
                        Tap again to retake if needed
                      </Text>
                    </>
                  )}
                </Pressable>

                {/* Submit button */}
                <Pressable
                  style={[
                    styles.sheetPrimaryBtn,
                    !capturedImageUri || submitting
                      ? { opacity: 0.6 }
                      : null,
                  ]}
                  disabled={!capturedImageUri || submitting}
                  onPress={handleSubmitTask}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.sheetPrimaryText}>
                      Post to Thrive & Complete Task
                    </Text>
                  )}
                </Pressable>

                <Text style={styles.sheetHint}>
                  Upload a photo to continue
                </Text>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* TRIVIA MODAL */}
      {triviaItem && (
        <Modal
          transparent
          visible={triviaModalVisible}
          animationType="slide"
          onRequestClose={() => setTriviaModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.triviaSheet}>
              <View style={styles.sheetHeaderRow}>
                <Text style={styles.sheetTitle}>Daily Trivia</Text>
                <Pressable onPress={() => setTriviaModalVisible(false)}>
                  <Text style={styles.sheetClose}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.triviaBanner}>
                <Text style={styles.triviaBannerText}>
                  🔔{' '}
                  <Text style={{ fontWeight: '700' }}>Friends are answering.</Text>{' '}
                  Complete yours now!
                </Text>
              </View>

              <View style={styles.triviaQuestionCard}>
                <View style={styles.sheetRow}>
                  <AlertCircle size={18} color="#2563eb" />
                  <Text style={[styles.sheetTaskTitle, { marginLeft: 8 }]}>
                    {triviaItem.title || 'Today’s trivia question'}
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View style={styles.triviaPointsTag}>
                    <Text style={styles.triviaPointsTagText}>+10 points</Text>
                  </View>
                </View>
              </View>

              {/* Static options for now (no quiz API yet) */}
              {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map(
                (o, idx) => (
                  <Pressable key={idx} style={styles.triviaOption}>
                    <Text style={styles.triviaOptionText}>{o}</Text>
                  </Pressable>
                )
              )}

              <Pressable style={styles.triviaSubmitBtn}>
                <LinearGradient
                  colors={['#4f46e5', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.triviaSubmitInner}
                >
                  <Text style={styles.triviaSubmitText}>Submit Answer</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* LEARNING MODULE MODAL */}
      {learningModule && (
        <Modal
          transparent
          visible={moduleModalVisible}
          animationType="slide"
          onRequestClose={() => setModuleModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.triviaSheet}>
              <View style={styles.sheetHeaderRow}>
                <Text style={styles.sheetTitle}>{learningModule.title}</Text>
                <Pressable onPress={() => setModuleModalVisible(false)}>
                  <Text style={styles.sheetClose}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.moduleMeta}>
                {learningModule.durationMins} min read
              </Text>

              <View style={styles.learningHeaderCard}>
                <View style={styles.sheetRow}>
                  <BookOpen size={18} color="#7c3aed" />
                  <Text style={[styles.sheetTaskTitle, { marginLeft: 8 }]}>
                    Learning Module
                  </Text>
                </View>
                <View style={{ marginTop: 4 }}>
                  <Text style={styles.moduleEarnText}>Earn +15 points</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.moduleBodyTitle}>Understanding the Topic</Text>
              <Text style={styles.moduleBody}>
                {learningModule.description && learningModule.description.trim()
                  ? learningModule.description
                  : 'This module helps you build better habits for long-term health and wellbeing. Read through the content and apply the tips in your daily routine.'}
              </Text>

              {/* Image from API */}
              {learningModule.TrnCoverImgFile && (
                <Image
                  source={{ uri: learningModule.TrnCoverImgFile }}
                  style={styles.moduleImage}
                  resizeMode="cover"
                />
              )}

              <Pressable style={styles.triviaSubmitBtn}>
                <LinearGradient
                  colors={['#4f46e5', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.triviaSubmitInner}
                >
                  <Text style={styles.triviaSubmitText}>
                    Complete Now (+15 points)
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

/* ----------------- Styles ------------------ */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },

  fullCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f9fafb',
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#db2777',
  },
  retryText: { color: '#fff', fontWeight: '700' },

  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontSize: 13,
  },

  progressOuter: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressInner: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  progressMetaRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressMetaLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
  },

  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    columnGap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginTop: 6,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },

  nudgeWrap: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  nudgeCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    position: 'relative',
  },
  nudgeAccent: {
    width: 4,
    borderRadius: 999,
    backgroundColor: '#fb923c',
    marginRight: 10,
  },
  nudgeTitle: {
    color: '#b45309',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 4,
  },
  nudgeBody: {
    color: '#92400e',
    fontSize: 12,
  },

  sectionHeaderRow: {
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  dayPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#fee2e2',
  },
  dayPillText: {
    color: '#b91c1c',
    fontSize: 11,
    fontWeight: '700',
  },

  todayCard: {
    borderRadius: 20,
    padding: 14,
  },
  todayTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  todayBody: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  taskImage: {
    marginTop: 10,
    borderRadius: 16,
    height: 120,
    width: '100%',
  },
  todayChipsRow: {
    flexDirection: 'row',
    marginTop: 10,
    columnGap: 8,
    alignItems: 'center',
  },
  chipOutline: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'transparent',
  },
  chipOutlineText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  chipSolid: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f97316',
  },
  chipSolidText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  todayCta: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayCtaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  moreGrid: {
    paddingHorizontal: 16,
    marginTop: 10,
    flexDirection: 'row',
    columnGap: 10,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 13,
  },
  activitySub: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 4,
  },
  activityFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  activityPoints: {
    color: '#16a34a',
    fontWeight: '700',
    fontSize: 11,
  },

  workshopCard: {
    borderRadius: 20,
    padding: 14,
    marginTop: 18,
  },
  workshopTagRow: {
    flexDirection: 'row',
    columnGap: 8,
  },
  workshopTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  workshopTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  workshopTitle: {
    marginTop: 10,
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  workshopDesc: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  workshopHostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  workshopAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: 8,
  },
  workshopHostName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  workshopHostMeta: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
  },
  workshopRegistered: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 'auto',
  },
  workshopCta: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: '#fff',
    paddingVertical: 10,
    alignItems: 'center',
  },
  workshopCtaText: {
    color: '#f97316',
    fontWeight: '800',
    fontSize: 13,
  },

  // Modal / bottom sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 15,
  },
  sheetClose: {
    color: '#6b7280',
    fontSize: 18,
  },
  sheetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  sheetTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraCircleSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#db2777',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTaskTitle: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 13,
  },
  sheetTaskBody: {
    color: '#4b5563',
    fontSize: 12,
    marginTop: 2,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetBullet: {
    color: '#4b5563',
    fontSize: 12,
    marginTop: 2,
  },
  examplePhotoWrap: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  examplePhoto: {
    width: '100%',
    height: 160,
  },
  exampleCaption: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 4,
  },
  captureBox: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fbb6ce',
    backgroundColor: '#fff0f6',
    padding: 16,
    alignItems: 'center',
  },
  captureBoxFilled: {
    borderColor: '#22c55e',
    backgroundColor: '#ecfdf5',
  },
  captureTitle: {
    marginTop: 8,
    color: '#111827',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  captureSub: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 11,
    textAlign: 'center',
  },
  capturePreview: {
    width: 140,
    height: 90,
    borderRadius: 10,
  },
  sheetPrimaryBtn: {
    marginTop: 14,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ec4899',
  },
  sheetPrimaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  sheetHint: {
    marginTop: 6,
    color: '#9ca3af',
    fontSize: 11,
    textAlign: 'center',
  },

  // Trivia + module modals
  triviaSheet: {
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  triviaBanner: {
    marginTop: 6,
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#fff7ed',
  },
  triviaBannerText: {
    fontSize: 12,
    color: '#b45309',
  },
  triviaQuestionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    marginTop: 4,
  },
  triviaPointsTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#e0f2fe',
    alignSelf: 'flex-start',
  },
  triviaPointsTagText: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '700',
  },
  triviaOption: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  triviaOptionText: {
    color: '#111827',
    fontSize: 13,
  },
  triviaSubmitBtn: {
    marginTop: 14,
  },
  triviaSubmitInner: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triviaSubmitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },

  moduleMeta: {
    color: '#6b7280',
    fontSize: 11,
    marginBottom: 4,
  },
  learningHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  moduleEarnText: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: '700',
  },
  moduleBodyTitle: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 4,
  },
  moduleBody: {
    color: '#4b5563',
    fontSize: 12,
    marginBottom: 10,
  },
  moduleImage: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginBottom: 14,
  },
});
