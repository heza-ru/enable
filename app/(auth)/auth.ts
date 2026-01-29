// Stub auth module - Enable doesn't use authentication
// All data is client-side only

export type Session = {
  user:
    | {
        id: string;
        email: string;
      }
    | undefined;
} | null;

export async function auth(): Promise<Session> {
  // Return null to indicate no authentication
  // Routes will handle this appropriately
  return null;
}

export async function signIn() {
  // No-op: Enable doesn't have authentication
  return null;
}

export async function signOut() {
  // No-op: Enable doesn't have authentication
  return null;
}
