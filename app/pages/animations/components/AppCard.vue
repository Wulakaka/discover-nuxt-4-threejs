<script setup lang="ts">
import {motion} from "motion-v";
defineProps<{
  card: {
    title: string;
    subtitle: string;
    description: string;
    longDescription: string;
    image: string;
    logo: string;
  };
}>();

defineEmits<{
  (
    e: "set-active-card",
    value: {
      title: string;
      subtitle: string;
      description: string;
      longDescription: string;
      image: string;
      logo: string;
    } | null,
  ): void;
}>();
</script>

<template>
  <motion.div
    :layout-id="`card-${card.title}`"
    class="card"
    :while-press="{scale: 0.98}"
    :style="{borderRadius: '20px'}"
    @click="$emit('set-active-card', card)"
  >
    <motion.img
      :layout-id="`image-${card.title}`"
      :src="card.image"
      alt=""
      :style="{borderRadius: '20px'}"
    />
    <motion.button
      aria-hidden="true"
      tab-index="-1"
      :layout-id="`close-button-${card.title}`"
      class="close-button"
      :style="{opacity: 0}"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        height="20"
        width="20"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    </motion.button>
    <motion.div :layout-id="`card-content-${card.title}`" class="card-content">
      <div class="card-text">
        <motion.h2
          :layout-id="`card-heading-${card.title}`"
          class="card-heading"
        >
          Game of the day
        </motion.h2>
      </div>
      <motion.div
        :layout-id="`card-extra-info-${card.title}`"
        class="extra-info"
        :style="{
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
        }"
      >
        <motion.img
          :src="card.logo"
          :width="40"
          :height="40"
          alt=""
          :layout-id="`card-game-image-${card.title}`"
          class="rounded-lg"
        />
        <div class="desc-wrapper">
          <motion.span
            :layout-id="`card-game-title-${card.title}`"
            class="game-title"
          >
            {{ card.title }}
          </motion.span>
          <motion.span
            :layout-id="`card-game-subtitle-${card.title}`"
            class="game-subtitle"
          >
            {{ card.description }}
          </motion.span>
        </div>
        <motion.button
          :layout-id="`card-button-${card.title}`"
          class="get-button"
        >
          Get
        </motion.button>
      </motion.div>
    </motion.div>

    <!-- <motion.div
      :layout-id="`card-long-description-${card.title}`"
      class="long-description"
      :style="{position: 'absolute', top: '100%', opacity: 0}"
    >
      <div>
        <p><b>Are you ready?</b> {{ card.longDescription }}</p>
        <p>
          <b>The never ending adventure</b>
          In this game set in a fairy tale world, players embark on a quest
          through mystical lands filled with enchanting forests and towering
          mountains.
        </p>
      </div>
    </motion.div> -->
  </motion.div>
</template>

<style scoped></style>
