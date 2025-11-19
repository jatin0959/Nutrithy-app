import { api } from './client';

/* =========================
 * Types (lightweight)
 * ======================= */

export type ThriveNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  data?: Record<string, any>;
};


export type ThriveFeedPost = {
  id: string;
  caption: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  likedByMe: boolean;
  author: {
    id: string;
    firstName: string;
    lastName?: string;
    profilePicture?: string | null;
  };
};

export type ThriveComment = {
  id: string;
  text: string;
  createdAt: string;
  likesCount: number;
  likedByMe: boolean;
  author: {
    id: string;
    firstName: string;
    lastName?: string;
    profilePicture?: string | null;
  };
};



export type ChallengeCard = {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string | null;

  status: 'upcoming' | 'active' | 'completed';
  daysLeft: number;
  totalDays: number;
  currentDay: number;

  joined: boolean;
  participantsCount: number;
  progressPct: number;
  ctaLabel: string;
  category: string | null;
};

export type LeaderboardItem = {
  rank: number;
  userId: string | null;
  name: string;
  profilePic: string | null;
  points: number; // ✅ coins as number
  isCurrentUser: boolean;
};

/**
 * Team leaderboard item (for "Teams" tab in leaderboard).
 * Backend returns this shape (or compatible).
 */
export type TeamLeaderboardItem = {
  id: string; // teamId
  name: string;
  rank: number;
  points: number; // ✅ team points as number
  membersCount: number;
  avatarUrl: string | null;
  isCurrentUserTeam?: boolean;
};


export type TalkThreadItem = {
  id: string;
  title: string;
  bodyPreview: string;
  topicType?: string;
  challengeId?: string | null;
  isPinned: boolean;
  isLocked: boolean;

  replies: number;
  participants: number;
  lastMessageAt: string;

  lastMessage: null | {
    id: string;
    authorId: string;
    authorName: string;
    bodyPreview: string;
    createdAt: string;
  };

  isOwner: boolean;
  createdAt: string;
};

/* ========= PEOPLE / CONNECTIONS ========= */

export type ThrivePerson = {
  id: string;
  firstName: string;
  lastName?: string;
  profilePicture?: string | null;
  headline?: string | null; // e.g. "UI Designer", "Sales @ XYZ"
  department?: string | null;
  location?: string | null;
  isConnected: boolean;
  connectionStatus:
    | 'none'
    | 'requested_by_me'
    | 'requested_to_me'
    | 'connected';
    requestId?: string | null;
    isCurrentUser?: boolean;
};

export type ThriveUserProfile = {
  id: string;
  firstName: string;
  lastName?: string;
  profilePicture?: string | null;
  headline?: string | null;
  bio?: string | null;
  department?: string | null;
  location?: string | null;

  isConnected: boolean;
  connectionStatus:
    | 'none'
    | 'requested_by_me'
    | 'requested_to_me'
    | 'connected';

  stats?: {
    totalPoints: number;
    completedChallenges: number;
    currentStreakDays: number;
  };

  recentChallenges?: Array<{
    id: string;
    title: string;
    status: 'upcoming' | 'active' | 'completed';
    progressPct: number;
  }>;
};

export type ThriveConnection = {
  id: string;
  userId: string;
  name: string;
  profilePicture?: string | null;
  status: 'connected' | 'pending_incoming' | 'pending_outgoing';
};

/* ========= TEAMS ========= */

export type TeamSummary = {
  id: string;
  name: string;
  membersCount: number;
  unreadCount?: number;
};

export type TeamMember = {
  userId: string;
  firstName: string;
  lastName?: string;
  profilePicture?: string | null;
  role: 'owner' | 'admin' | 'member';
};

export type TeamDetail = {
  id: string;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;

  challengeId?: string | null;
  challengeTitle?: string | null;

  membersCount: number;
  membersPreview: TeamMember[];

  isMember: boolean;
  isOwner: boolean;

  // Weekly or current period stats for this team
  stats?: {
    period: 'daily' | 'weekly' | 'monthly';
    points: number;
    rank?: number | null;
  };
};

/* =========================
 * FEED
 * GET /api/employee/thrive/feed
 * ======================= */

