// src/stores/channel.js
import { writable } from "svelte/store";
import api from "$lib/api/client";

function createChannelStore() {
  const { subscribe, set, update } = writable({
    channel: null,
    loading: false,
    error: null,
  });

  return {
    subscribe,
    loadChannel: async (channelId) => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const response = await api.get(`/channels/${channelId}`);
        update((state) => ({
          ...state,
          channel: response.data,
          loading: false,
        }));
        return response.data;
      } catch (err) {
        console.error("Error loading channel:", err);
        update((state) => ({
          ...state,
          error: "Failed to load channel",
          loading: false,
        }));
        return null;
      }
    },
    reset: () => {
      set({ channel: null, loading: false, error: null });
    },
  };
}

export const channelStore = createChannelStore();
