<!-- src/lib/components/shared/VideoUpload.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';

    export let currentVideo = null;
    
    let previewUrl = '';
    let inputElement;
    let isDragging = false;
    const dispatch = createEventDispatcher();

    function handleFileSelect(event) {
        const file = event.target.files?.[0];
        handleFile(file);
    }

    function handleFile(file) {
        if (file && file.type.startsWith('video/')) {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            previewUrl = URL.createObjectURL(file);
            dispatch('file', file);
        } else {
            dispatch('error', 'Please select a valid video file');
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        isDragging = false;
        const file = event.dataTransfer.files[0];
        handleFile(file);
    }

    function handleDragOver(event) {
        event.preventDefault();
        isDragging = true;
    }

    function handleDragLeave() {
        isDragging = false;
    }
</script>

<div
    class="relative border-2 {isDragging ? 'border-red-500' : 'border-dashed border-gray-300'} rounded-lg overflow-hidden hover:border-red-500 transition-colors"
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
>
    <div class="aspect-video">
        {#if previewUrl}
            <video
                src={previewUrl}
                class="w-full h-full object-cover"
                controls
            />
        {:else}
            <div class="w-full h-full flex items-center justify-center bg-gray-50">
                <div class="text-center px-6 py-4">
                    <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    <p class="mt-1 text-sm text-gray-500">
                        Drag and drop your video here, or click to select
                    </p>
                </div>
            </div>
        {/if}
    </div>

    <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
        <button
            type="button"
            on:click={() => inputElement.click()}
            class="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100"
        >
            {previewUrl ? 'Change Video' : 'Select Video'}
        </button>
    </div>
</div>

<input
    bind:this={inputElement}
    type="file"
    accept="video/*"
    on:change={handleFileSelect}
    class="hidden"
/>