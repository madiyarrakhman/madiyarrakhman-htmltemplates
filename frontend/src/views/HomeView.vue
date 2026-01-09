<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'

const { t, locale } = useI18n()

const setLanguage = (lang: string) => {
    locale.value = lang
    localStorage.setItem('preferred_lang', lang)
    document.documentElement.lang = lang
}

onMounted(() => {
    const savedLang = localStorage.getItem('preferred_lang') || 'ru'
    setLanguage(savedLang)
})
</script>

<template>
    <div class="landing-page">
        <nav>
            <router-link to="/" class="logo">CardGo</router-link>
            <div class="lang-switcher">
                <button class="lang-btn" :class="{ active: locale === 'ru' }" @click="setLanguage('ru')">RU</button>
                <button class="lang-btn" :class="{ active: locale === 'kk' }" @click="setLanguage('kk')">KK</button>
                <button class="lang-btn" :class="{ active: locale === 'en' }" @click="setLanguage('en')">EN</button>
            </div>
        </nav>

        <main>
            <section class="hero">
                <div class="hero-content">
                    <h1>{{ t('hero_title') }}</h1>
                    <p>{{ t('hero_desc') }}</p>
                    <a href="https://wa.me/77474619463" class="cta-button">
                        <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.284l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.181-2.587-5.768-5.764-5.768zm3.393 8.3c-.146.405-.844.733-1.164.778-.287.041-.63.064-1.763-.406-1.456-.604-2.391-2.073-2.464-2.17-.073-.098-.593-.789-.593-1.57s.411-1.171.557-1.328c.146-.158.32-.198.426-.198.106 0 .211.002.304.006.098.004.23-.037.359.274.133.32.454 1.107.494 1.189.04.081.066.176.013.282-.053.107-.079.172-.158.264-.079.091-.166.204-.237.273-.081.079-.165.166-.071.328.095.161.42 1.002.901 1.433.621.556 1.141.729 1.306.811.166.081.264.068.362-.045.097-.113.424-.494.536-.66.113-.166.226-.139.381-.081s.988.466 1.157.551c.17.085.283.127.324.198.041.071.041.409-.105.814z" />
                            <path
                                d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z" />
                        </svg>
                        <span>{{ t('cta_text') }}</span>
                    </a>
                </div>
            </section>

            <section class="features">
                <div class="feature-card">
                    <div class="icon-circle">💎</div>
                    <h3>{{ t('feat_1_title') }}</h3>
                    <p>{{ t('feat_1_desc') }}</p>
                </div>
                <div class="feature-card">
                    <div class="icon-circle">⚡️</div>
                    <h3>{{ t('feat_2_title') }}</h3>
                    <p>{{ t('feat_2_desc') }}</p>
                </div>
                <div class="feature-card">
                    <div class="icon-circle">📱</div>
                    <h3>{{ t('feat_3_title') }}</h3>
                    <p>{{ t('feat_3_desc') }}</p>
                </div>
            </section>

            <section class="steps">
                <div class="section-header">
                    <h2>{{ t('steps_header') }}</h2>
                </div>
                <div class="steps-container">
                    <div class="step-row">
                        <div class="step-content">
                            <span class="step-num">{{ t('step_1_label') }}</span>
                            <h3>{{ t('step_1_title') }}</h3>
                            <p>{{ t('step_1_desc') }}</p>
                        </div>
                        <div class="step-image">
                            <div class="mockup-phone">
                                <div class="chat-bubble">{{ t('chat_1') }}</div>
                                <div class="chat-bubble me">{{ t('chat_2') }}</div>
                                <div class="chat-bubble">{{ t('chat_3') }}</div>
                                <div class="chat-bubble me">{{ t('chat_4') }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="step-row">
                        <div class="step-content">
                            <span class="step-num">{{ t('step_2_label') }}</span>
                            <h3>{{ t('step_2_title') }}</h3>
                            <p>{{ t('step_2_desc') }}</p>
                        </div>
                        <div class="step-image">
                            <div style="font-size: 4rem; opacity: 0.2">✨ ⚜️ ✨</div>
                        </div>
                    </div>
                    <div class="step-row">
                        <div class="step-content">
                            <span class="step-num">{{ t('step_3_label') }}</span>
                            <h3>{{ t('step_3_title') }}</h3>
                            <p>{{ t('step_3_desc') }}</p>
                        </div>
                        <div class="step-image">
                            <div
                                style="padding: 1rem; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); color: #333;">
                                card-go.asia/s/alex-kate
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <footer>
            <span class="footer-logo">CardGo</span>
            <p class="copyright">{{ t('copyright') }}</p>
        </footer>
    </div>
</template>

<style scoped>
/* Scoped styles specific to the Landing Page */
/* Colors reused from existing landing.html styles */
.landing-page {
    --color-brand: #c5a059;
    --color-brand-dark: #a88948;
    --color-bg: #fdfcf9;
    --color-text: #1a1a1a;
    --color-text-muted: #666666;
    --container-width: 1100px;
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    font-family: 'Montserrat', sans-serif;
    color: var(--color-text);
    background-color: var(--color-bg);
}

/* --- Navigation --- */
nav {
    padding: 2rem 5%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: var(--container-width);
    margin: 0 auto;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
}

.logo {
    font-family: 'Spectral', serif;
    font-size: 1.8rem;
    color: #8c6d31;
    text-decoration: none;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* --- Language Switcher --- */
.lang-switcher {
    display: flex;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(5px);
    padding: 0.5rem 1rem;
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.lang-btn {
    background: none;
    border: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.9rem;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 2px 4px;
    transition: var(--transition);
    font-weight: 500;
    text-transform: uppercase;
}

.lang-btn.active {
    color: var(--color-brand);
    font-weight: 700;
    border-bottom: 2px solid var(--color-brand);
}

.lang-btn:hover {
    color: var(--color-brand);
}

/* --- Hero Section --- */
.hero {
    padding: 12rem 5% 8rem;
    text-align: center;
    width: 100%;
    margin: 0 auto;
    background:
        linear-gradient(to bottom, rgba(253, 252, 249, 0.2), rgba(253, 252, 249, 0.9)),
        url('/images/landing_hero_bg.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: auto; /* Reset global min-height */
}

.hero-content {
    max-width: 900px;
    padding: 3rem;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(10px);
    border-radius: 40px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
}

.hero h1 {
    font-family: 'Spectral', serif;
    font-size: clamp(2.5rem, 8vw, 4.5rem);
    line-height: 1.1;
    margin-bottom: 1.5rem;
    font-weight: 700;
    color: inherit; /* Reset global color */
    background: none; /* Reset global grad */
    -webkit-text-fill-color: initial;
}

.hero p {
    font-size: clamp(1.1rem, 3vw, 1.4rem);
    color: var(--color-text-muted);
    margin-bottom: 3rem;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
}

.cta-button {
    display: inline-flex;
    align-items: center;
    padding: 1.2rem 2.5rem;
    background-color: var(--color-brand);
    color: white;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.1rem;
    transition: var(--transition);
    box-shadow: 0 10px 30px rgba(197, 160, 89, 0.3);
    gap: 0.8rem;
}

.cta-button:hover {
    transform: translateY(-3px);
    background-color: var(--color-brand-dark);
    box-shadow: 0 15px 40px rgba(197, 160, 89, 0.4);
}

.whatsapp-icon {
    width: 24px;
    height: 24px;
}

/* --- Features Section --- */
.features {
    padding: 6rem 5%;
    max-width: var(--container-width);
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
    min-height: auto;
}

.feature-card {
    padding: 2.5rem;
    background: white;
    border-radius: 24px;
    border: 1px solid rgba(0, 0, 0, 0.03);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.02);
    transition: var(--transition);
    color: #1a1a1a;
}

.feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
}

.icon-circle {
    width: 60px;
    height: 60px;
    background: #fff9ed;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
}

.feature-card h3 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
    font-weight: 600;
    color: inherit;
}

.feature-card p {
    color: var(--color-text-muted);
    font-size: 1rem;
}

/* --- Steps Section --- */
.steps {
    background-color: white;
    padding: 8rem 5%;
    width: 100%;
}

.section-header {
    text-align: center;
    max-width: 600px;
    margin: 0 auto 5rem;
}

.section-header h2 {
    font-family: 'Spectral', serif;
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #1a1a1a;
    background: none;
    -webkit-text-fill-color: initial;
}

.steps-container {
    max-width: var(--container-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 4rem;
}

.step-row {
    display: flex;
    align-items: center;
    gap: 4rem;
}

.step-row:nth-child(even) {
    flex-direction: row-reverse;
}

.step-content {
    flex: 1;
}

.step-num {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--color-brand);
    text-transform: uppercase;
    letter-spacing: 2px;
    display: block;
    margin-bottom: 1rem;
}

.step-content h3 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    font-family: 'Spectral', serif;
    color: #1a1a1a;
}

