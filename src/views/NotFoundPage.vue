<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-icon">
        <v-icon size="80" color="#ffc107">mdi-bee</v-icon>
      </div>
      <h1 class="error-code">404</h1>
      <h2 class="error-title">Page not found</h2>
      <p class="error-description">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <button class="home-btn" @click="goHome">
        <v-icon size="18" class="mr-2">mdi-arrow-left</v-icon>
        Back to Home
      </button>
    </div>
    <div class="bg-circles">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
  router.push("/");
};
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
  position: relative;
  overflow: hidden;
}

.not-found-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 480px;
  padding: 32px;
}

.error-icon {
  margin-bottom: 16px;
  opacity: 0.9;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  color: #ffc107;
  line-height: 1;
  margin: 0;
  letter-spacing: -4px;
  text-shadow: 0 4px 24px rgba(255, 193, 7, 0.2);
}

.error-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  margin: 16px 0 12px;
}

.error-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin: 0 0 36px;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.home-btn:hover {
  background: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.home-btn:active {
  transform: translateY(0);
}

/* Background circles */
.bg-circles {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 193, 7, 0.08);
}

.circle-1 {
  width: 500px;
  height: 500px;
  top: -150px;
  right: -100px;
  background: radial-gradient(circle, rgba(255, 193, 7, 0.04), transparent 70%);
}

.circle-2 {
  width: 350px;
  height: 350px;
  bottom: -100px;
  left: -80px;
  background: radial-gradient(circle, rgba(15, 52, 96, 0.3), transparent 70%);
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 30%;
  left: 15%;
  background: radial-gradient(circle, rgba(255, 193, 7, 0.06), transparent 70%);
}
</style>
