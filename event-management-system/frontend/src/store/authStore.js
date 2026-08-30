import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Authentication management store built with Zustand.
 * Handles user token storage, operational roles (Student/Mentor/Admin),
 * and session state synchronization across app tabs.
 */
const useAuthStore = create(
  persist(
    (set) => ({
      // --- Core Authentication State States ---
      user: null,
      isAuthenticated: false,

      // --- Core Operational Actions ---
      
      /**
       * Pushes an active user structural payload session into global state layers.
       * @param {Object} userData - Target authenticated student or mentor profile dataset.
       */
      login: (userData) =>
        set({
          user: userData,
          isAuthenticated: true,
        }),

      /**
       * Flushes all active user credentials and returns system back to unauthenticated fallback.
       */
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      /**
       * Mutates profile metadata variables directly without tearing down existing structural frames.
       * Useful when changing user avatars, team metadata references, or notification configurations.
       * @param {Object} updatedFields - Specific property metrics keys to modify.
       */
      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),
    }),
    {
      name: "ksrce-portal-auth-storage", // Client storage item cache hook identifier key lookup
      storage: createJSONStorage(() => sessionStorage), // Safe partition block to drop session cache limits on window exit
    }
  )
);

export default useAuthStore;