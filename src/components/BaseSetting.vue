<script setup lang="ts">
import {useSettingStore} from "../stores/setting.js";

const models = useSettingStore().availableModels
console.log(models)
</script>

<template>
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
        <option v-for="(item, index) in models" :value="item.id" :selected="index === 1">
          {{ item.name }} - {{ item.description }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>

</style>