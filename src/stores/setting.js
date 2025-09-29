import {defineStore} from 'pinia'
import {ref, watch} from "vue";

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

        return {theme, switchTheme}
    })
