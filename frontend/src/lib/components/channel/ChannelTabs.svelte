<!-- src/lib/components/channel/ChannelTabs.svelte -->
<script>
    export let activeTab;
    export let videosCount;

    const tabs = [
        { id: 'videos', label: 'Videos', count: videosCount },
        { id: 'about', label: 'About' }
    ];
</script>

<div class="border-b mb-6">
    <div class="flex space-x-8">
        {#each tabs as tab}
            <button
                class="px-4 py-4 border-b-2 {activeTab === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600'}"
                on:click={() => activeTab = tab.id}
            >
                {tab.label}
                {#if tab.count !== undefined}
                    <span class="ml-2">{tab.count}</span>
                {/if}
            </button>
        {/each}
    </div>
</div>