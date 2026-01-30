/**
 * User Profile Storage (Local Only)
 * Manages user identity, role, and personalization settings
 */

export type UserRole = "Solutions Consultant" | "Sales Engineer";

export interface UserProfile {
  name: string;
  role: UserRole;
  personalizationPrompt: string;
  createdAt: number;
  updatedAt: number;
}

const PROFILE_KEY = "enable_user_profile";

/**
 * Get user profile from localStorage
 */
export function getUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) return null;

    return JSON.parse(stored) as UserProfile;
  } catch (error) {
    console.error("Failed to load user profile:", error);
    return null;
  }
}

/**
 * Save user profile to localStorage
 */
export function saveUserProfile(
  profile: Omit<UserProfile, "createdAt" | "updatedAt">
): UserProfile {
  const existing = getUserProfile();

  const fullProfile: UserProfile = {
    ...profile,
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(fullProfile));
    return fullProfile;
  } catch (error) {
    console.error("Failed to save user profile:", error);
    throw error;
  }
}

/**
 * Update user profile (partial update)
 */
export function updateUserProfile(
  updates: Partial<Omit<UserProfile, "createdAt" | "updatedAt">>
): UserProfile | null {
  const existing = getUserProfile();
  if (!existing) return null;

  return saveUserProfile({
    name: updates.name ?? existing.name,
    role: updates.role ?? existing.role,
    personalizationPrompt:
      updates.personalizationPrompt ?? existing.personalizationPrompt,
  });
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(): boolean {
  return getUserProfile() !== null;
}

/**
 * Clear user profile (reset onboarding)
 */
export function clearUserProfile(): void {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    console.error("Failed to clear user profile:", error);
  }
}

/**
 * Get personalization prompt for AI
 */
export function getPersonalizationPrompt(): string | null {
  const profile = getUserProfile();
  const prompt = profile?.personalizationPrompt;

  // Return null if empty string or whitespace only
  if (!prompt || !prompt.trim()) {
    return null;
  }

  return prompt.trim();
}

/**
 * Get user's display name
 */
export function getUserName(): string {
  const profile = getUserProfile();
  return profile?.name || "there";
}

/**
 * Get user's role
 */
export function getUserRole(): UserRole | null {
  const profile = getUserProfile();
  return profile?.role || null;
}
