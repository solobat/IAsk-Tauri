import { ComponentOptionsMixin } from "vue";

export default {
  data() {
    return {
      unbindFns: [] as Array<() => void>,
    };
  },

  methods: {
    bindAppEvent(eventName: string, fn: () => void) {
      this.unbindFns.push(() => {
        console.log("unbindFns: ", eventName);
      });
    },

    unbindEvents() {
      this.unbindFns.forEach((fn: () => void) => fn && fn());
      this.unbindFns = [];
    },
  },

  mounted() {
    this.bindEvents();
  },

  beforeDestory() {
    this.unbindEvents();
  },
} as ComponentOptionsMixin;
