import {defineStore} from 'pinia'
import {computed, ref, watch} from "vue";
import availableModelsT from "../../config/AvailableModels.json"

export const useSettingStore =
    defineStore('setting', () => {
        const theme = ref(
            window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

        function switchTheme() {
            theme.value = theme.value === 'dark' ? 'light' : 'dark'
        }

        watch(theme, () => {
            if (theme.value === 'dark') {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        })

        const availableModels = ref(availableModelsT)

        return {theme, switchTheme, availableModels}
    })

export const useMessage =
    defineStore('message', () => {
        const imageStatus = ref("hidden");
        const message = ref("状态")
        const statusStyle = computed(() => {
            switch (imageStatus.value) {
                case 'success':
                    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                case 'warning':
                    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                case 'error':
                    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                case 'hidden':
                    return 'bg-gray-300 text-gray-700 hidden'
                default:
                    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
            }
        })

        function showStatus(msg, type = 'info') {
            message.value = msg
            imageStatus.value = type
            setTimeout(() => {
                imageStatus.value = "hidden"
                message.value = "状态"
            }, 9000)
        }

        return {imageStatus, statusStyle, showStatus, message}
    })