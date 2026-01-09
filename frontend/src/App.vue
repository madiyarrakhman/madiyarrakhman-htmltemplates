<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'

const { locale } = useI18n()

// Basic default locale loading if needed, though individual views will handle it
onMounted(() => {
    document.documentElement.lang = locale.value
})
</script>

<template>
  <RouterView />
</template>
