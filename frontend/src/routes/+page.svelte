
<!-- src/routes/+page.svelte -->
<script>
// @ts-nocheck

    import { onMount } from 'svelte';
    import api from '$lib/api/client';
  import VideoGrid from '$lib/components/VideoGrid.svelte';

    let videos = [];
    let loading = true;
    let error = null;
    let filter = 'latest'; // 'latest', 'trending'

    async function loadVideos() {
        try {
            loading = true;
            error = null;
            const response = await api.get(`/videos?filter=${filter}`);
            videos = response.data;
        } catch (err) {
            console.error('Error loading videos:', err);
            error = 'Failed to load videos';
        } finally {
            loading = false;
        }
    }

    onMount(loadVideos);

    $: if (filter) {
        loadVideos();
    }
</script>

<div>
    <!-- Filter Tabs -->
    <div class="flex space-x-4 mb-6">
        <button
            class="px-4 py-2 rounded-full {filter === 'latest' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}"
            on:click={() => filter = 'latest'}
        >
            Latest
        </button>
        <button
            class="px-4 py-2 rounded-full {filter === 'trending' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}"
            on:click={() => filter = 'trending'}
        >
            Trending
        </button>
    </div>

    {#if loading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" ></div>
        </div>
    {:else if error}
        <div class="text-center text-red-600 py-8">
            {error}
        </div>
    {:else if videos.length === 0}
        <div class="text-center text-gray-600 py-8">
            No videos found
        </div>
    {:else}
        <VideoGrid {videos} />
    {/if}
</div>