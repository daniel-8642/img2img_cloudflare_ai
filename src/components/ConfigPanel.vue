<script setup lang="ts">
import BaseSetting from "./BaseSetting.vue";
import AdvancedSetting from "./AdvancedSetting.vue";
</script>

<template>
  <div class="w-full lg:w-2/5 space-y-4">
    <base-setting/>

    <advanced-setting/>

    <button id="submitButton" class="btn btn-primary w-full py-3 flex items-center justify-center">
      <i class="fa-solid fa-wand-magic-sparkles mr-2"></i> 生成图像
    </button>
  </div>
</template>

<style scoped>

</style>