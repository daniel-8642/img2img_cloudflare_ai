<script setup>
import {onMounted} from "vue";
import Text2Img from "./components/Text2Img.vue";


// 初始化模型列表
let availableModels = [];
let randomPromptsList = [];
let currentImageParams = {};

// 加载模型列表
async function loadModels() {
  try {
    const response = await fetch('/api/models');
    if (!response.ok) {
      throw new Error('加载模型列表失败');
    }

    availableModels = await response.json();
    const modelSelect = document.getElementById('model');

    // 清空当前选项
    modelSelect.innerHTML = '';

    // 添加新选项
    availableModels.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = `${model.name} - ${model.description}`;
      modelSelect.appendChild(option);
    });

    // 默认选择第二个模型（通常是更好的模型）
    if (availableModels.length > 1) {
      modelSelect.value = availableModels[1].id;
    }
  } catch (error) {
    console.error('加载模型列表错误:', error);
    showStatus('加载模型列表失败', 'error');
  }
}

// 加载随机提示词
async function loadRandomPrompts() {
  try {
    const response = await fetch('/api/prompts');
    if (!response.ok) {
      throw new Error('加载提示词失败');
    }

    randomPromptsList = await response.json();
  } catch (error) {
    console.error('加载提示词错误:', error);
    randomPromptsList = ['未能加载提示词列表，请重试或手动输入'];
  }
}

// 显示状态提示
function showStatus(message, type = 'info') {
  const statusElement = document.getElementById('imageStatus');
  if (!statusElement) return;

  // 设置样式
  statusElement.className = '';
  switch (type) {
    case 'success':
      statusElement.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-900', 'dark:text-green-100');
      break;
    case 'error':
      statusElement.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-900', 'dark:text-red-100');
      break;
    case 'warning':
      statusElement.classList.add('bg-yellow-100', 'text-yellow-800', 'dark:bg-yellow-900', 'dark:text-yellow-100');
      break;
    default:
      statusElement.classList.add('bg-blue-100', 'text-blue-800', 'dark:bg-blue-900', 'dark:text-blue-100');
  }

  // 设置消息
  statusElement.textContent = message;

  // 显示
  statusElement.classList.remove('hidden');

  // 5秒后自动隐藏
  setTimeout(() => {
    statusElement.classList.add('hidden');
  }, 5000)
}

