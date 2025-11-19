import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import {
  ChevronLeft,
  ChevronRight,
  User2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Bell,
  Star,
  Globe2,
  Eye,
  BarChart3,
  MessageCircle,
  Lock,
  HelpCircle,
  MessageSquare,
  Info,
  Trash2,
  LogOut,
  Check,
} from 'lucide-react-native';

import {
  getProfile,
  updateProfile,
  type EmployeeProfile,
} from '../../api/profile'; // ⬅️ adjust path if needed

const BRAND_PINK = '#ec4899';
const BRAND_PINK_DARK = '#db2777';
const BRAND_PURPLE = '#a855f7';
const BG_SOFT = '#f9fafb';

type ToggleKey =
  | 'push'
  | 'email'
  | 'sms'
  | 'challenge'
  | 'order'
  | 'marketing'
  | 'publicProfile'
  | 'showActivity'
  | 'showStats'
  | 'allowMessages';

const initialToggles: Record<ToggleKey, boolean> = {
  push: true,
  email: true,
  sms: false,
  challenge: true,
  order: true,
  marketing: false,
  publicProfile: true,
  showActivity: true,
  showStats: true,
  allowMessages: true,
};

const CARD_RADIUS = 18;

type ProfileFieldKey =
  | 'photo'
  | 'name'
  | 'email'
  | 'phone'
  | 'dob'
  | 'gender'
  | 'location'
  | 'bio'
  | 'goals'
  | 'diet';

