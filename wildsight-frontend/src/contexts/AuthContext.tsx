import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  TOKEN_KEY,
  USER_KEY,
  authService,
} from "@/services/api";


// ============================================================
// ROLES
// ============================================================

export type Role =
  | "ADMIN"
  | "RESEARCHER"
  | "FOREST_OFFICER"
  | "VOLUNTEER";


// ============================================================
// APP USER
// ============================================================

export interface AppUser {

  id?: number | string;

  email: string;

  fullName?: string;

  role: Role;

  organization?: string;

  designation?: string;

  phone?: string;

  avatar?: string;
}


// ============================================================
// AUTH CONTEXT TYPE
// ============================================================

interface AuthContextValue {

  user: AppUser | null;

  token: string | null;

  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<AppUser>;

  register: (
    payload: Record<string, any>
  ) => Promise<void>;

  logout: () => void;

  updateUser: (
    patch: Partial<AppUser>
  ) => void;
}


// ============================================================
// CREATE CONTEXT
// ============================================================

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );


// ============================================================
// AUTH PROVIDER
// ============================================================

export function AuthProvider(
  {
    children,
  }: {
    children: ReactNode;
  }
) {

  const [user, setUser] =
    useState<AppUser | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);


  // ==========================================================
  // RESTORE USER WHEN APPLICATION STARTS
  // ==========================================================

  useEffect(() => {

    const storedToken =
      localStorage.getItem(TOKEN_KEY);

    const storedUser =
      localStorage.getItem(USER_KEY);


    if (storedToken) {

      setToken(storedToken);

    }


    if (storedUser) {

      try {

        const parsedUser =
          JSON.parse(storedUser);

        setUser(parsedUser);

      } catch (error) {

        console.error(
          "Failed to restore logged-in user:",
          error
        );

        localStorage.removeItem(USER_KEY);

      }

    }


    setLoading(false);

  }, []);


  // ==========================================================
  // SAVE LOGIN DATA
  // ==========================================================

  const persist = (
    tokenValue: string,
    userValue: AppUser
  ) => {

    localStorage.setItem(
      TOKEN_KEY,
      tokenValue
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(userValue)
    );


    setToken(tokenValue);

    setUser(userValue);

  };


  // ==========================================================
  // LOGIN
  // ==========================================================

  const login:
    AuthContextValue["login"] =
    async (
      email,
      password
    ) => {


      /*
       * We use `any` here because your current
       * authService.login() response type does not
       * contain all the fields returned by your
       * Spring Boot backend.
       */
      const data: any =
        await authService.login(
          email,
          password
        );


      console.log(
        "LOGIN RESPONSE:",
        data
      );


      // ======================================================
      // BACKEND USER OBJECT
      // ======================================================

      const backendUser: any =
        data?.user ?? data;


      console.log(
        "BACKEND USER:",
        backendUser
      );


      // ======================================================
      // USER ID
      // ======================================================

      const userId =
        backendUser?.userId ??
        backendUser?.id ??
        backendUser?.user_id ??
        data?.userId ??
        data?.id ??
        data?.user_id;


      console.log(
        "DETECTED USER ID:",
        userId
      );


      // ======================================================
      // ROLE
      // ======================================================

      const roleValue =
        backendUser?.role ??
        data?.role ??
        "VOLUNTEER";


      const role =
        String(roleValue)
          .toUpperCase() as Role;


      // ======================================================
      // CREATE APPLICATION USER
      // ======================================================

      const appUser: AppUser = {

        id: userId,


        email:
          backendUser?.email ??
          data?.email ??
          email,


        fullName:
          backendUser?.fullName ??
          backendUser?.full_name ??
          data?.fullName ??
          data?.full_name ??
          email.split("@")[0],


        role,


        organization:
          backendUser?.organization ??
          data?.organization,


        designation:
          backendUser?.designation ??
          data?.designation,


        phone:
          backendUser?.phone ??
          data?.phone,


        avatar:
          backendUser?.avatar ??
          data?.avatar,

      };


      console.log(
        "FINAL APP USER:",
        appUser
      );


      // ======================================================
      // SAVE TOKEN + USER
      // ======================================================

      const tokenValue =
        data?.token;


      if (!tokenValue) {

        throw new Error(
          "Login successful but JWT token was not returned by the server."
        );

      }


      persist(
        tokenValue,
        appUser
      );


      return appUser;

    };


  // ==========================================================
  // REGISTER
  // ==========================================================

  const register:
    AuthContextValue["register"] =
    async (
      payload
    ) => {

      await authService.register(
        payload
      );

    };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {

    localStorage.removeItem(
      TOKEN_KEY
    );

    localStorage.removeItem(
      USER_KEY
    );


    setUser(null);

    setToken(null);


    window.location.href =
      "/login";

  };


  // ==========================================================
  // UPDATE USER
  // ==========================================================

  const updateUser:
    AuthContextValue["updateUser"] =
    (patch) => {

      setUser(
        (previousUser) => {

          if (!previousUser) {

            return previousUser;

          }


          const updatedUser: AppUser = {

            ...previousUser,

            ...patch,

          };


          localStorage.setItem(
            USER_KEY,
            JSON.stringify(
              updatedUser
            )
          );


          return updatedUser;

        }
      );

    };


  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (

    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


// ============================================================
// USE AUTH
// ============================================================

export function useAuth() {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth must be used within AuthProvider"
    );

  }


  return context;

}