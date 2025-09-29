<script setup>
  import {onMounted} from "vue";


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
        <button id="themeToggle" class="btn btn-secondary p-2 h-10 w-10 flex items-center justify-center" aria-label="切换暗色主题">
          <i class="fa-solid fa-moon"></i>
        </button>
        <button id="github" class="btn btn-secondary p-2 h-10 w-10 flex items-center justify-center" aria-label="项目地址" onclick="window.open('https://github.com/huarzone/Text2img-Cloudflare-Workers', '_blank')">
          <i class="fa-brands fa-github"></i>
        </button>
      </div>
    </div>

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
            <textarea id="prompt" rows="3" placeholder="描述您想要生成的图像内容及样式..." class="w-full">cyberpunk cat</textarea>
          </div>

          <div>
            <label for="negative_prompt" class="block text-sm font-medium mb-1 flex items-center">
              <i class="fa-solid fa-ban mr-1 text-xs"></i> 反向提示词
            </label>
            <textarea id="negative_prompt" rows="2" placeholder="描述在生成的图像中要避免的元素文本..." class="w-full"></textarea>
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
  </div>
</template>

<style scoped>
:root {
  --primary: #5046e5;
  --primary-light: #6e67eb;
  --primary-dark: #4338ca;
  --secondary: #f0f4f8;
  --text: #1a202c;
  --text-light: #4a5568;
  --background: #ffffff;
  --card-bg: #f7fafc;
  --border: #e2e8f0;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}

.dark {
  --primary: #6e67eb;
  --primary-light: #8a84ee;
  --primary-dark: #5046e5;
  --secondary: #2d3748;
  --text: #f7fafc;
  --text-light: #cbd5e0;
  --background: #111827;
  --card-bg: #1f2937;
  --border: #374151;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}

body {
  background-color: var(--background);
  color: var(--text);
  transition: background-color 0.3s ease, color 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

.btn {
  padding: 1rem 1.5rem;
  border-radius: 0.375rem;
  transition: all 0.3s;
}

.btn:focus {
  outline: none;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-primary:active {
  background-color: var(--primary-dark);
  transform: translateY(0);
}

.btn-secondary {
  background-color: var(--secondary);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background-color: var(--border);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-secondary:active {
  transform: translateY(0);
}

.card {
  background-color: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

input, select, textarea {
  background-color: var(--background);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  transition: all 0.3s ease;
  width: 100%;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(80, 70, 229, 0.1);
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 5px;
  background: var(--border);
  outline: none;
  margin: 10px 0;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgba(80, 70, 229, 0.2);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgba(80, 70, 229, 0.2);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0,0,0,0.6);
  border-radius: 0.5rem;
  z-index: 10;
  backdrop-filter: blur(4px);
}

.image-container {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--card-bg);
  position: relative;
  border-radius: 0.5rem;
  max-height: 400px; /* 添加最大高度限制 */
  margin: 0 auto; /* 居中显示 */
  width: 100%; /* 保持宽度响应式 */
}

#imageStatus {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  z-index: 20;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.param-badge {
  background-color: var(--secondary);
  color: var(--text);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  display: inline-block;
  border: 1px solid var(--border);
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 200px;
  background-color: var(--card-bg);
  color: var(--text);
  text-align: center;
  border-radius: 6px;
  padding: 8px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -100px;
  opacity: 0;
  transition: opacity 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
  font-size: 0.75rem;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}

.hidden {
  display: none !important;
}

@media (max-width: 768px) {
  .mobile-flex-col {
    flex-direction: column;
  }

  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .image-container {
    max-height: 400px; /* 移动端适当减小最大高度 */
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
  }
}
</style>
