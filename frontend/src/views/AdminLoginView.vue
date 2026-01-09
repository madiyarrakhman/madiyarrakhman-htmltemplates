<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
    error.value = ''
    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username.value, password: password.value })
        })

        if (res.ok) {
            router.push('/admin')
        } else {
            error.value = 'Неверный логин или пароль'
        }
    } catch (err) {
        console.error(err)
        error.value = 'Ошибка сервера'
    }
}
</script>

<template>
    <div class="admin-login-page">
        <div class="login-card">
            <h1>ADMIN PANEL</h1>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label>Логин</label>
                    <input type="text" v-model="username" required>
                </div>
                <div class="form-group">
                    <label>Пароль</label>
                    <input type="password" v-model="password" required>
                </div>
                <button type="submit">Войти</button>
                <div v-if="error" class="error">{{ error }}</div>
            </form>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&display=swap');

.admin-login-page {
    font-family: 'Montserrat', sans-serif;
    background: #fdfbf7;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    margin: 0;
    color: #1a1a1a;
}

.login-card {
    background: white;
    padding: 3rem;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 400px;
    text-align: center;
}

h1 {
    font-weight: 300;
    margin-bottom: 2rem;
    letter-spacing: 2px;
}

.form-group {
    margin-bottom: 1.5rem;
    text-align: left;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

input {
    width: 100%;
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 10px;
    box-sizing: border-box;
    font-family: inherit;
}

button {
    width: 100%;
    padding: 1rem;
    background: #1a1a1a;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
    margin-top: 1rem;
}

button:hover {
    background: #d4af37;
    transform: translateY(-2px);
}

.error {
    color: #e74c3c;
    font-size: 0.9rem;
    margin-top: 1rem;
}
</style>
