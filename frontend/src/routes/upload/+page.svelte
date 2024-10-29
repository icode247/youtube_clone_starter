<!-- src/routes/upload/+page.svelte -->
<script>
// @ts-nocheck

    import api from "$lib/api/client";
    import { goto } from "$app/navigation";
    import VideoUpload from "$lib/components/shared/VideoUpload.svelte";
    import ImageUpload from "$lib/components/shared/ImageUpload.svelte";

    let title = "";
    let description = "";
    let visibility = "public";
    let videoFile = null;
    let thumbnailFile = null;
    let uploadProgress = 0;
    let loading = false;
    let error = null;

    async function handleSubmit() {
        try {
            if (!videoFile) {
                error = "Please select a video file";
                return;
            }

            loading = true;
            error = null;

            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("visibility", visibility);
            formData.append("videoFile", videoFile);
            
            if (thumbnailFile) {
                formData.append("thumbnailFile", thumbnailFile);
            }

            const response = await api.post("/videos", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    uploadProgress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                },
            });

            goto(`/video/${response.data.id}`);
        } catch (err) {
            console.error("Upload error:", err);
            error = "Failed to upload video";
        } finally {
            loading = false;
        }
    }
</script>

<div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Upload Video</h1>

    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <!-- Video Upload -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
                Video File *
            </label>
            <VideoUpload
                on:file={(e) => {
                    videoFile = e.detail;
                    error = null;
                }}
                on:error={(e) => error = e.detail}
            />
        </div>

        <!-- Thumbnail Upload -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail
            </label>
            <div>
                <ImageUpload
                    aspectRatio={16/9}
                    on:file={(e) => {
                        thumbnailFile = e.detail;
                        error = null;
                    }}
                    on:error={(e) => error = e.detail}
                />
            </div>
        </div>

        <!-- Title -->
        <div>
            <label class="block text-sm font-medium text-gray-700">
                Title *
            </label>
            <input
                type="text"
                bind:value={title}
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
        </div>

        <!-- Description -->
        <div>
            <label class="block text-sm font-medium text-gray-700">
                Description
            </label>
            <textarea
                bind:value={description}
                rows="4"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
        </div>

        <!-- Visibility -->
        <div>
            <label class="block text-sm font-medium text-gray-700">
                Visibility
            </label>
            <select
                bind:value={visibility}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
            </select>
        </div>

        {#if error}
            <div class="text-red-600 text-sm">
                {error}
            </div>
        {/if}

        {#if uploadProgress > 0 && uploadProgress < 100}
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                    class="bg-red-600 h-2 rounded-full"
                    style="width: {uploadProgress}%"
                />
            </div>
        {/if}

        <button
            type="submit"
            disabled={loading}
            class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
            {loading ? "Uploading..." : "Upload Video"}
        </button>
    </form>
</div>