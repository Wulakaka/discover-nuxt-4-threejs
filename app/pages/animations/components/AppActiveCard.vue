<script setup lang="ts">
import {motion} from "motion-v";
defineProps<{
  activeCard: {
    title: string;
    subtitle: string;
    description: string;
    longDescription: string;
    image: string;
    logo: string;
  };
}>();

const emit = defineEmits<{
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

const el = useTemplateRef<HTMLDivElement>("el");

onClickOutside(el, () => {
  emit("set-active-card", null);
});
</script>

<template>
  <motion.div
    ref="el"
    :layout-id="`card-${activeCard.title}`"
    class="card card-active"
    :style="{borderRadius: 0}"
  >
    <div class="card-inner">
      <motion.img
        :layout-id="`image-${activeCard.title}`"
        :src="activeCard.image"
        alt=""
        :style="{borderRadius: 0}"
      />
      <motion.button
        :layout-id="`close-button-${activeCard.title}`"
        class="close-button"
        aria-label="Close button"
        @click="$emit('set-active-card', null)"
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
      <motion.div
        :layout-id="`card-content-${activeCard.title}`"
        class="card-content active-card-content"
      >
        <div class="card-text">
          <motion.h2
            :layout-id="`card-heading-${activeCard.title}`"
            class="card-heading"
          >
            Game of the day
          </motion.h2>
        </div>
        <motion.div
          :layout-id="`card-extra-info-${activeCard.title}`"
          class="extra-info"
          :style="{borderBottomLeftRadius: 20, borderBottomRightRadius: 20}"
        >
          <motion.img
            :src="activeCard.logo"
            width="40"
            height="40"
            alt=""
            :layout-id="`card-game-image-${activeCard.title}`"
            class="rounded-lg"
          />
          <div class="desc-wrapper">
            <motion.span
              :layout-id="`card-game-title-${activeCard.title}`"
              class="game-title"
            >
              {{ activeCard.title }}
            </motion.span>
            <motion.span
              :layout-id="`card-game-subtitle-${activeCard.title}`"
              class="game-subtitle"
            >
              {{ activeCard.description }}
            </motion.span>
          </div>
          <motion.button
            :layout-id="`card-button-${activeCard.title}`"
            class="get-button"
          >
            Get
          </motion.button>
        </motion.div>
      </motion.div>
    </div>

    <motion.div
      :layout-id="`card-long-description-${activeCard.title}`"
      class="long-description"
    >
      <p><b>Are you ready?</b> {{ activeCard.longDescription }}</p>
      <p>
        <b>The never ending adventure </b>
        In this game set in a fairy tale world, players embark on a quest
        through mystical lands filled with enchanting forests and towering
        mountains. Players can explore the world, build their own viking
      </p>
    </motion.div>
  </motion.div>
</template>

<style scoped></style>
