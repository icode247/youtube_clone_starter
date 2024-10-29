<!-- src/lib/components/channel/ChannelForm.svelte -->
<script>
  import { createEventDispatcher } from "svelte";
  import ImageUpload from "../shared/ImageUpload.svelte";

  export let data = {
    name: "",
    description: "",
    avatarUrl: "",
    bannerUrl: "",
  };
  export let loading = false;
  export let error = null;
  export let submitLabel = "Save";

  let avatarFile = null;
  let bannerFile = null;

  const dispatch = createEventDispatcher();

  function handleSubmit() {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);

    if (avatarFile) {
      formData.append("avatarFile", avatarFile);
    }

    if (bannerFile) {
      formData.append("bannerFile", bannerFile);
    }

    dispatch("submit", formData);
  }

  function handleCancel() {
    dispatch("cancel");
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  <!-- Banner Upload -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Banner Image
    </label>
    <ImageUpload
      currentImage={data.bannerUrl}
      aspectRatio={16 / 4}
      on:file={(e) => (bannerFile = e.detail)}
    />
  </div>

  <!-- Avatar Upload -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Channel Avatar
    </label>
    <ImageUpload
      currentImage={data.avatarUrl}
      aspectRatio={1}
      circular={true}
      on:file={(e) => (avatarFile = e.detail)}
    />
  </div>

  <!-- Name -->
  <div>
    <label class="block text-sm font-medium text-gray-700">
      Channel Name *
    </label>
    <input
      type="text"
      bind:value={data.name}
      required
      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
    />
  </div>

  <!-- Description -->
  <div>
    <label class="block text-sm font-medium text-gray-700"> Description </label>
    <textarea
      bind:value={data.description}
      rows="4"
      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
    ></textarea>
  </div>

  {#if error}
    <div class="text-red-600 text-sm">
      {error}
    </div>
  {/if}

  <!-- Buttons -->
  <div class="flex justify-end space-x-3">
    <button
      type="button"
      on:click={handleCancel}
      class="px-4 py-2 text-gray-700"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={loading}
      class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
    >
      {loading ? "Loading..." : submitLabel}
    </button>
  </div>
</form>
