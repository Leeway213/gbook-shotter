<template>
  <div class="container">
    <h2>{{message}}</h2>
    <p>{{url}}</p>
    <p>{{parsedUrl && parsedUrl.host}}</p>
    <p>{{parsedUrl && parsedUrl.pathname}}</p>
    <button :disabled="!isGBook || running" @click="startShot">{{running ? 'loading' : 'start'}}</button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "App",
  mounted() {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      this.currentTab = tabs[0];
      this.url = tabs[0].url || '';
    });
  },
  methods: {
    startShot() {
      const id = this.currentTab?.id;
      if (id) {
        chrome.tabs.sendMessage(id, {type: 'start-shot'}, res => {
          console.log(res);
          this.running = false;
        });
        this.running = true;
      }
    }
  },
  computed: {
    parsedUrl() {
      return (this as any).url && new URL((this as any).url);
    },
    isGBook() {
      return (this as any).parsedUrl.host.includes('books.google.com') &&
      (this as any).parsedUrl.pathname === '/books'
    }
  },
  data() {
    return {
      message: "GBookShotter",
      url: "",
      currentTab: null as chrome.tabs.Tab | null,
      running: false,
    };
  },
});
</script>

<style scoped lang="scss">
.container {
  text-align: center;

  h1 {
    font-weight: 600;
  }
}
</style>