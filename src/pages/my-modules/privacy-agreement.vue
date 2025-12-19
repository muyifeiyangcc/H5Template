<script setup lang="ts"> 
  defineOptions({
    name: 'PrivacyAgreement'
  }) 
</script>

<template>
  <div safe-area-inset-top p-layout-padding class="follow_box">
    <p>Privacy agreement</p>
  </div>
</template>

<style lang="less" scoped>
  .follow_box {
    color: #fff;
    padding-top: calc(
      var(--van-nav-bar-height) + var(--ai-view-padding-top)
    );
    min-height: 100vh;
    background: var(--ai-follow-bg-color);
  }
</style>
