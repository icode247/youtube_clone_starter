<!-- src/lib/components/channel/ChannelHeader.svelte -->
<script>
  import { createEventDispatcher } from "svelte";
  import api from "$lib/api/client";

  import ChannelSettings from "./ChannelSettings.svelte";
  import { user } from "../../../stores/auth";

  export let channel;
  export let isOwner;

  let showSettings = false;
  let isSubscribed = false;
  let subscriberCount = channel.subscribers;
  let loading = false;

  let uploadingBanner = false;
  let uploadingAvatar = false;
  let error = null;
  let editing = true;

  const dispatch = createEventDispatcher();

  async function handleBannerUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      uploadingBanner = true;
      const formData = new FormData();
      formData.append("bannerFile", file);

      await api.put(`/channels/${channel.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch("update");
    } catch (err) {
      console.error("Error uploading banner:", err);
      error = "Failed to upload banner";
    } finally {
      uploadingBanner = false;
    }
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      uploadingAvatar = true;
      const formData = new FormData();
      formData.append("avatarFile", file);

      await api.put(`/channels/${channel.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch("update");
    } catch (err) {
      console.error("Error uploading avatar:", err);
      error = "Failed to upload avatar";
    } finally {
      uploadingAvatar = false;
    }
  }

  async function checkSubscriptionStatus() {
    if ($user) {
      try {
        const response = await api.get(`/channels/${channel.id}/subscription`);
        isSubscribed = response.data.isSubscribed;
      } catch (err) {
        console.error("Error checking subscription:", err);
      }
    }
  }

  async function handleSubscribe() {
    if (!$user) {
      window.location.href = "/login";
      return;
    }

    try {
      loading = true;
      if (isSubscribed) {
        await api.delete(`/channels/${channel.id}/subscription`);
        subscriberCount--;
      } else {
        await api.post(`/channels/${channel.id}/subscription`);
        subscriberCount++;
      }
      isSubscribed = !isSubscribed;
    } catch (err) {
      console.error("Error updating subscription:", err);
    } finally {
      loading = false;
    }
  }

  $: {
    if ($user) {
      checkSubscriptionStatus();
    }
  }
</script>

<div class="relative">
  <!-- Banner -->
  <div class="h-48 sm:h-64 w-full bg-gray-200 relative">
    {#if channel.bannerUrl}
      <img
        src={channel.bannerUrl}
        alt="Channel Banner"
        class="w-full h-full object-cover"
      />
    {/if}
    {#if isOwner}
      <div
        class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
      >
        <label
          class="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg"
        >
          {uploadingBanner ? "Uploading..." : "Change Banner"}
          <input
            type="file"
            accept="image/*"
            class="hidden"
            on:change={handleBannerUpload}
            disabled={uploadingBanner}
          />
        </label>
      </div>
    {/if}
  </div>

  <!-- Channel Info -->
  <div class="max-w-6xl mx-auto px-4">
    <div
      class="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 relative z-10"
    >
      <!-- Avatar -->
      <div class="relative">
        <img
          src={channel.avatarUrl || "/avatar.png"}
          alt={channel.name}
          class="h-32 rounded-full border-4 border-white bg-white"
        />
        {#if isOwner}
          <div
            class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          >
            <label class="cursor-pointer text-white">
              {uploadingAvatar ? "Uploading..." : "Change"}
              <input
                type="file"
                accept="image/*"
                class="hidden"
                on:change={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </label>
          </div>
        {/if}
      </div>

      <!-- Channel Info -->
      <div class="mt-4 sm:mt-0 sm:ml-6 flex-1">
        <h1 class="text-3xl font-bold">
          {channel.name}
        </h1>
        <div class="text-gray-600 mt-1">
          {channel.subscribers} subscribers
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-4 sm:mt-0">
        {#if isOwner}
          <a
            href="/upload"
            class=" px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            Upload Video
          </a>
          <button
            on:click={() => (showSettings = true)}
            class=" text-gray-700 hover:text-red-600 px-6 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            Customize Channel
          </button>
        {:else}
          <button
            on:click={handleSubscribe}
            disabled={loading}
            class="px-6 py-2 {isSubscribed
              ? 'bg-gray-100 text-gray-700'
              : 'bg-red-600 text-white'} rounded-full hover:opacity-90"
          >
            {loading ? "Loading..." : isSubscribed ? "Subscribed" : "Subscribe"}
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>

{#if error}
  <div class="text-red-600 text-center mt-4">
    {error}
  </div>
{/if}

<ChannelSettings
  {channel}
  show={showSettings}
  on:close={() => (showSettings = false)}
  on:update={() => dispatch("update")}
/>
