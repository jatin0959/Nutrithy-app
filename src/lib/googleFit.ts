// src/lib/googleFit.ts
// Thin wrapper around react-native-google-fit
// to keep all Fit-related logic in one place.

import { Platform, PermissionsAndroid } from 'react-native';
import GoogleFit, {
  Scopes,
  BucketUnit,
  type StartAndEndDate,
} from 'react-native-google-fit';

const isAndroid = Platform.OS === 'android';
const TAG = '[GOOGLE_FIT]';

// -------- helpers --------
function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

const ANDROID_10 = 29;

async function requestActivityRecognitionPermission(): Promise<boolean> {
  if (!isAndroid) return false;

  const activityPermission = PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION;
  if (!activityPermission) {
    console.log(`${TAG} ACTIVITY_RECOGNITION permission constant missing – skipping request`);
    return true;
  }

  const androidVersion = Number(Platform.Version);
  if (!Number.isNaN(androidVersion) && androidVersion < ANDROID_10) {
    // Permission is granted at install time for Android 9 and below
    return true;
  }

  const alreadyGranted = await PermissionsAndroid.check(activityPermission);
  if (alreadyGranted) {
    return true;
  }

  try {
    console.log(`${TAG} requesting ACTIVITY_RECOGNITION permission…`);

    const result = await PermissionsAndroid.request(
      activityPermission,
      {
        title: 'Allow activity recognition',
        message:
          'Nutrithy uses your step count from Google Fit to show your progress.',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    console.log(`${TAG} ACTIVITY_RECOGNITION result:`, result);

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      console.log(
        `${TAG} ACTIVITY_RECOGNITION permanently denied – ask user to enable it from Android Settings`
      );
    }

    return false;
  } catch (e) {
    console.log(`${TAG} requestActivityRecognitionPermission error`, e);
    return false;
  }
}

/**
 * Check whether we already have Google Fit authorization.
 */
export async function isGoogleFitConnected(): Promise<boolean> {
  if (!isAndroid) return false;

  try {
    console.log(`${TAG} checkIsAuthorized called`);
    await GoogleFit.checkIsAuthorized();
    console.log(`${TAG} checkIsAuthorized isAuthorized=`, GoogleFit.isAuthorized);
    return !!GoogleFit.isAuthorized;
  } catch (e) {
    console.log('[GOOGLE_FIT_CHECK_ERROR]', e);
    return false;
  }
}

/**
 * Ask the user to connect / authorize Google Fit.
 * Returns true if permissions were granted.
 */
export async function connectGoogleFit(): Promise<boolean> {
  if (!isAndroid) return false;

  try {
    // 1) Runtime permission
    const permGranted = await requestActivityRecognitionPermission();
    if (!permGranted) {
      console.log(`${TAG} ACTIVITY_RECOGNITION denied – cannot authorize Google Fit`);
      return false;
    }

    // 2) Google Fit OAuth scopes
    const options = {
      scopes: [
        Scopes.FITNESS_ACTIVITY_READ,
        Scopes.FITNESS_ACTIVITY_WRITE,
        Scopes.FITNESS_LOCATION_READ,
        Scopes.FITNESS_BODY_READ,
        Scopes.FITNESS_BODY_WRITE,
      ],
    };

    console.log(`${TAG} calling authorize with scopes`, options.scopes);
    const res = await GoogleFit.authorize(options);
    console.log(`${TAG} authorize result:`, res);

    if (res.success) {
      console.log(`${TAG} Authorized`);
      return true;
    }

    console.log(`${TAG} Authorization denied`, res.message);
    return false;
  } catch (e) {
    console.log('[GOOGLE_FIT_CONNECT_ERROR]', e);
    return false;
  }
}

/**
 * Fetch today's total steps from Google Fit.
 * Returns 0 on any error.
 */
export async function getTodaySteps(): Promise<number> {
  if (!isAndroid) return 0;

  try {
    const start = startOfDay();
    const end = new Date();

    const opts: StartAndEndDate & {
      bucketUnit?: BucketUnit;
      bucketInterval?: number;
    } = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      bucketUnit: BucketUnit.DAY,
      bucketInterval: 1,
    };

    console.log(`${TAG} getDailyStepCountSamples opts:`, opts);

    const res = await GoogleFit.getDailyStepCountSamples(opts);

    console.log(
      `${TAG} raw daily step samples:`,
      JSON.stringify(res, null, 2)
    );

    if (!res || !Array.isArray(res) || res.length === 0) {
      return 0;
    }

    // Prefer Google's estimated steps source if available
    const googleSource =
      res.find((r) => r.source === 'com.google.android.gms:estimated_steps') ||
      res[0];

    const list = googleSource?.steps || [];
    if (!list.length) return 0;

    const todayStr = start.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const todayEntry =
      list.find((s) => String(s.date).startsWith(todayStr)) ||
      list[list.length - 1];

    const steps = Number(todayEntry?.value || 0);
    console.log(`${TAG} today steps computed:`, steps);

    return steps;
  } catch (e) {
    console.log('[GOOGLE_FIT_TODAY_STEPS_ERROR]', e);
    return 0;
  }
}

/**
 * Fetch last 7 days of steps (oldest → newest).
 * Always returns an array of length 7 (fills missing days with 0).
 */
export async function getLast7DaysSteps(): Promise<number[]> {
  if (!isAndroid) return Array(7).fill(0);

  try {
    const start = daysAgo(6); // 6 days ago + today = 7 days
    const end = new Date();

    const opts: StartAndEndDate & {
      bucketUnit?: BucketUnit;
      bucketInterval?: number;
    } = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      bucketUnit: BucketUnit.DAY,
      bucketInterval: 1,
    };

    console.log(`${TAG} getLast7DaysSteps opts:`, opts);

    const res = await GoogleFit.getDailyStepCountSamples(opts);

    console.log(
      `${TAG} last7 raw samples:`,
      JSON.stringify(res, null, 2)
    );

    if (!res || !Array.isArray(res) || res.length === 0) {
      return Array(7).fill(0);
    }

    const googleSource =
      res.find((r) => r.source === 'com.google.android.gms:estimated_steps') ||
      res[0];

    const list: { date: string; value: number }[] = googleSource?.steps || [];

    // Build a map dateStr -> value
    const map = new Map<string, number>();
    for (const item of list) {
      const d = String(item.date).slice(0, 10); // "YYYY-MM-DD"
      map.set(d, Number(item.value || 0));
    }

    const out: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      out.push(map.get(key) ?? 0);
    }

    console.log(`${TAG} last7 days array:`, out);
    return out;
  } catch (e) {
    console.log('[GOOGLE_FIT_LAST7_ERROR]', e);
    return Array(7).fill(0);
  }
}
