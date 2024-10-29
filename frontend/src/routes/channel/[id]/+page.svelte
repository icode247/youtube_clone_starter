<!-- src/routes/channel/[id]/+page.svelte -->
<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import api from "$lib/api/client";
    import VideoGrid from "$lib/components/VideoGrid.svelte";
    import { user } from "../../../stores/auth";
    import { channelStore } from "../../../stores/channel";
    // @ts-ignore
    import ChannelHeader from "$lib/components/channel/ChannelHeader.svelte";
    // @ts-ignore
    import ChannelTabs from "$lib/components/channel/ChannelTabs.svelte";
    // @ts-ignore
    import ChannelAbout from "$lib/components/channel/ChannelAbout.svelte";
  
    // @ts-ignore
    let videos = [];
    let loading = true;
    // @ts-ignore
    let error = null;
    let activeTab = "videos";
    let isOwner = false;
  
    async function loadChannel() {
      try {
        loading = true;
        error = null;
  
        // Load channel data using the store
        const channel = await channelStore.loadChannel($page.params.id);
        if (!channel) {
          error = "Channel not found";
          return;
        }
  
        // Load channel videos
        const videosResponse = await api.get(
          `/channels/${$page.params.id}/videos`
        );
        videos = videosResponse.data;
  
        // Check if current user is channel owner
        // @ts-ignore
        isOwner = $user && $user.uid === channel.id;
      } catch (err) {
        console.error("Error loading channel:", err);
        error = "Failed to load channel";
      } finally {
        loading = false;
      }
    }
  
    onMount(loadChannel);
  </script>
  
  <div>
    {#if loading}
      <div class="flex justify-center items-center h-96">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    {:else if error}
      <div class="text-center text-red-600 py-8">
        {error}
      </div>
    {:else if $channelStore.channel}
      <ChannelHeader 
        channel={$channelStore.channel} 
        {isOwner} 
        on:update={loadChannel} 
      />
  
      <div class="max-w-6xl mx-auto px-4 py-6">
        <ChannelTabs bind:activeTab videosCount={videos.length} />
  
        {#if activeTab === "videos"}
          <VideoGrid {videos} />
        {:else if activeTab === "about"}
          <ChannelAbout channel={$channelStore.channel} />
        {/if}
      </div>
    {/if}
  </div>