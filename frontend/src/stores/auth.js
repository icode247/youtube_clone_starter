// src/lib/stores/auth.js
import { writable } from "svelte/store";

export const loading = writable(true);
export const user = writable(null);
export const permissions = writable({});

// In a real app, this would be handled by your auth provider (Auth0, etc.)
// @ts-ignore
export const login = (userData) => {
  user.set(userData);
};

export const logout = () => {
  user.set(null);
  permissions.set({});
};
