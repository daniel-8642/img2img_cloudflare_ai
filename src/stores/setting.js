import {defineStore} from 'pinia'
import {ref, watch} from "vue";
import availableModelsT from "../assets/AvailableModels.json"

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

        const availableModels =ref(availableModelsT)

        return {theme, switchTheme,availableModels}
    })
