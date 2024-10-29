<!-- src/lib/components/shared/ImageUpload.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';

    export let currentImage = '';
    export let aspectRatio = 1;
    export let circular = false;

    let previewUrl = currentImage;
    let inputElement;
    const dispatch = createEventDispatcher();

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            previewUrl = URL.createObjectURL(file);
            dispatch('file', file);
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            previewUrl = URL.createObjectURL(file);
            dispatch('file', file);
        }
    }

    $: containerStyle = `padding-top: ${(1 / aspectRatio) * 100}%`;
</script>

<div
    class="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-red-500 transition-colors"
    style={containerStyle}
    on:dragover|preventDefault
    on:drop|preventDefault={handleDrop}
>
    {#if previewUrl}
        <img
            src={previewUrl}
            alt="Preview"
            class="absolute inset-0 w-full h-full object-cover {circular ? 'rounded-full' : ''}"
        />
    {/if}
    
    <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
        <button
            type="button"
            on:click={() => inputElement.click()}
            class="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100"
        >
            {previewUrl ? 'Change Image' : 'Upload Image'}
        </button>
    </div>
</div>

<input
    bind:this={inputElement}
    type="file"
    accept="image/*"
    on:change={handleFileSelect}
    class="hidden"
/>