.step-content p {
    color: var(--color-text-muted);
}

.step-image {
    flex: 1;
    background: #fcfcfc;
    border-radius: 30px;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.02);
}

/* --- Footer --- */
footer {
    padding: 4rem 5%;
    text-align: center;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    background: none;
}

.footer-logo {
    font-family: 'Spectral', serif;
    font-size: 1.5rem;
    color: var(--color-brand);
    margin-bottom: 1rem;
    display: block;
}

.copyright {
    color: var(--color-text-muted);
    font-size: 0.9rem;
}

/* --- Floating UI Element for Demo --- */
.mockup-phone {
    width: 200px;
    height: 400px;
    background: #fff;
    border: 8px solid #1a1a1a;
    border-radius: 30px;
    padding: 10px;
    position: relative;
    display: flex;
    flex-direction: column;
}

.chat-bubble {
    background: #e1f5fe;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    margin-bottom: 10px;
    max-width: 80%;
    animation: slideIn 0.5s ease-out;
    color: #333;
}

.chat-bubble.me {
    background: #dcf8c6;
    margin-left: auto;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .step-row,
    .step-row:nth-child(even) {
        flex-direction: column;
        gap: 2rem;
    }

    .hero {
        padding: 6rem 5% 4rem;
    }

    .hero h1 {
        font-size: 2.8rem;
    }
}
</style>
