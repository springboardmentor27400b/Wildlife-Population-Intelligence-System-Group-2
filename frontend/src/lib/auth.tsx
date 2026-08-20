import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  login as loginApi,
  register as registerApi,
  getCurrentUser,
} from "@/services/authService";

import type { AuthUser, Role } from "./authTypes";

interface SignupData {
  full_name: string;
  username: string;
  email: string;
  password: string;
  role_id: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  signup: (
    data: SignupData
  ) => Promise<void>;

  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType | null>(null);

const USER_KEY = "wpis.user";
const TOKEN_KEY = "wpis.token";

/**
 * Backend role_id -> frontend Role
 *
 * Backend:
 * 1 = admin
 * 2 = researcher
 * 3 = forest
 * 4 = conservation
 */
function roleFromId(id: number): Role {
  switch (id) {
    case 1:
      return "admin";

    case 2:
      return "researcher";

    case 3:
      return "forest";

    case 4:
      return "conservation";

    default:
      throw new Error(
        `Unknown user role_id: ${id}`
      );
  }
}

/**
 * Convert backend user profile
 * into the frontend AuthUser object.
 */
function createAuthUser(profile: {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role_id: number;
  organization?: string | null;
}): AuthUser {
  return {
    id: profile.id,
    full_name: profile.full_name,
    username: profile.username,
    email: profile.email,
    role: roleFromId(profile.role_id),
    organization:
      profile.organization ?? undefined,
  };
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  /**
   * Save authenticated session.
   */
  const saveSession = (
    currentUser: AuthUser,
    token: string
  ) => {
    setUser(currentUser);

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(currentUser)
    );

    localStorage.setItem(
      TOKEN_KEY,
      token
    );
  };

  /**
   * LOGIN
   *
   * The role is intentionally NOT accepted
   * from the login page.
   *
   * The backend/database determines the
   * authenticated user's real role.
   */
  const login = async (
    email: string,
    password: string
  ) => {
    const result = await loginApi({
      email,
      password,
    });

    const token = result.access_token;

    if (!token) {
      throw new Error(
        "Authentication token was not returned by the server."
      );
    }

    /**
     * Ask backend for the authenticated user's
     * actual profile.
     */
    const profile =
      await getCurrentUser(token);

    /**
     * Build frontend user from backend role_id.
     */
    const currentUser =
      createAuthUser(profile);

    /**
     * Store authenticated session.
     */
    saveSession(
      currentUser,
      token
    );
  };

  /**
   * SIGNUP
   *
   * After registration, automatically login.
   */
  const signup = async (
    data: SignupData
  ) => {
    await registerApi({
      full_name: data.full_name,
      username: data.username,
      email: data.email,
      password: data.password,
      role_id: data.role_id,
    });

    await login(
      data.email,
      data.password
    );
  };

  /**
   * RESTORE SESSION
   *
   * When the application reloads:
   *
   * 1. Read JWT from localStorage.
   * 2. Ask backend for /auth/me.
   * 3. Get the real role from backend.
   * 4. Rebuild the AuthUser.
   *
   * We do NOT trust the role stored in localStorage.
   */
  useEffect(() => {
    async function restoreSession() {
      const token =
        localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile =
          await getCurrentUser(token);

        const currentUser =
          createAuthUser(profile);

        setUser(currentUser);

        /**
         * Keep localStorage synchronized
         * with the backend user.
         */
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(currentUser)
        );
      } catch (error) {
        console.error(
          "Failed to restore authentication session:",
          error
        );

        /**
         * Invalid/expired token.
         */
        localStorage.removeItem(
          TOKEN_KEY
        );

        localStorage.removeItem(
          USER_KEY
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  /**
   * LOGOUT
   */
  const logout = () => {
    localStorage.removeItem(
      TOKEN_KEY
    );

    localStorage.removeItem(
      USER_KEY
    );

    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Access authentication state.
 */
export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
