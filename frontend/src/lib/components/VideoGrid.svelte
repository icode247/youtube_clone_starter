<!-- src/lib/components/VideoGrid.svelte -->
<script>
  // @ts-ignore
  import { formatDistanceToNow } from "date-fns";
  // @ts-ignore
  import VideoCard from "./VideoCard.svelte";

  /**
   * @type {any[]}
   */
   export let videos = [];
</script>

<div
  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
>
  {#each videos as video (video.id)}
    <VideoCard {video} />
  {/each}
</div>
