<!-- src/lib/components/channel/ChannelAnalytics.svelte -->
<script>
    import { onMount } from 'svelte';
    import api from '$lib/api/client';

    export let channelId;

    let analytics = null;
    let loading = true;
    let error = null;
    let timeRange = '7d'; // '7d', '30d', '90d'

    async function loadAnalytics() {
        try {
            loading = true;
            error = null;
            const response = await api.get(`/channels/${channelId}/analytics?timeRange=${timeRange}`);
            analytics = response.data;
        } catch (err) {
            console.error('Error loading analytics:', err);
            error = 'Failed to load analytics';
        } finally {
            loading = false;
        }
    }

    $: if (timeRange) {
        loadAnalytics();
    }
</script>

<div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Channel Analytics</h2>
        <select
            bind:value={timeRange}
            class="px-3 py-2 border rounded-md"
        >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
        </select>
    </div>

    {#if loading}
        <div class="flex justify-center items-center h-48">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
    {:else if error}
        <div class="text-red-600 text-center py-4">
            {error}
        </div>
    {:else if analytics}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">Views</div>
                <div class="text-2xl font-bold mt-1">{analytics.views}</div>
                <div class="text-sm text-gray-500 mt-1">
                    {analytics.viewsChange > 0 ? '+' : ''}{analytics.viewsChange}% vs previous
                </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">Watch Time (hours)</div>
                <div class="text-2xl font-bold mt-1">{analytics.watchTimeHours}</div>
                <div class="text-sm text-gray-500 mt-1">
                    {analytics.watchTimeChange > 0 ? '+' : ''}{analytics.watchTimeChange}% vs previous
                </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">Subscribers</div>
                <div class="text-2xl font-bold mt-1">{analytics.subscribers}</div>
                <div class="text-sm text-gray-500 mt-1">
                    {analytics.subscribersChange > 0 ? '+' : ''}{analytics.subscribersChange} vs previous
                </div>
            </div>
        </div>

        <!-- Top Videos -->
        <div class="mt-8">
            <h3 class="text-lg font-semibold mb-4">Top Videos</h3>
            <div class="space-y-4">
                {#each analytics.topVideos as video}
                    <div class="flex items-center space-x-4">
                        <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            class="w-24 h-16 object-cover rounded"
                        />
                        <div class="flex-1">
                            <a 
                                href="/video/{video.id}"
                                class="font-medium hover:text-red-600"
                            >
                                {video.title}
                            </a>
                            <div class="text-sm text-gray-600">
                                {video.views} views • {video.watchTimeHours} hours
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>