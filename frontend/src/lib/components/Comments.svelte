<!-- src/lib/components/Comments.svelte -->
<script>
  // @ts-ignore
  import { onMount } from "svelte";

  import api from "$lib/api/client";
  import { formatDistanceToNow } from "date-fns";
  import { user } from "../../stores/auth";

  // @ts-ignore
  export let videoId;

  // @ts-ignore
  /**
   * @type {any[]}
   */
  let comments = [];
  let newComment = "";
  let loading = false;
  // @ts-ignore
  /**
   * @type {string | null}
   */
  let error = null;

  async function loadComments() {
    try {
      loading = true;
      error = null;
      // @ts-ignore
      const response = await api.get(`/videos/${videoId}/comments`);
      comments = response.data;
    } catch (err) {
      console.error("Error loading comments:", err);
      error = "Failed to load comments";
    } finally {
      loading = false;
    }
  }

  async function addComment() {
    if (!$user) {
      // @ts-ignore
      goto("/login");
      return;
    }

    try {
      // @ts-ignore
      const response = await api.post(`/videos/${videoId}/comments`, {
        content: newComment,
      });
      // @ts-ignore
      comments = [response.data, ...comments];
      newComment = "";
    } catch (err) {
      console.error("Error adding comment:", err);
      error = "Failed to add comment";
    }
  }

  // @ts-ignore
  async function deleteComment(commentId) {
    try {
      // @ts-ignore
      await api.delete(`/videos/${videoId}/comments/${commentId}`);
      // @ts-ignore
      comments = comments.filter((c) => c.id !== commentId);
    } catch (err) {
      console.error("Error deleting comment:", err);
      error = "Failed to delete comment";
    }
  }

  // @ts-ignore
  onMount(loadComments);
</script>

<div class="space-y-6">
  <h2 class="text-lg font-semibold">
    {comments.length} Comments
  </h2>

  {#if $user}
    <div class="flex space-x-4">
      <img
        src={$user.photoURL || "/avatar.png"}
        alt={$user.displayName}
        class="h-[40px] rounded-full"
      />
      <div class="flex-1">
        <textarea
          bind:value={newComment}
          placeholder="Add a comment..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          rows="2"
        ></textarea>
        {#if newComment}
          <div class="flex justify-end mt-2 space-x-2">
            <button
              on:click={() => (newComment = "")}
              class="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              on:click={addComment}
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Comment
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if loading}
    <div class="text-center py-4">Loading comments...</div>
  {:else if error}
    <div class="text-center text-red-600 py-4">
      {error}
    </div>
  {:else}
    <div class="space-y-4">
      {#each comments as comment (comment.id)}
        <div class="flex space-x-4">
          <img
            src={comment.userAvatar || "/default-avatar.png"}
            alt={comment.userName}
            class="h-10 w-10 rounded-full"
          />
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <span class="font-medium">
                {comment.userName}
              </span>
              <span class="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p class="mt-1 text-gray-700">
              {comment.content}
            </p>
            {#if $user && comment.userId === $user.uid}
              <button
                on:click={() => deleteComment(comment.id)}
                class="text-sm text-gray-500 hover:text-red-600 mt-1"
              >
                Delete
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
