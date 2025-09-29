<script setup>

</script>

<template>
  <div class="flex flex-col lg:flex-row gap-6 mobile-flex-col">
    <!-- 左侧控制面板 -->
    <div class="w-full lg:w-2/5 space-y-4">
      <div class="card p-4 space-y-4 fade-in">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold flex items-center">
            <i class="fa-solid fa-sliders mr-2 text-primary"></i>
            基本设置
          </h2>
          <button id="randomButton" class="btn btn-secondary text-sm py-1 px-3 flex items-center">
            <i class="fa-solid fa-dice mr-1"></i> 随机提示词
          </button>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium mb-1 flex items-center">
            <i class="fa-solid fa-key mr-1 text-xs"></i> 访问密码
          </label>
          <input type="password" id="password" placeholder="请输入访问密码" class="w-full">
        </div>

        <div>
          <label for="prompt" class="block text-sm font-medium mb-1 flex items-center">
            <i class="fa-solid fa-wand-magic-sparkles mr-1 text-xs"></i> 正向提示词
          </label>
          <textarea id="prompt" rows="3" placeholder="描述您想要生成的图像内容及样式..."
                    class="w-full">cyberpunk cat</textarea>
        </div>

        <div>
          <label for="negative_prompt" class="block text-sm font-medium mb-1 flex items-center">
            <i class="fa-solid fa-ban mr-1 text-xs"></i> 反向提示词
          </label>
          <textarea id="negative_prompt" rows="2" placeholder="描述在生成的图像中要避免的元素文本..."
                    class="w-full"></textarea>
        </div>

        <div>
          <label for="model" class="block text-sm font-medium mb-1 flex items-center">
            <i class="fa-solid fa-robot mr-1 text-xs"></i> 文生图模型
          </label>
          <select id="model" class="w-full">
            <option value="loading" disabled selected>加载中...</option>
          </select>
        </div>
      </div>

      <div class="card p-4 space-y-4 fade-in">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold flex items-center">
            <i class="fa-solid fa-gear mr-2 text-primary"></i>
            高级选项
          </h2>
          <button id="toggleAdvanced" class="text-xs btn btn-secondary py-1 px-3 flex items-center">
            <i class="fa-solid fa-chevron-down mr-1" id="advancedIcon"></i> 显示/隐藏
          </button>
        </div>

        <div id="advancedOptions" class="space-y-3 hidden">
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

      <button id="submitButton" class="btn btn-primary w-full py-3 flex items-center justify-center">
        <i class="fa-solid fa-wand-magic-sparkles mr-2"></i> 生成图像
      </button>
    </div>

    <!-- 右侧图像展示 -->
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
  </div>
</template>

<style scoped>
</style>
