<!-- src/routes/video/[id]/+page.svelte -->

<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import api from "$lib/api/client";
  import { formatDistanceToNow } from "date-fns";
  // @ts-ignore
  import VideoPlayer from "$lib/components/VideoPlayer.svelte";
  // @ts-ignore
  import Comments from "$lib/components/Comments.svelte";
  import { user } from "../../../stores/auth";
  import { goto } from "$app/navigation";

  // @ts-ignore
  /**
   * @type {{ id: any; likes: number; videoUrl: any; title: any; userAvatar: any; userName: any; userId: any; subscribers: any; views: any; description: any; } | null}
   */
  let video = null;
  let loading = true;
  // @ts-ignore
  /**
   * @type {string | null}
   */
  let error = null;
  let isLiked = false;

  async function loadVideo() {
    try {
      loading = true;
      error = null;
      const response = await api.get(`/videos/${$page.params.id}`);
      video = response.data;
      // Check if user has liked the video
      if ($user) {
        // @ts-ignore
        const likeResponse = await api.get(`/videos/${video.id}/like`);
        isLiked = likeResponse.data.liked;
      }
    } catch (err) {
      console.error("Error loading video:", err);
      error = "Failed to load video";
    } finally {
      loading = false;
    }
  }

  async function handleLike() {
    if (!$user) {
      goto("/login");
      return;
    }

    try {
      // @ts-ignore
      await api.post(`/videos/${video.id}/like`);
      isLiked = !isLiked;
      // @ts-ignore
      video.likes = isLiked ? video.likes + 1 : video.likes - 1;
    } catch (err) {
      console.error("Error liking video:", err);
    }
  }

  onMount(loadVideo);
</script>

<div class="max-w-6xl mx-auto">
  {#if loading}
    <div class="flex justify-center items-center h-96">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"
      ></div>
    </div>
  {:else if error}
    <div class="text-center text-red-600 py-8">
      {error}
    </div>
  {:else if video}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Video Player and Info -->
      <div class="lg:col-span-2">
        <VideoPlayer videoUrl={video.videoUrl} />

        <div class="mt-4 space-y-4">
          <h1 class="text-2xl font-bold">
            {video.title}
          </h1>

          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <img
                src={video.userAvatar || "/avatar.png"}
                alt={video.userName}
                class="h-[40px] rounded-full"
              />
              <div>
                <a
                  href={`/channel/${video.userId}`}
                  class="font-medium hover:text-red-600"
                >
                  {video.userName}
                </a>
                <p class="text-sm text-gray-500">
                  {video.subscribers} subscribers
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <button
                on:click={handleLike}
                class="flex items-center space-x-1 {isLiked
                  ? 'text-red-600'
                  : 'text-gray-700'}"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill={isLiked ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                <span>{video.likes}</span>
              </button>

              <div class="text-gray-700">
                {video.views} views
              </div>
            </div>
          </div>

          <div class="border-t pt-4">
            <p class="whitespace-pre-wrap text-gray-700">
              {video.description}
            </p>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="mt-6">
          <Comments videoId={video.id} />
        </div>
      </div>

      <!-- Related Videos -->
      <div>
        <h2 class="text-lg font-semibold mb-4">Related Videos</h2>
        <!-- Add RelatedVideos component here -->
      </div>
    </div>
  {/if}
</div>
