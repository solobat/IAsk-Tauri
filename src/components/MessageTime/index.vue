<template>
  <div class="aitem-time">{{ item.time }}</div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

defineProps({
  item: {
    type: Object,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.aitem-time {
  font-size: 12px;
  margin: 35px 0;
  text-align: center;
  color: $color-light;
}
</style>
