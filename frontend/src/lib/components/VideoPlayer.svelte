<!-- src/lib/components/VideoPlayer.svelte -->
<script>
  // @ts-nocheck

  export let videoUrl;

  // @ts-ignore
  let player;
  let currentTime = 0;
  let duration = 0;
  let isPlaying = false;
  let volume = 1;

  function handleTimeUpdate() {
    // @ts-ignore
    currentTime = player.currentTime;
  }

  function handleLoadedMetadata() {
    // @ts-ignore
    duration = player.duration;
  }

  function togglePlay() {
    if (isPlaying) {
      // @ts-ignore
      player.pause();
    } else {
      // @ts-ignore
      player.play();
    }
    isPlaying = !isPlaying;
  }

  // @ts-ignore
  function handleVolumeChange(event) {
    volume = event.target.value;
    // @ts-ignore
    player.volume = volume;
  }

  // @ts-ignore
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
</script>

<div class="relative">
  <!-- svelte-ignore a11y_media_has_caption -->
  <video
    bind:this={player}
    {videoUrl}
    class="w-full aspect-video bg-black"
    on:timeupdate={handleTimeUpdate}
    on:loadedmetadata={handleLoadedMetadata}
  >
    <source src={videoUrl} type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  <!-- Custom Controls -->
  <div
    class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4"
  >
    <!-- Progress Bar -->
    <div class="w-full h-1 bg-gray-200 rounded cursor-pointer">
      <!-- svelte-ignore element_invalid_self_closing_tag -->
      <div
        class="h-full bg-red-600 rounded"
        style="width: {(currentTime / duration) * 100}%"
      />
    </div>

    <div class="flex items-center justify-between mt-2 text-white">
      <!-- Play/Pause -->
      <button on:click={togglePlay}>
        {#if isPlaying}
          ⏸️
        {:else}
          ▶️
        {/if}
      </button>

      <!-- Time -->
      <div class="text-sm">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <!-- Volume -->
      <div class="flex items-center">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          bind:value={volume}
          on:input={handleVolumeChange}
          class="w-20"
        />
      </div>
    </div>
  </div>
</div>