type ProfileField = { key: ProfileFieldKey; label: string; done: boolean };

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [toggles, setToggles] = useState(initialToggles);

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<ProfileField | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingField, setSavingField] = useState(false);

  // ---- Fetch profile on mount ----
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getProfile();
        if (mounted) setProfile(data);
      } catch (err) {
        console.log('[SETTINGS] getProfile error', err);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ---- Derive profile fields / completion from API data ----
  const profileFields: ProfileField[] = useMemo(() => {
    const hasPhoto = !!(profile?.profilePhoto || profile?.avatar);
    const hasName =
      !!profile?.fullName ||
      !!(profile?.firstName && profile?.lastName);
    const hasEmail = !!profile?.email;
    const hasPhone = !!(profile?.profile?.phone || profile?.phone);
    const hasGender = !!profile?.profile?.gender;
    const hasGoals = !!(profile?.goals && profile.goals.length > 0);
    const hasDiet = !!profile?.dietPreference;

    return [
      { key: 'photo', label: 'Profile Photo', done: hasPhoto },
      { key: 'name', label: 'Full Name', done: hasName },
      { key: 'email', label: 'Email Address', done: hasEmail },
      { key: 'phone', label: 'Phone Number', done: hasPhone },
      { key: 'dob', label: 'Date of Birth', done: false }, // no DOB in API yet
      { key: 'gender', label: 'Gender', done: hasGender },
      { key: 'location', label: 'Location', done: false },
      { key: 'bio', label: 'Bio', done: false },
      { key: 'goals', label: 'Health Goals', done: hasGoals },
      { key: 'diet', label: 'Dietary Preferences', done: hasDiet },
    ];
  }, [profile]);

  const totalFields = profileFields.length;
  const doneCount = profileFields.filter((f) => f.done).length;
  const completionPercent = totalFields
    ? Math.round((doneCount / totalFields) * 100)
    : 0;
  const remainingFields = totalFields - doneCount;

  const onToggle = (key: ToggleKey) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ---- Logout handler ----
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        // add more keys if you use them
      ]);
    } catch (err) {
      console.log('[LOGOUT] failed to clear tokens', err);
    } finally {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }], // ⬅️ change 'Auth' to your auth stack name
      });
    }
  };

  // ---- Helpers for modal editing ----
  const getCurrentValueForField = (key: ProfileFieldKey): string => {
    if (!profile) return '';

    switch (key) {
      case 'name':
        return (
          profile.fullName ||
          `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
        );
      case 'email':
        return profile.email || '';
      case 'phone':
        return profile.profile?.phone || profile.phone || '';
      case 'gender':
        return profile.profile?.gender || '';
      case 'goals':
        return (profile.goals || []).join(', ');
      case 'diet':
        return profile.dietPreference || '';
      case 'location':
        return ''; // not provided by API
      case 'bio':
        return ''; // not provided by API
      case 'dob':
        return ''; // not provided by API
      case 'photo':
        return profile.profilePhoto || profile.avatar || '';
      default:
        return '';
    }
  };

  const openEditField = (field: ProfileField) => {
    setEditingField(field);
    setEditValue(getCurrentValueForField(field.key));
    setEditModalVisible(true);
  };

  const buildUpdatePayloadForField = (
    fieldKey: ProfileFieldKey,
    value: string
  ): any => {
    // base from existing profile (so we don't overwrite)
    const baseName =
      profile?.fullName ||
      `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();

    const payload: any = {
      name: baseName || value || '', // API expects name
      age: profile?.profile?.ageYears,
      gender: profile?.profile?.gender,
      weight: profile?.profile?.weightKg,
      height: profile?.profile?.heightCm,
      goals: profile?.goals ?? [],
      interests: profile?.interests ?? [],
      dietPreference: profile?.dietPreference,
      activityLevel: profile?.activityLevel,
      sleepHours: profile?.sleepHours,
      wizardCompleted: !!profile?.wizardCompleted,
    };

    switch (fieldKey) {
      case 'name':
        payload.name = value;
        break;
      case 'gender':
        payload.gender = value;
        break;
      case 'goals':
        payload.goals = value
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean);
        break;
      case 'diet':
        payload.dietPreference = value;
        break;
      case 'photo':
        payload.profilePhoto = value;
        break;
      case 'phone':
        payload.phone = value;
        break;
      case 'email':
        payload.email = value;
        break;
      case 'location':
        payload.location = value;
        break;
      case 'bio':
        payload.bio = value;
        break;
      case 'dob':
        payload.dob = value;
        break;
    }

    return payload;
  };

  const handleSaveField = async () => {
    if (!editingField) return;
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditModalVisible(false);
      return;
    }

    try {
      setSavingField(true);
      const payload = buildUpdatePayloadForField(
        editingField.key,
        trimmed
      );

      // cast as any so we can send extended fields (phone, bio, etc.)
      await updateProfile(payload as any);

      // refresh profile
      const updated = await getProfile();
      setProfile(updated);
      setEditModalVisible(false);
    } catch (err) {
      console.log('[SETTINGS] updateProfile error', err);
    } finally {
      setSavingField(false);
    }
  };

  const renderRowWithSwitch = (
    IconComp: React.ComponentType<{ size?: number; color?: string }>,
    title: string,
    subtitle: string | undefined,
    key: ToggleKey,
    isLast?: boolean
  ) => (
    <View
      style={[
        styles.row,
        !isLast && styles.rowDivider,
      ]}
    >
      <View style={styles.rowLeft}>
        <View style={styles.iconPill}>
          <IconComp size={18} color={BRAND_PINK} />
        </View>
        <View>
          <Text style={styles.rowTitle}>{title}</Text>
          {subtitle ? (
            <Text style={styles.rowSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <Switch
        value={toggles[key]}
        onValueChange={() => onToggle(key)}
        trackColor={{ false: '#e5e7eb', true: '#fecdd3' }}
        thumbColor="#ffffff"
      />
    </View>
  );

  const renderRowWithArrow = (
    IconComp: React.ComponentType<{ size?: number; color?: string }>,
    title: string,
    subtitle?: string,
    danger?: boolean,
    isLast?: boolean,
    onPress?: () => void
  ) => (
    <Pressable
      style={[
        styles.row,
        !isLast && styles.rowDivider,
      ]}
      onPress={onPress}
    >
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.iconPill,
            danger && { backgroundColor: '#fee2e2' },
          ]}
        >
          <IconComp
            size={18}
            color={danger ? '#dc2626' : BRAND_PINK}
          />
        </View>
        <View>
          <Text
            style={[
              styles.rowTitle,
              danger && { color: '#dc2626' },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.rowSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <ChevronRight size={18} color="#9ca3af" />
    </Pressable>
  );

  const emailValue =
    profile?.email || (loadingProfile ? 'Loading…' : 'Not set');
  const phoneValue =
    profile?.profile?.phone ||
    profile?.phone ||
    (loadingProfile ? 'Loading…' : 'Not set');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={22} color="#111827" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Manage your account
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile completion card */}
        <View style={styles.section}>
          <LinearGradient
            colors={[BRAND_PINK, BRAND_PURPLE]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.profileCard}
          >
            <View style={styles.profileCardTop}>
              <View style={styles.profileIconCircle}>
                <User2 size={22} color="#fff" />
              </View>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.profileTitle}>
                  Complete Your Profile
                </Text>
                <Text style={styles.profileSubtitle}>
                  Earn rewards & unlock features
                </Text>
              </View>
              <Text style={styles.profilePercent}>
                {completionPercent}%
              </Text>
            </View>

            {/* progress bar */}
            <View style={styles.progressBarOuter}>
              <View
                style={[
                  styles.progressBarInner,
                  { width: `${completionPercent}%` },
                ]}
              />
            </View>

            <View style={styles.profileMetaRow}>
              <Text style={styles.profileMetaText}>
                {remainingFields} fields remaining
              </Text>
              <View style={styles.coinsPill}>
                <Star size={14} color="#fff" />
                <Text style={styles.coinsText}>500 Coins</Text>
              </View>
            </View>

            {/* "Complete Now" removed as requested */}
          </LinearGradient>
        </View>

        {/* Profile fields */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitleProfile}>Profile Fields</Text>

            {profileFields.map((field, index) => (
              <View
                key={field.key}
                style={[
                  styles.fieldRow,
                  index !== profileFields.length - 1 && styles.rowDivider,
                ]}
              >
                <View style={styles.fieldLeft}>
                  <View
                    style={[
                      styles.fieldStatusCircle,
                      field.done
                        ? styles.fieldStatusCircleDone
                        : styles.fieldStatusCirclePending,
                    ]}
                  >
                    {field.done ? (
                      <Check
                        size={12}
                        color="#22c55e"
                        strokeWidth={3}
                      />
                    ) : null}
                  </View>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                </View>
                {!field.done && (
                  <Pressable onPress={() => openEditField(field)}>
                    <Text style={styles.fieldAdd}>Add</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ACCOUNT */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <View style={styles.card}>
            {renderRowWithArrow(User2, 'Edit Profile')}
            {renderRowWithArrow(Mail, 'Email Address', emailValue)}
            {renderRowWithArrow(Phone, 'Phone Number', phoneValue)}
            {renderRowWithArrow(MapPin, 'Location', 'Not set')}
            {renderRowWithArrow(
              Calendar,
              'Date of Birth',
              'Not set',
              false,
              true
            )}
          </View>
        </View>

        {/* NOTIFICATIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
          <View style={styles.card}>
            {renderRowWithSwitch(
              Bell,
              'Push Notifications',
              'Receive push notifications',
              'push'
            )}
            {renderRowWithSwitch(
              Mail,
              'Email Notifications',
              'Receive email updates',
              'email'
            )}
            {renderRowWithSwitch(
              Phone,
              'SMS Notifications',
              'Receive SMS alerts',
              'sms'
            )}
            {renderRowWithSwitch(
              Star,
              'Challenge Updates',
              'Get notified about challenges',
              'challenge'
            )}
            {renderRowWithSwitch(
              MessageSquare,
              'Order Updates',
              'Track your order status',
              'order'
            )}
            {renderRowWithSwitch(
              Globe2,
              'Marketing Updates',
              'Receive promotional content',
              'marketing',
              true
            )}
          </View>
        </View>

        {/* PRIVACY & SECURITY */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PRIVACY & SECURITY</Text>
          <View style={styles.card}>
            {renderRowWithSwitch(
              Globe2,
              'Public Profile',
              'Anyone can see your profile',
              'publicProfile'
            )}
            {renderRowWithSwitch(
              Eye,
              'Show Activity',
              'Let others see your activity',
              'showActivity'
            )}
            {renderRowWithSwitch(
              BarChart3,
              'Show Stats',
              'Display your health stats',
              'showStats'
            )}
            {renderRowWithSwitch(
              MessageCircle,
              'Allow Messages',
              'Receive messages from others',
              'allowMessages'
            )}
            {renderRowWithArrow(
              Lock,
              'Change Password',
              undefined,
              false,
              true
            )}
          </View>
        </View>

        {/* APP SETTINGS */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>APP SETTINGS</Text>
          <View style={styles.card}>
            {renderRowWithArrow(Globe2, 'Language', 'English')}
            {renderRowWithArrow(
              BarChart3,
              'Units',
              'Metric (kg, km)'
            )}
            {renderRowWithArrow(
              Bell,
              'Notification Tone',
              'Default'
            )}
            {renderRowWithArrow(
              HelpCircle,
              'Data & Storage',
              'Manage',
              false,
              true
            )}
          </View>
        </View>

        {/* HELP & SUPPORT */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>HELP & SUPPORT</Text>
          <View style={styles.card}>
            {renderRowWithArrow(HelpCircle, 'Help Center')}
            {renderRowWithArrow(MessageCircle, 'Contact Support')}
            {renderRowWithArrow(Star, 'Rate Nutrithy')}
            {renderRowWithArrow(
              Info,
              'About',
              'Version 1.0.0',
              false,
              true
            )}
          </View>
        </View>

        {/* ACCOUNT ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT ACTIONS</Text>
          <View style={styles.card}>
            {renderRowWithArrow(
              LogOut,
              'Log Out',
              undefined,
              false,
              false,
              handleLogout
            )}
            {renderRowWithArrow(
              Trash2,
              'Delete Account',
              undefined,
              true,
              true
            )}
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              Made with ❤️ by Nutrithy
            </Text>
            <View style={styles.footerLinksRow}>
              <Text style={styles.footerLink}>Terms of Service</Text>
              <Text style={styles.footerDot}>•</Text>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingField ? `Add ${editingField.label}` : 'Update'}
            </Text>
            {editingField?.key === 'goals' && (
              <Text style={styles.modalHint}>
                You can enter multiple goals separated by commas.
              </Text>
            )}
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              placeholder={
                editingField?.key === 'goals'
                  ? 'e.g. Lose weight, Improve sleep'
                  : editingField?.label
              }
              placeholderTextColor="#9ca3af"
              style={[
                styles.modalInput,
                editingField?.key === 'bio' && {
                  height: 100,
                  textAlignVertical: 'top',
                },
              ]}
              multiline={editingField?.key === 'bio'}
            />

            <View style={styles.modalButtonsRow}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => setEditModalVisible(false)}
                disabled={savingField}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalBtn,
                  styles.modalBtnPrimary,
                  !editValue.trim() && { opacity: 0.6 },
                ]}
                onPress={handleSaveField}
                disabled={savingField || !editValue.trim()}
              >
                {savingField ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

/* ---- Styles (same as before plus modal styles) ---- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_SOFT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  profileCard: {
    borderRadius: CARD_RADIUS,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  profileCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  profileSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  profilePercent: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  progressBarOuter: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 9999,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 9999,
  },
  profileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  profileMetaText: {
    color: '#fee2e2',
    fontSize: 12,
  },
  coinsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  coinsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  sectionTitleProfile: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldStatusCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fieldStatusCircleDone: {
    borderWidth: 2,
    borderColor: '#bbf7d0',
    backgroundColor: '#ecfdf3',
  },
  fieldStatusCirclePending: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#111827',
  },
  fieldAdd: {
    fontSize: 13,
    color: BRAND_PINK_DARK,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fee2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  footerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 12,
    color: BRAND_PINK_DARK,
    fontWeight: '600',
  },
  footerDot: {
    fontSize: 12,
    color: '#9ca3af',
    marginHorizontal: 6,
  },

  /* Modal styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  modalHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  modalInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    columnGap: 8,
  },
  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9999,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnSecondary: {
    backgroundColor: '#f3f4f6',
  },
  modalBtnSecondaryText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 13,
  },
  modalBtnPrimary: {
    backgroundColor: BRAND_PINK_DARK,
  },
  modalBtnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
