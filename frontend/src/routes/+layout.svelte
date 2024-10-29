<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from "svelte";
  import { auth } from "$lib/firebase/client";
  import "../app.css";
  import { loading, user } from "../stores/auth";
  import { channelStore } from "../stores/channel";
  // @ts-ignore
  import ChannelCreateModal from "$lib/components/channel/ChannelCreateModal.svelte";
  import { goto } from "$app/navigation";

  let showCreateChannel = false;
  let hasChannel = false;

  onMount(() => {
    return auth.onAuthStateChanged(async (userData) => {
      // @ts-ignore
      user.set(userData);
      if (userData) {
        // Try to load user's channel
        const channel = await channelStore.loadChannel(userData.uid);
        hasChannel = !!channel;
      }
      loading.set(false);
    });
  });
</script>

<div class="min-h-screen bg-gray-50">
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <a href="/" class="text-xl font-bold text-red-600"> YourTube </a>
        </div>

        <!-- Search Bar -->
        <div class="flex-1 max-w-2xl mx-4 my-3">
          <div class="relative">
            <input
              type="text"
              placeholder="Search"
              class="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-red-500"
            />
            <button class="absolute right-3 top-2"> 🔍 </button>
          </div>
        </div>

        <!-- Navigation Items -->
        <div class="flex items-center space-x-4">
          {#if $user}
            {#if !hasChannel}
              <button
                on:click={() => (showCreateChannel = true)}
                class="text-gray-700 hover:text-red-600"
              >
                Create Channel
              </button>
            {:else}
              <a
                href="/channel/{$user.uid}"
                class="text-gray-700 hover:text-red-600"
              >
                My Channel
              </a>
            {/if}

            <button
              on:click={() => {
                auth.signOut();
                goto("/login");
              }}
              class="text-gray-700 hover:text-red-600"
            >
              Sign Out
            </button>
          {:else}
            <a href="/login" class="text-gray-700 hover:text-red-600">
              Sign In
            </a>
          {/if}
        </div>
      </div>
    </div>
  </nav>

  <main class="max-w-7xl mx-auto px-4 py-6">
    {#if $loading}
      <div class="flex justify-center items-center h-32">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"
        ></div>
      </div>
    {:else}
      <slot />
    {/if}
  </main>

  <ChannelCreateModal
    show={showCreateChannel}
    on:close={() => (showCreateChannel = false)}
    on:channelCreated={() => {
      hasChannel = true;
      showCreateChannel = false;
    }}
  />
</div>