onMounted(() => {
  // 初始化加载资源
  loadModels();
  loadRandomPrompts();

  // 主题切换功能相关代码
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const moonIcon = `<i class="fa-solid fa-moon"></i>`;
  const sunIcon = `<i class="fa-solid fa-sun"></i>`;

  // 检查系统主题或存储的主题并设置初始状态
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
    themeToggle.innerHTML = sunIcon;
    themeToggle.setAttribute('aria-label', '切换亮色主题');
  } else {
    html.classList.remove('dark');
    themeToggle.innerHTML = moonIcon;
    themeToggle.setAttribute('aria-label', '切换暗色主题');
  }

  themeToggle.addEventListener('click', function () {
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.theme = 'light';
      themeToggle.innerHTML = moonIcon;
      themeToggle.setAttribute('aria-label', '切换暗色主题');
    } else {
      html.classList.add('dark');
      localStorage.theme = 'dark';
      themeToggle.innerHTML = sunIcon;
      themeToggle.setAttribute('aria-label', '切换亮色主题');
    }
  });

  // 高级选项切换
  const toggleAdvanced = document.getElementById('toggleAdvanced');
  const advancedOptions = document.getElementById('advancedOptions');
  const advancedIcon = document.getElementById('advancedIcon');

  toggleAdvanced.addEventListener('click', function () {
    if (advancedOptions.classList.contains('hidden')) {
      advancedOptions.classList.remove('hidden');
      advancedIcon.classList.remove('fa-chevron-down');
      advancedIcon.classList.add('fa-chevron-up');
    } else {
      advancedOptions.classList.add('hidden');
      advancedIcon.classList.remove('fa-chevron-up');
      advancedIcon.classList.add('fa-chevron-down');
    }
  });

  // 滑块值显示
  const sliders = ['width', 'height', 'num_steps', 'guidance'];
  sliders.forEach(id => {
    const slider = document.getElementById(id);
    const valueDisplay = document.getElementById(`${id}Value`);

    slider.addEventListener('input', function () {
      if (id === 'width' || id === 'height') {
        valueDisplay.textContent = `${this.value}px`;
      } else if (id === 'guidance') {
        valueDisplay.textContent = parseFloat(this.value).toFixed(2);
      } else {
        valueDisplay.textContent = this.value;
      }
    });
  });

  // 随机种子
  document.getElementById('randomSeed').addEventListener('click', function () {
    const randomSeed = Math.floor(Math.random() * 4294967295);
    document.getElementById('seed').value = randomSeed;
  });

  // 随机提示词
  document.getElementById('randomButton').addEventListener('click', function () {
    if (randomPromptsList.length > 0) {
      const randomIndex = Math.floor(Math.random() * randomPromptsList.length);
      document.getElementById('prompt').value = randomPromptsList[randomIndex];
    } else {
      showStatus('提示词列表未加载，请稍后再试', 'error');
    }
  });

  // 复制参数
  document.getElementById('copyParamsButton').addEventListener('click', function () {
    if (!currentImageParams) return;

    // 创建参数文本
    let paramsText = '--- AI绘图创作生成参数 ---\n';
    for (const [key, value] of Object.entries(currentImageParams)) {
      if (key === 'password') continue; // 不复制密码
      paramsText += `${formatParamName(key)}: ${value}\n`;
    }

    // 复制到剪贴板
    navigator.clipboard.writeText(paramsText)
        .then(() => {
          showStatus('参数已复制到剪贴板', 'success');
        })
        .catch(err => {
          console.error('复制失败:', err);
          showStatus('复制参数失败', 'error');
        });
  });

  // 格式化参数名称
  function formatParamName(name) {
    const nameMap = {
      'prompt': '正向提示词',
      'negative_prompt': '反向提示词',
      'model': '文生图模型',
      'width': '图像宽度',
      'height': '图像高度',
      'num_steps': '迭代步数',
      'guidance': '引导系数',
      'seed': '随机种子'
    };
    return nameMap[name] || name;
  }

  // 下载图像
  document.getElementById('downloadButton').addEventListener('click', async function () {
    const img = document.getElementById('aiImage');
    if (!img.src) {
      showStatus('没有可下载的图像', 'error');
      return;
    }

    try {
      // 从图像数据创建blob
      const response = await fetch(img.src);
      const blob = await response.blob();

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const model = document.getElementById('usedModel').textContent || 'ai-image';
      link.download = `${model}-${timestamp}.png`;

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showStatus('图像下载成功', 'success');
    } catch (error) {
      console.error('下载图像错误:', error);
      showStatus('下载图像失败', 'error');
    }
  });

  // 提交生成请求
  document.getElementById('submitButton').addEventListener('click', async function () {
    // 显示加载中状态
    const loadingOverlay = document.getElementById('loadingOverlay');
    const initialPrompt = document.getElementById('initialPrompt');
    const aiImage = document.getElementById('aiImage');

    if (!loadingOverlay || !initialPrompt || !aiImage) {
      console.error('必要的DOM元素未找到');
      return;
    }

    // 隐藏初始提示和图像
    initialPrompt.classList.add('hidden');
    aiImage.classList.add('hidden');
    loadingOverlay.classList.remove('hidden');

    // 隐藏之前的提示和按钮
    const imageStatus = document.getElementById('imageStatus');
    const copyParamsButton = document.getElementById('copyParamsButton');
    const downloadButton = document.getElementById('downloadButton');

    if (imageStatus) imageStatus.classList.add('hidden');
    if (copyParamsButton) copyParamsButton.classList.add('hidden');
    if (downloadButton) downloadButton.classList.add('hidden');

    // 获取参数
    const params = {
      password: document.getElementById('password')?.value || '',
      prompt: document.getElementById('prompt')?.value || '',
      negative_prompt: document.getElementById('negative_prompt')?.value || '',
      model: document.getElementById('model')?.value,
      width: parseInt(document.getElementById('width')?.value) || 1024,
      height: parseInt(document.getElementById('height')?.value) || 1024,
      num_steps: parseInt(document.getElementById('num_steps')?.value) || 20,
      guidance: parseFloat(document.getElementById('guidance')?.value) || 7.5,
      seed: parseInt(document.getElementById('seed')?.value) || Math.floor(Math.random() * 4294967295)
    };

    // 保存当前参数
    currentImageParams = {...params};

    try {
      // 发送请求
      const startTime = performance.now();
      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'image/*'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || '生成失败');
        } else {
          const errorText = await response.text();
          console.error('服务器错误:', errorText);
          throw new Error('生成失败');
        }
      }

      // 获取图像blob数据并转换为base64
      const imageBlob = await response.blob();
      const base64Image = await blobToBase64(imageBlob);
      const endTime = performance.now();
      const generationTime = ((endTime - startTime) / 1000).toFixed(2);

      // 设置图像信息并显示图像
      aiImage.src = base64Image;
      aiImage.onload = () => {
        // 图像加载完成后更新UI
        loadingOverlay.classList.add('hidden');
        aiImage.classList.remove('hidden');

        // 安全地更新信息显示
        const elements = {
          generationTime: document.getElementById('generationTime'),
          usedModel: document.getElementById('usedModel')
        };

        if (elements.generationTime) {
          elements.generationTime.textContent = `${generationTime}秒`;
        }
        if (elements.usedModel) {
          elements.usedModel.textContent = getModelNameById(params.model);
        }

        // 更新所有参数面板
        updateParamsDisplay(params);

        // 显示状态和操作按钮
        showStatus('生成成功', 'success');
        if (copyParamsButton) copyParamsButton.classList.remove('hidden');
        if (downloadButton) downloadButton.classList.remove('hidden');
      };

    } catch (error) {
      console.error('生成图像错误:', error);
      showStatus(error.message || '生成失败', 'error');
      // 显示初始提示
      initialPrompt.classList.remove('hidden');
      aiImage.classList.add('hidden');
    } finally {
      loadingOverlay.classList.add('hidden');
    }
  });

  // 将Blob转换为Base64
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // 通过ID获取模型名称
  function getModelNameById(id) {
    const model = availableModels.find(m => m.id === id);
    return model ? model.name : id;
  }

  // 更新参数显示
  function updateParamsDisplay(params) {
    const allParamsContainer = document.getElementById('allParamsContainer');
    const allParamsElement = document.getElementById('allParams');

    if (!allParamsContainer || !allParamsElement) return;

    // 清空现有参数
    allParamsElement.innerHTML = '';

    // 添加新参数
    for (const [key, value] of Object.entries(params)) {
      if (key === 'password') continue; // 不显示密码

      const paramName = formatParamName(key);
      const paramValue = value;

      // 创建参数徽章
      const badge = document.createElement('div');
      badge.className = 'param-badge';
      badge.innerHTML = `<span class="font-medium">${paramName}:</span> ${paramValue}`;

      allParamsElement.appendChild(badge);
    }

    // 显示参数容器
    allParamsContainer.classList.remove('hidden');
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-4 max-w-6xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl md:text-3xl font-bold flex items-center">
        🐳&nbsp;在线文生图服务
      </h1>
      <div class="flex items-center space-x-2">
        <button id="themeToggle" class="btn btn-secondary p-2 h-10 w-10 flex items-center justify-center"
                aria-label="切换暗色主题">
          <i class="fa-solid fa-moon"></i>
        </button>
        <button id="github" class="btn btn-secondary p-2 h-10 w-10 flex items-center justify-center"
                aria-label="项目地址"
                onclick="window.open('https://github.com/daniel-8642/img2img_cloudflare_ai', '_blank')">
          <i class="fa-brands fa-github"></i>
        </button>
      </div>
    </div>
    <Text2Img />
  </div>
</template>

<style scoped>

</style>
