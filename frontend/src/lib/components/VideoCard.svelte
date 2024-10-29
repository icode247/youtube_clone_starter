<!-- src/lib/components/VideoCard.svelte -->
<script>
  import { formatDistanceToNow } from "date-fns";
  import avatar from "../../../static/avatar.png";
  export let video;

  // @ts-ignore
  function formatViews(views) {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  }
</script>

<a href="/video/{video.id}" class="block group">
  <div class="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
    <img
      src={video.thumbnailUrl}
      alt={video.title}
      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
    />
    <div
      class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded"
    >
      {video.duration}
    </div>
  </div>

  <div class="mt-2">
    <div class="flex">
      <div class="flex-shrink-0">
        <img
          src={video.userAvatar || "/avatar.png"}
          alt={video.userName}
          class="h-[40px] rounded-full"
        />
      </div>
      <div class="ml-2 flex-1 min-w-0">
        <h3
          class="text-sm font-medium text-gray-900 truncate group-hover:text-red-600"
        >
          {video.title}
        </h3>
        <p class="text-xs text-gray-500">
          {video.userName}
        </p>
        <p class="text-xs text-gray-500">
          {formatViews(video.views)} •
          {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  </div>
</a>
