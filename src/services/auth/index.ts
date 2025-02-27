import { User as FirebaseAuthUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile, getUserProfile } from '../firestore/users';

export type AuthUser = FirebaseAuthUser;

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getCurrentUser(): AuthUser | null {
    return auth.currentUser;
  }

  public async handleUserAuthentication(user: AuthUser) {
    if (!user) return null;

    // Check if user profile exists, if not create one
    const userProfile = await getUserProfile(user.uid);
    if (!userProfile) {
      await createUserProfile(user);
    }

    return user;
  }

  public onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    return auth.onAuthStateChanged(callback);
  }
}

// Export a singleton instance
export const authService = AuthService.getInstance();
export default authService;
