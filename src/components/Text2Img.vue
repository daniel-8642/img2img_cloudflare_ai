<script setup>

import ConfigPanel from "./ConfigPanel.vue";
import ResultPanel from "./ResultPanel.vue";
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-6 mobile-flex-col">
    <!-- 左侧控制面板 -->
    <config-panel/>

    <!-- 右侧图像展示 -->
<result-panel/>
  </div>
</template>

<style scoped>
</style>