export async function getThriveFeed(
  limit = 20,
  cursor?: string
): Promise<{
  success: boolean;
  data: ThriveFeedPost[];
  nextCursor: string | null;
}> {
  const params: Record<string, unknown> = { limit };
  if (cursor) params.cursor = cursor;

  console.log('[API] GET /api/employee/thrive/feed params:', params);

  const res = await api.get('/api/employee/thrive/feed', { params });

  console.log(
    '[API] GET /api/employee/thrive/feed response:',
    JSON.stringify(res.data, null, 2)
  );

  // res.data = { success, data: [...], nextCursor }
  return res.data;
}

// // =========================
// // POST LIKE / UNLIKE POST
// // =========================

// export async function likeThrivePost(postId: string): Promise<{
//   success: boolean;
//   data?: { likesCount: number; likedByMe: boolean };
//   error?: any;
// }> {
//   try {
//     console.log('[API] POST /api/employee/thrive/posts/:id/like', postId);
//     const res = await api.post(`/api/employee/thrive/posts/${postId}/like`);
//     console.log(
//       '[API] likeThrivePost response:',
//       JSON.stringify(res.data, null, 2)
//     );
//     return res.data;
//   } catch (err: any) {
//     if (err.response) {
//       console.log(
//         '[API_ERROR] likeThrivePost',
//         err.response.status,
//         err.response.data
//       );
//       return err.response.data;
//     }
//     console.log(
//       '[API_ERROR] likeThrivePost network error',
//       err?.message || err
//     );
//     throw err;
//   }
// }

// export async function unlikeThrivePost(postId: string): Promise<{
//   success: boolean;
//   data?: { likesCount: number; likedByMe: boolean };
//   error?: any;
// }> {
//   try {
//     console.log('[API] POST /api/employee/thrive/posts/:id/unlike', postId);
//     const res = await api.post(`/api/employee/thrive/posts/${postId}/unlike`);
//     console.log(
//       '[API] unlikeThrivePost response:',
//       JSON.stringify(res.data, null, 2)
//     );
//     return res.data;
//   } catch (err: any) {
//     if (err.response) {
//       console.log(
//         '[API_ERROR] unlikeThrivePost',
//         err.response.status,
//         err.response.data
//       );
//       return err.response.data;
//     }
//     console.log(
//       '[API_ERROR] unlikeThrivePost network error',
//       err?.message || err
//     );
//     throw err;
//   }
// }


// // =========================
// // GET COMMENTS FOR A POST
// // GET /api/employee/thrive/posts/:id/comments
// // =========================

// export async function getPostComments(
//   postId: string
// ): Promise<{ success: boolean; data: ThriveComment[] }> {
//   console.log(
//     '[API] GET /api/employee/thrive/posts/:id/comments',
//     postId
//   );

//   const res = await api.get(`/api/employee/thrive/posts/${postId}/comments`);

//   console.log(
//     '[API] GET /api/employee/thrive/posts/:id/comments response:',
//     JSON.stringify(res.data, null, 2)
//   );

//   return res.data;
// }


// // =========================
// // POST COMMENT ON THRIVE POST
// // POST /api/employee/thrive/posts/:id/comments
// // =========================

// export async function addPostComment(
//   postId: string,
//   text: string
// ): Promise<{
//   success: boolean;
//   data?: ThriveComment;
//   error?: any;
// }> {
//   try {
//     const payload = { text };

//     console.log(
//       '[API] POST /api/employee/thrive/posts/:id/comments payload:',
//       { postId, ...payload }
//     );

//     const res = await api.post(
//       `/api/employee/thrive/posts/${postId}/comments`,
//       payload
//     );

//     console.log(
//       '[API] POST /api/employee/thrive/posts/:id/comments response:',
//       JSON.stringify(res.data, null, 2)
//     );

//     return res.data;
//   } catch (err: any) {
//     if (err.response) {
//       console.log(
//         '[API_ERROR] addPostComment',
//         err.response.status,
//         err.response.data
//       );
//       return err.response.data;
//     }

//     console.log(
//       '[API_ERROR] addPostComment network error',
//       err?.message || err
//     );
//     throw err;
//   }
// }

// // =========================
// // SHARE POST (analytics / coins)
// // POST /api/employee/thrive/posts/:id/share
// // =========================

