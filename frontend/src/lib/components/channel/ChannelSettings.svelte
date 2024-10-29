<!-- src/lib/components/channel/ChannelSettings.svelte -->
<script>
  import { createEventDispatcher } from "svelte";
  import api from "$lib/api/client";
  import ChannelForm from "./ChannelForm.svelte";

  export let channel;
  export let show = false;

  let loading = false;
  let error = null;

  const dispatch = createEventDispatcher();

  async function handleSubmit(event) {
    try {
      loading = true;
      error = null;

      const formData = event.detail;
      await api.put(`/channels/${channel.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch("update");
      show = false;
    } catch (err) {
      console.error("Error updating channel:", err);
      error = "Failed to update channel";
    } finally {
      loading = false;
    }
  }

  function handleClose() {
    show = false;
  }
</script>

{#if show}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col"
    >
      <h2 class="text-xl font-bold mb-4 p-6">Channel Settings</h2>
      <div class="flex-1 overflow-y-auto p-6">
        <ChannelForm
          data={{
            name: channel.name,
            description: channel.description,
            avatarUrl: channel.avatarUrl,
            bannerUrl: channel.bannerUrl,
          }}
          {loading}
          {error}
          submitLabel="Save Changes"
          on:submit={handleSubmit}
          on:cancel={handleClose}
        />
      </div>
    </div>
  </div>
{/if}
