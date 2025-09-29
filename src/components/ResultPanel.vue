<script setup lang="ts">

</script>

<template>
  <div class="w-full lg:w-3/5">
    <div class="card h-full p-4 space-y-4 fade-in">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-semibold flex items-center">
          <i class="fa-solid fa-image mr-2 text-primary"></i>
          生成结果
        </h2>
        <div class="flex space-x-2">
          <button id="copyParamsButton" class="btn btn-secondary text-sm py-1 px-3 hidden">
            <i class="fa-solid fa-copy mr-1"></i> 复制参数
          </button>
          <button id="downloadButton" class="btn btn-secondary text-sm py-1 px-3 hidden">
            <i class="fa-solid fa-download mr-1"></i> 下载图像
          </button>
        </div>
      </div>

      <div class="image-container card">
        <div id="loadingOverlay" class="loading-mask hidden">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            <p class="text-white mt-3 font-medium">生成中，请稍候...</p>
            <p class="text-white text-sm mt-1">这可能需要几秒到几十秒不等</p>
          </div>
        </div>
        <div id="initialPrompt" class="text-center text-gray-400 dark:text-gray-600">
          <i class="fa-solid fa-image-portrait text-4xl mb-2"></i>
          <p>点击生成按钮开始创建图像</p>
        </div>
        <span id="imageStatus" class="bg-gray-300 text-gray-700 hidden">状态</span>
        <img id="aiImage" class="max-h-full max-w-full rounded hidden" alt="生成的图像">
      </div>

      <div id="imageInfo" class="space-y-3 mt-2">
        <div class="grid grid-cols-2 gap-3">
          <div class="text-sm flex items-center">
                                <span class="font-medium flex items-center">
                                    <i class="fa-regular fa-clock mr-1 text-xs"></i> 生成时间：
                                </span>
            <span id="generationTime" class="ml-1">-</span>
          </div>
          <div class="text-sm flex items-center">
                                <span class="font-medium flex items-center">
                                    <i class="fa-solid fa-microchip mr-1 text-xs"></i> 使用模型：
                                </span>
            <span id="usedModel" class="ml-1">-</span>
          </div>
        </div>

        <div id="allParamsContainer" class="hidden mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
          <h3 class="text-sm font-medium mb-2 flex items-center">
            <i class="fa-solid fa-list-check mr-1"></i> 所有参数
          </h3>
          <div id="allParams" class="flex flex-wrap"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>