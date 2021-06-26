<template>
  <div class="container">
    <h2>{{ message }}</h2>
    <p>{{ url }}</p>
    <p>{{ parsedUrl && parsedUrl.host }}</p>
    <p>{{ parsedUrl && parsedUrl.pathname }}</p>
    <div style="width: 400px; height: 400px">
      <textarea style="width: 100%; height: 90%;" v-model="batchTasks"></textarea>
      <button @click="batchBookmate">开始批量采集bootmate</button>
    </div>
    <button :disabled="!isGBook || running" @click="startShot">
      {{ running ? "loading" : "start cap gbook" }}
    </button>
    <button :disabled="!isBookmate || running" @click="openBookmateReader">
      {{ running ? "loading" : "navigate to reader" }}
    </button>
    <button :disabled="!isBookmateReader || running" @click="startBookmate">
      {{ running ? "loading" : "start capture" }}
    </button>
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
    },
    openBookmateReader() {
      chrome.tabs.create({
        url: `https://reader.bookmate.com/${this.bookmateId}`
      });
    },
    startBookmate() {
      const id = this.currentTab?.id;
      if (id) {
        chrome.tabs.sendMessage(id, { type: 'start-bookmate', bookId: this.bookmateId }, res => {
          console.log(res);
          this.running = false;
        });
        this.running = true;
      }
    },
    batchBookmate() {
      if (this.batchTasks) {
        const tasks = this.batchTasks.split('\n');
        chrome.runtime.sendMessage({
          type: 'batch-bookmate',
          value: tasks,
        });
      }
    }
  },
  computed: {
    parsedUrl() {
      return (this as any).url && new URL((this as any).url);
    },
    isGBook() {
      return (this as any).parsedUrl && (this as any).parsedUrl.host.includes('books.google.com') &&
      (this as any).parsedUrl.pathname === '/books'
    },
    isBookmate() {
      return (this as any).parsedUrl && (this as any).parsedUrl.host.includes('bookmate.com') &&
      (this as any).parsedUrl.pathname.startsWith('/reader');
    },
    isBookmateReader() {
      return (this as any).parsedUrl && (this as any).parsedUrl.host.includes('reader.bookmate.com');
    },
    bookmateId() {
      if (this.isBookmate) {
        return (this as any).parsedUrl.pathname.split('/')[2];
      } else if (this.isBookmateReader) {
        return (this as any).parsedUrl.pathname.split('/')[1];
      }
      return '';
    }
  },
  data() {
    return {
      message: "GBookShotter",
      url: "",
      currentTab: null as chrome.tabs.Tab | null,
      running: false,
      batchTasks: '',
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