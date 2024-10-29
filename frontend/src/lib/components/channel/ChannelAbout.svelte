<!-- src/lib/components/channel/ChannelAbout.svelte -->
<script>
    import { formatDistanceToNow } from 'date-fns';

    export let channel;
</script>

<div class="max-w-2xl space-y-6">
    <div>
        <h3 class="text-lg font-semibold">Description</h3>
        <p class="mt-2 whitespace-pre-wrap text-gray-700">
            {channel.description || 'No description available.'}
        </p>
    </div>

    <div>
        <h3 class="text-lg font-semibold">Stats</h3>
        <div class="mt-2 grid grid-cols-2 gap-4">
            <div>
                <div class="text-2xl font-bold">
                    {channel.subscribers}
                </div>
                <div class="text-gray-600">Subscribers</div>
            </div>
            <div>
                <div class="text-2xl font-bold">
                    {channel.totalViews}
                </div>
                <div class="text-gray-600">Total Views</div>
            </div>

            <div>
                <div class="text-2xl font-bold">
                    {channel.totalVideos || 0}
                </div>
                <div class="text-gray-600">Total Videos</div>
            </div>
            <div>
                <div class="text-2xl font-bold">
                    {channel.totalComments || 0}
                </div>
                <div class="text-gray-600">Total Comments</div>
            </div>
        </div>
    </div>

    <div>
        <h3 class="text-lg font-semibold">Details</h3>
        <div class="mt-2 text-gray-700">
            <div>
                Joined {formatDistanceToNow(new Date(channel.createdAt), { addSuffix: true })}
            </div>
            {#if channel.location}
                <div class="mt-1">
                    Location: {channel.location}
                </div>
            {/if}
        </div>
    </div>
</div>