// export async function shareThrivePost(postId: string): Promise<{
//   success: boolean;
//   data?: { sharesCount: number };
//   error?: any;
// }> {
//   try {
//     console.log('[API] POST /api/employee/thrive/posts/:id/share', postId);
//     const res = await api.post(`/api/employee/thrive/posts/${postId}/share`);
//     console.log(
//       '[API] shareThrivePost response:',
//       JSON.stringify(res.data, null, 2)
//     );
//     return res.data;
//   } catch (err: any) {
//     if (err.response) {
//       console.log(
//         '[API_ERROR] shareThrivePost',
//         err.response.status,
//         err.response.data
//       );
//       return err.response.data;
//     }

//     console.log(
//       '[API_ERROR] shareThrivePost network error',
//       err?.message || err
//     );
//     throw err;
//   }
// }



/* =========================
 * CHALLENGES
 * GET /api/employee/challenges
 * POST /api/employee/challenges/:id/join
 * ======================= */

export async function getChallenges(
  options?: {
    status?: 'active' | 'upcoming' | 'completed';
    limit?: number;
    cursor?: string;
  }
): Promise<{
  items: ChallengeCard[];
  nextCursor: string | null;
}> {
  const { status = 'active', limit = 20, cursor } = options || {};
  const params: any = { status, limit };
  if (cursor) params.cursor = cursor;

  console.log('[API] GET /api/employee/challenges params:', params);

  const res = await api.get('/api/employee/challenges', { params });

  console.log(
    '[API] GET /api/employee/challenges response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

export async function joinChallenge(challengeId: string) {
  const body = {
    // you can send { date: 'YYYY-MM-DD' } if needed
  };

  console.log(
    '[API] POST /api/employee/challenges/:id/join payload:',
    { challengeId, body }
  );

  const res = await api.post(
    `/api/employee/challenges/${challengeId}/join`,
    body
  );

  console.log(
    '[API] POST /api/employee/challenges/:id/join response:',
    JSON.stringify(res.data, null, 2)
  );

  // res.data = { ok: true, status: 'enrolled' }
  return res.data;
}

export type ChallengeDetail = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  coverImage: string | null;

  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  totalDays: number;
  currentDay: number;
  daysLeft: number;

  joined: boolean;
  participantsCount: number;

  yourProgress: {
    completedDays: number;
    totalDays: number;
    progressPct: number;
    points: number;
    rank: number | null;
    activeFriendsCount: number;
  };

  dailyDeadline: string; // "23:59"
  isFree: boolean;
};

export async function getChallengeDetail(
  challengeId: string
): Promise<{ data: ChallengeDetail }> {
  console.log(
    '[API] GET /api/employee/challenges/:id request:',
    challengeId
  );

  const res = await api.get(`/api/employee/challenges/${challengeId}`);

  console.log(
    '[API] GET /api/employee/challenges/:id response:',
    JSON.stringify(res.data, null, 2)
  );

  // backend returns { data: dto }
  return res.data;
}

/* =========================
 * LEADERBOARD
 * GET /api/employee/leaderboard/individual
 * GET /api/employee/leaderboard/team
 * ======================= */

export async function getIndividualLeaderboard(
  period: 'daily' | 'weekly' | 'monthly' | 'all' = 'weekly'
): Promise<{
  success: boolean;
  scope: 'individual';
  period: string;
  items: LeaderboardItem[];
}> {
  console.log(
    '[API] GET /api/employee/leaderboard/individual params:',
    { period }
  );

  const res = await api.get('/api/employee/leaderboard/individual', {
    params: { period },
  });

  console.log(
    '[API] GET /api/employee/leaderboard/individual response:',
    JSON.stringify(res.data, null, 2)
  );

  // res.data = { success, scope, period, items: [...] }
  return res.data;
}

/**
 * Team leaderboard – used for "Teams" tab.
 * Suggested backend endpoint: GET /api/employee/leaderboard/team
 */
export async function getTeamLeaderboard(
  period: 'daily' | 'weekly' | 'monthly' | 'all' = 'weekly'
): Promise<{
  success: boolean;
  scope: 'team';
  period: string;
  items: TeamLeaderboardItem[];
}> {
  console.log(
    '[API] GET /api/employee/leaderboard/team params:',
    { period }
  );

  const res = await api.get('/api/employee/leaderboard/team', {
    params: { period },
  });

  console.log(
    '[API] GET /api/employee/leaderboard/team response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

/* =========================
 * THRIVETALK
 * ======================= */

/**
 * Optionally filter by challengeId OR teamId
 */
export async function getTalkThreads(
  limit = 20,
  cursor?: string,
  challengeId?: string,
  teamId?: string
): Promise<{
  success: boolean;
  items: TalkThreadItem[];
  nextCursor: string | null;
}> {
  const params: Record<string, unknown> = { limit };
  if (cursor) params.cursor = cursor;
  if (challengeId) params.challengeId = challengeId;
  if (teamId) params.teamId = teamId;

  console.log('[API] GET /api/employee/talk params:', params);

  const res = await api.get('/api/employee/talk', { params });

  console.log(
    '[API] GET /api/employee/talk response:',
    JSON.stringify(res.data, null, 2)
  );

  // res.data = { success, items, nextCursor }
  return res.data;
}

export async function getTalkThreadMessages(
  threadId: string,
  limit = 30,
  cursor?: string
): Promise<{
  success: boolean;
  thread: {
    id: string;
    title: string;
    body: string;
    topicType: string;
    challengeId: string | null;
    stats: any;
    createdAt: string;
  };
  items: Array<{
    id: string;
    threadId: string;
    parentId: string | null;
    authorId: string;
    authorName: string;
    authorAvatar: string | null;
    body: string;
    media: any;
    likesCount: number;
    createdAt: string;
    updatedAt: string;
    isEdited: boolean;
  }>;
  nextCursor: string | null;
}> {
  const params: Record<string, unknown> = { limit };
  if (cursor) params.cursor = cursor;

  console.log(
    '[API] GET /api/employee/talk/:threadId params:',
    { threadId, ...params }
  );

  const res = await api.get(`/api/employee/talk/${threadId}`, {
    params,
  });

  console.log(
    '[API] GET /api/employee/talk/:threadId response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

export async function createTalkThread(args: {
  title: string;
  body: string;
  challengeId?: string;
  topicType?: 'general' | 'challenge' | 'announcement';
  tags?: string[];
  teamId?: string; // allow linking a thread to a team
}): Promise<{
  success: boolean;
  threadId: string;
}> {
  console.log(
    '[API] POST /api/employee/talk payload:',
    args
  );

  const res = await api.post('/api/employee/talk', args);

  console.log(
    '[API] POST /api/employee/talk response:',
    JSON.stringify(res.data, null, 2)
  );

  // res.data = { success: true, threadId }
  return res.data;
}

export async function postTalkReply(
  threadId: string,
  args: {
    body: string;
    parentId?: string;
    media?: {
      type: 'image' | 'video' | 'link' | 'none';
      url?: string;
      thumbUrl?: string;
    };
  }
): Promise<{ success: boolean; messageId: string }> {
  console.log(
    '[API] POST /api/employee/talk/:threadId/messages payload:',
    { threadId, ...args }
  );

  const res = await api.post(
    `/api/employee/talk/${threadId}/messages`,
    args
  );

  console.log(
    '[API] POST /api/employee/talk/:threadId/messages response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

export async function toggleTalkMessageLike(
  threadId: string,
  messageId: string
): Promise<{ success: boolean; liked: boolean; likesCount: number }> {
  console.log(
    '[API] POST /api/employee/talk/:threadId/messages/:messageId/like payload:',
    { threadId, messageId }
  );

  const res = await api.post(
    `/api/employee/talk/${threadId}/messages/${messageId}/like`
  );

  console.log(
    '[API] POST /api/employee/talk/:threadId/messages/:messageId/like response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

/* =========================
 * CHALLENGE DAY + COMPONENTS
 * GET /api/employee/challenges/:id/day
 * POST submissions/progress
 * ======================= */

export type ChallengeDayTask = {
  taskId: string;
  taskName: string;
  taskDesc: string;
  points: number;
  status: 'pending' | 'completed' | 'expired';
  pointsEarned: number;
  videoRequired: 'photo' | 'video' | 'none';
  photoreq: '0' | '1';
  videoreq: '0' | '1';
  taskimg: string | null;
};

export type ChallengeDayTrivia = {
  triviaId: string;
  title: string;
  attempts: number;
  maxAttempts: number;
  pointsEarned: number;
  quizImage: string | null;
};

export type ChallengeDayModule = {
  moduleId: string;
  title: string;
  description: string;
  durationMins: string;
  TrnStartDt: string;
  TrnCoverImgFile: string | null;
  pdfUrl: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPct: number;
};

export type ChallengeDayWorkshop = {
  workshopId: string;
  title: string;
  LWSDesc: string;
  LWSDate: string;
  LwsCoverImg: string | null;
  LWSLink: string | null;
  platform: string;
  startAt: string | null;
  endAt: string | null;
  joined: boolean;
};

export type ChallengeDayPayload = {
  date: string; // YYYY-MM-DD
  challengeId: string;
  status: 'pending' | 'open';
  tasks: ChallengeDayTask[];
  trivia: ChallengeDayTrivia[];
  learningModules: ChallengeDayModule[];
  workshops: ChallengeDayWorkshop[];
};

/**
 * Load a specific day snapshot for a challenge.
 * If `date` is omitted backend uses "today".
 */
export async function getChallengeDay(
  challengeId: string,
  date?: string
): Promise<ChallengeDayPayload> {
  const params: Record<string, string> = {};
  if (date) params.date = date;

  console.log(
    '[API] GET /api/employee/challenges/:id/day params:',
    { challengeId, ...params }
  );

  const res = await api.get(`/api/employee/challenges/${challengeId}/day`, {
    params,
  });

  console.log(
    '[API] GET /api/employee/challenges/:id/day response:',
    JSON.stringify(res.data, null, 2)
  );

  // backend returns plain payload (not wrapped in { data })
  return res.data;
}

/**
 * Submit task proof (photo / video / link).
 */
export async function submitChallengeTaskProof(args: {
  challengeId: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  proof: {
    type: 'none' | 'photo' | 'video';
    url: string;
  };
}): Promise<{ ok: boolean }> {
  const { challengeId, taskId, date, proof } = args;

  console.log(
    '[API] POST /api/employee/challenges/:id/tasks/:taskId/submissions payload:',
    { challengeId, taskId, date, proof }
  );

  const res = await api.post(
    `/api/employee/challenges/${challengeId}/tasks/${taskId}/submissions`,
    {
      date,
      proof,
    }
  );

  console.log(
    '[API] POST /api/employee/challenges/:id/tasks/:taskId/submissions response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

/* =========================
 * PEOPLE & CONNECTIONS
 * (Explore people, profiles, connections)
 * ======================= */

/**
 * Search people in the organisation / network.
 * Suggested backend endpoint: GET /api/employee/thrive/people
 */
export async function searchPeople(
  search: string,
  limit = 20,
  cursor?: string
): Promise<{ items: ThrivePerson[]; nextCursor: string | null }> {
  const params: Record<string, unknown> = { search, limit };
  if (cursor) params.cursor = cursor;

  console.log('[API] GET /api/employee/thrive/people params:', params);

  const res = await api.get('/api/employee/thrive/people', { params });

  console.log(
    '[API] GET /api/employee/thrive/people response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

/**
 * Detailed user profile for profile screen.
 * Suggested endpoint: GET /api/employee/thrive/people/:userId
 */
export async function getUserProfile(
  userId: string
): Promise<{ data: ThriveUserProfile }> {
  console.log(
    '[API] GET /api/employee/thrive/people/:userId request:',
    userId
  );

  const res = await api.get(`/api/employee/thrive/people/${userId}`);

  console.log(
    '[API] GET /api/employee/thrive/people/:userId response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

/**
 * Send connection / friend request.
 * Suggested endpoint: POST /api/employee/thrive/connections/requests
 */
export async function sendConnectionRequest(
  targetUserId: string
): Promise<{ success: boolean; requestId: string }> {
  const body = { targetUserId };

  console.log(
    '[API] POST /api/employee/thrive/connections/requests payload:',
    body
  );

  const res = await api.post(
    '/api/employee/thrive/connections/requests',
    body
  );

  console.log(
    '[API] POST /api/employee/thrive/connections/requests response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

/**
 * Accept or decline a connection request.
 * Suggested endpoint: POST or PATCH /api/employee/thrive/connections/requests/:requestId
 */
export async function respondToConnectionRequest(
  requestId: string,
  action: 'accept' | 'decline'
): Promise<{ success: boolean }> {
  const body = { action };

  console.log(
    '[API] PATCH /api/employee/thrive/connections/requests/:id payload:',
    { requestId, ...body }
  );

  const res = await api.patch(
    `/api/employee/thrive/connections/requests/${requestId}`,
    body
  );

  console.log(
    '[API] PATCH /api/employee/thrive/connections/requests/:id response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

/**
 * Get current user's connections.
 * Suggested endpoint: GET /api/employee/thrive/connections
 */
export async function getConnections(): Promise<{
  items: ThriveConnection[];
}> {
  console.log('[API] GET /api/employee/thrive/connections');

  const res = await api.get('/api/employee/thrive/connections');

  console.log(
    '[API] GET /api/employee/thrive/connections response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

/* =========================
 * TEAMS
 * (Teams are user-created groups; they appear in leaderboard + ThriveTalk)
 * ======================= */

/**
 * Get teams where current user is a member.
 * Suggested endpoint: GET /api/employee/thrive/teams?scope=mine
 */
export async function getUserTeams(): Promise<{
  items: TeamSummary[];
}> {
  const params = { scope: 'mine' };

  console.log(
    '[API] GET /api/employee/thrive/teams params:',
    params
  );

  const res = await api.get('/api/employee/thrive/teams', { params });

  console.log(
    '[API] GET /api/employee/thrive/teams response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

/**
 * Create a new team from selected people.
 * Suggested endpoint: POST /api/employee/thrive/teams
 */
export async function createTeam(args: {
  name: string;
  description?: string;
  challengeId?: string;
  memberIds: string[];
}): Promise<{ success: boolean; teamId: string }> {
  console.log(
    '[API] POST /api/employee/thrive/teams payload:',
    args
  );

  const res = await api.post('/api/employee/thrive/teams', args);

  console.log(
    '[API] POST /api/employee/thrive/teams response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

/**
 * Detailed team information for TeamDetail screen.
 * Suggested endpoint: GET /api/employee/thrive/teams/:teamId
 */
export async function getTeamDetailApi(
  teamId: string
): Promise<{ data: TeamDetail }> {
  console.log(
    '[API] GET /api/employee/thrive/teams/:teamId request:',
    teamId
  );

  const res = await api.get(`/api/employee/thrive/teams/${teamId}`);

  console.log(
    '[API] GET /api/employee/thrive/teams/:teamId response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

/**
 * Get full member list for a given team.
 * Suggested endpoint: GET /api/employee/thrive/teams/:teamId/members
 */
export async function getTeamMembers(
  teamId: string
): Promise<{ items: TeamMember[] }> {
  console.log(
    '[API] GET /api/employee/thrive/teams/:teamId/members request:',
    teamId
  );

  const res = await api.get(
    `/api/employee/thrive/teams/${teamId}/members`
  );

  console.log(
    '[API] GET /api/employee/thrive/teams/:teamId/members response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}






// GET /api/employee/thrive/users/:userId
export async function getThriveUserProfile(
  userId: string
): Promise<{ success: boolean; data: ThriveUserProfile }> {
  const res = await api.get(`/api/employee/thrive/users/${userId}`);
  return res.data;
}

// =========================
// DIRECT MESSAGE THREADS LIST
// =========================

export type DirectMessageThreadSummary = {
  id: string;              // other user id
  userId: string;          // same as id
  name: string;
  profilePicture: string | null;
  lastMessageBody: string;
  lastMessageAt: string;
  unreadCount: number;
};

/**
 * List DM threads (people you've chatted with).
 * GET /api/employee/thrive/chat
 */
export async function getDirectMessageThreads(
  limit = 20
): Promise<{ success: boolean; items: DirectMessageThreadSummary[] }> {
  const params: Record<string, unknown> = { limit };

  console.log('[API] GET /api/employee/thrive/chat params:', params);

  const res = await api.get('/api/employee/thrive/chat', { params });

  console.log(
    '[API] GET /api/employee/thrive/chat response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}


// =========================
// DIRECT MESSAGES / CHAT
// =========================

export type DirectMessage = {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
  isMine: boolean; // backend should set this based on current user
};

/**
 * Get messages in a 1:1 conversation with targetUserId.
 * Suggested endpoint: GET /api/employee/thrive/chat/:userId/messages
 */
export async function getDirectMessages(
  targetUserId: string,
  options?: { limit?: number; cursor?: string }
): Promise<{
  success: boolean;
  items: DirectMessage[];
  nextCursor: string | null;
}> {
  const { limit = 50, cursor } = options || {};
  const params: Record<string, unknown> = { limit };
  if (cursor) params.cursor = cursor;

  console.log(
    '[API] GET /api/employee/thrive/chat/:userId/messages params:',
    { targetUserId, ...params }
  );

  const res = await api.get(
    `/api/employee/thrive/chat/${targetUserId}/messages`,
    { params }
  );

  console.log(
    '[API] GET /api/employee/thrive/chat/:userId/messages response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

// =========================
// TEAM / GROUP CHAT
// =========================

/**
 * Get messages in a team / group conversation.
 * Backend: GET /api/employee/thrive/teams/:teamId/messages
 */
export async function getGroupMessages(
  teamId: string,
  options?: { limit?: number; cursor?: string }
): Promise<{
  success: boolean;
  items: DirectMessage[];      // or GroupMessage[]
  nextCursor: string | null;
}> {
  const { limit = 50, cursor } = options || {};
  const params: Record<string, unknown> = { limit };
  if (cursor) params.cursor = cursor;

  console.log(
    '[API] GET /api/employee/thrive/teams/:teamId/messages params:',
    { teamId, ...params }
  );

  const res = await api.get(
    `/api/employee/thrive/teams/${teamId}/messages`,
    { params }
  );

  console.log(
    '[API] GET /api/employee/thrive/teams/:teamId/messages response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

/**
 * Send a message in a team / group conversation.
 * Backend: POST /api/employee/thrive/teams/:teamId/messages
 */
export async function sendGroupMessage(
  teamId: string,
  body: string
): Promise<{
  success: boolean;
  message: DirectMessage;      // or GroupMessage
}> {
  const payload = { body };

  console.log(
    '[API] POST /api/employee/thrive/teams/:teamId/messages payload:',
    { teamId, ...payload }
  );

  const res = await api.post(
    `/api/employee/thrive/teams/${teamId}/messages`,
    payload
  );

  console.log(
    '[API] POST /api/employee/thrive/teams/:teamId/messages response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}


/**
 * Send a direct message to targetUserId.
 * Suggested endpoint: POST /api/employee/thrive/chat/:userId/messages
 */
export async function sendDirectMessage(
  targetUserId: string,
  body: string
): Promise<{
  success: boolean;
  message: DirectMessage;
}> {
  const payload = { body };

  console.log(
    '[API] POST /api/employee/thrive/chat/:userId/messages payload:',
    { targetUserId, ...payload }
  );

  const res = await api.post(
    `/api/employee/thrive/chat/${targetUserId}/messages`,
    payload
  );

  console.log(
    '[API] POST /api/employee/thrive/chat/:userId/messages response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

// ✅ LIST notifications for current user
export async function getNotifications(
  limit = 30,
  cursor?: string
): Promise<{
  items: ThriveNotification[];
  nextCursor: string | null;
}> {
  const params: Record<string, unknown> = { limit };
  if (cursor) params.cursor = cursor;

  console.log('[API] GET /api/employee/thrive/notifications params:', params);

  const res = await api.get('/api/employee/thrive/notifications', { params });

  console.log(
    '[API] GET /api/employee/thrive/notifications response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

// ✅ Mark a single notification as read
export async function markNotificationRead(notificationId: string) {
  console.log(
    '[API] POST /api/employee/thrive/notifications/:id/read',
    notificationId
  );

  const res = await api.post(
    `/api/employee/thrive/notifications/${notificationId}/read`
  );

  return res.data;
}


// =========================
// CREATE THRIVE POST
// POST /api/employee/thrive/posts
// =========================

export type CreateThrivePostPayload = {
  caption: string;
  mediaUrl?: string;
  mediaType?: 'none' | 'image' | 'video';
  visibility?: 'company' | 'public';
  tags?: string[];
  challengeId?: string;
};

export async function createThrivePost(
  payload: CreateThrivePostPayload
): Promise<{
  success: boolean;
  data?: ThriveFeedPost;
  error?: any;
}> {
  try {
    console.log(
      '[API] POST /api/employee/thrive/posts payload:',
      JSON.stringify(payload, null, 2)
    );

    const res = await api.post('/api/employee/thrive/posts', payload);

    console.log(
      '[API] POST /api/employee/thrive/posts response:',
      JSON.stringify(res.data, null, 2)
    );

    // backend returns: { success: true, data: { ...post } }
    return res.data;
  } catch (err: any) {
    if (err.response) {
      console.log(
        '[API_ERROR] createThrivePost response error',
        err.response.status,
        err.response.data
      );
      return err.response.data; // shape like { success: false, error: {...} }
    }

    console.log(
      '[API_ERROR] createThrivePost network error',
      err?.message || err
    );
    // rethrow so screen can show generic alert
    throw err;
  }
}


// src/api/thrive.ts

export async function uploadThriveMedia(
  localUri: string
): Promise<{ success: boolean; url: string; mediaType: 'image' }> {
  const form = new FormData();

  // Try to infer filename + mime type
  const filename = localUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpg';

  const mime =
    ext === 'jpg' || ext === 'jpeg'
      ? 'image/jpeg'
      : ext === 'png'
      ? 'image/png'
      : 'image/*';

  form.append('file', {
    uri: localUri,
    name: filename,
    type: mime,
  } as any);

  console.log('[UPLOAD] sending to /api/employee/thrive/posts/media', {
    localUri,
    filename,
    mime,
  });

  const res = await api.post(
    '/api/employee/thrive/posts/media',
    form,
    {
      // In React Native, axios will add the boundary for us
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  console.log(
    '[UPLOAD] response',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

// =========================
// POST LIKES + COMMENTS
// =========================

export type ThriveCommentDto = {
  id: string;
  text: string;
  createdAt: string;
  likesCount: number;
  likedByMe: boolean;
  author?: {
    id: string;
    firstName: string;
    lastName?: string;
    profilePicture?: string | null;
  };
};

// GET /api/employee/thrive/posts/:id/comments
export async function getPostComments(
  postId: string
): Promise<{ success: boolean; data: ThriveCommentDto[] }> {
  console.log(
    '[API] GET /api/employee/thrive/posts/:id/comments',
    postId
  );

  const res = await api.get(`/api/employee/thrive/posts/${postId}/comments`);

  console.log(
    '[API] GET /api/employee/thrive/posts/:id/comments response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

// POST /api/employee/thrive/posts/:id/comments
export async function addPostComment(
  postId: string,
  text: string
): Promise<{ success: boolean; data: ThriveCommentDto }> {
  console.log(
    '[API] POST /api/employee/thrive/posts/:id/comments payload:',
    { postId, text }
  );

  const res = await api.post(
    `/api/employee/thrive/posts/${postId}/comments`,
    { text }
  );

  console.log(
    '[API] POST /api/employee/thrive/posts/:id/comments response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

// POST /api/employee/thrive/posts/:id/like
export async function likeThrivePost(
  postId: string
): Promise<{
  success: boolean;
  data: { likesCount: number; likedByMe: boolean };
}> {
  console.log('[API] POST /api/employee/thrive/posts/:id/like', postId);

  const res = await api.post(`/api/employee/thrive/posts/${postId}/like`);

  console.log(
    '[API] POST /api/employee/thrive/posts/:id/like response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

// POST /api/employee/thrive/posts/:id/unlike
export async function unlikeThrivePost(
  postId: string
): Promise<{
  success: boolean;
  data: { likesCount: number; likedByMe: boolean };
}> {
  console.log('[API] POST /api/employee/thrive/posts/:id/unlike', postId);

  const res = await api.post(`/api/employee/thrive/posts/${postId}/unlike`);

  console.log(
    '[API] POST /api/employee/thrive/posts/:id/unlike response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}

// POST /api/employee/thrive/posts/:id/share
export async function shareThrivePost(
  postId: string
): Promise<{ success: boolean; data: { sharesCount: number } }> {
  console.log('[API] POST /api/employee/thrive/posts/:id/share', postId);

  const res = await api.post(`/api/employee/thrive/posts/${postId}/share`);

  console.log(
    '[API] POST /api/employee/thrive/posts/:id/share response:',
    JSON.stringify(res.data, null, 2)
  );

  return res.data;
}
