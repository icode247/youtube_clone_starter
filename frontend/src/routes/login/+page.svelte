<!-- src/routes/login/+page.svelte -->
<script>
  import { auth } from "$lib/firebase/client";
  import api from "$lib/api/client";
  import { goto } from "$app/navigation";
  import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
  } from "firebase/auth";

  let isLogin = true;
  let email = "";
  let password = "";
  let username = "";
  let loading = false;
  // @ts-ignore
  /**
   * @type {string | null}
   */
  let error = null;

  async function handleSubmit() {
    try {
      loading = true;
      error = null;

      if (isLogin) {
        // Login
        // @ts-ignore
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const idToken = await userCredential.user.getIdToken();
        localStorage.setItem("idToken", idToken);
      } else {
        // Register
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Update profile
        await updateProfile(userCredential.user, {
          displayName: username,
        });
        const idToken = await userCredential.user.getIdToken();
        localStorage.setItem("idToken", idToken);
        // // Create user in backend

        await api.post(`/auth/register`, {
          email,
          password,
          username,
          uid: userCredential.user.uid,
        });
      }

      goto("/");
    } catch (err) {
      console.error("Auth error:", err);
      error = isLogin ? "Invalid email or password" : "Registration failed";
    } finally {
      loading = false;
    }
  }
</script>

<div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
  <div class="flex border-b mb-6">
    <button
      class="flex-1 py-2 text-center {isLogin
        ? 'text-red-600 border-b-2 border-red-600'
        : 'text-gray-500'}"
      on:click={() => (isLogin = true)}
    >
      Login
    </button>
    <button
      class="flex-1 py-2 text-center {!isLogin
        ? 'text-red-600 border-b-2 border-red-600'
        : 'text-gray-500'}"
      on:click={() => (isLogin = false)}
    >
      Register
    </button>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    {#if !isLogin}
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          id="username"
          type="text"
          bind:value={username}
          required={!isLogin}
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
        />
      </div>
    {/if}

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        id="email"
        type="email"
        bind:value={email}
        required
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
      />
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">
        Password
      </label>
      <input
        id="password"
        type="password"
        bind:value={password}
        required
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
      />
    </div>

    {#if error}
      <div class="text-red-600 text-sm">
        {error}
      </div>
    {/if}

    <button
      type="submit"
      disabled={loading}
      class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
    >
      {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
    </button>
  </form>
</div>
