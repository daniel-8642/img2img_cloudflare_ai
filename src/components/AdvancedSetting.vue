<script setup lang="ts">
import {ref} from "vue";

let isOpen= ref(false);

</script>

<template>
  <div class="card p-4 space-y-4 fade-in" @click="isOpen=!isOpen">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold flex items-center">
        <i class="fa-solid fa-gear mr-2 text-primary"></i>
        高级选项
      </h2>
      <button class="text-xs btn btn-secondary py-1 px-3 flex items-center">
        <i class="fa-solid mr-1" :class="isOpen?'fa-chevron-up':'fa-chevron-down'"></i> 显示/隐藏
      </button>
    </div>

    <div class="space-y-3" :class="isOpen?'':'hidden'">
      <div>
        <div class="flex justify-between items-center">
          <label for="width" class="block text-sm font-medium flex items-center">
            <i class="fa-solid fa-arrows-left-right mr-1 text-xs"></i> 图像宽度
          </label>
          <span id="widthValue" class="text-sm font-mono">1024px</span>
        </div>
        <input type="range" id="width" min="256" max="2048" step="64" value="1024" class="slider w-full">
      </div>

      <div>
        <div class="flex justify-between items-center">
          <label for="height" class="block text-sm font-medium flex items-center">
            <i class="fa-solid fa-arrows-up-down mr-1 text-xs"></i> 图像高度
          </label>
          <span id="heightValue" class="text-sm font-mono">1024px</span>
        </div>
        <input type="range" id="height" min="256" max="2048" step="64" value="1024" class="slider w-full">
      </div>

      <div>
        <div class="flex justify-between items-center">
          <label for="num_steps" class="block text-sm font-medium flex items-center tooltip">
            <i class="fa-solid fa-shoe-prints mr-1 text-xs"></i> 迭代步数
            <span class="tooltiptext">更高的步数通常会产生更精细的细节，但需要更长的处理时间</span>
          </label>
          <span id="num_stepsValue" class="text-sm font-mono">20</span>
        </div>
        <input type="range" id="num_steps" min="1" max="20" step="1" value="20" class="slider w-full">
      </div>

      <div>
        <div class="flex justify-between items-center">
          <label for="guidance" class="block text-sm font-medium flex items-center tooltip">
            <i class="fa-solid fa-compass mr-1 text-xs"></i> 引导系数
            <span class="tooltiptext">控制生成图像与提示词的匹配程度，较高的值会更严格遵循提示词</span>
          </label>
          <span id="guidanceValue" class="text-sm font-mono">7.5</span>
        </div>
        <input type="range" id="guidance" min="0" max="30" step="0.5" value="7.5" class="slider w-full">
      </div>

      <div>
        <label for="seed" class="block text-sm font-medium mb-1 flex items-center tooltip">
          <i class="fa-solid fa-seedling mr-1 text-xs"></i> 随机种子
          <span class="tooltiptext">使用相同的种子值可以在其他参数相同的情况下生成相似的图像</span>
        </label>
        <div class="flex gap-2">
          <input type="number" id="seed" placeholder="随机种子值" class="w-full">
          <button id="randomSeed" class="btn btn-secondary text-sm py-1 px-3">
            <i class="fa-solid fa-random"></i>
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">留空则随机生成</p>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>