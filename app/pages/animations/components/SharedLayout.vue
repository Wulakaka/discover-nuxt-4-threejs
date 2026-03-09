<script setup lang="ts">
import {motion} from "motion-v";

const activeGame = ref<{
  title: string;
  description: string;
  longDescription: string;
  image: string;
} | null>(null);

const el = useTemplateRef<HTMLDivElement>("el");

onClickOutside(el, () => {
  activeGame.value = null;
});

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    activeGame.value = null;
  }
}

window.addEventListener("keydown", onKeyDown);

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
});

const GAMES = [
  {
    title: "The Odyssey",
    description: "Explore unknown galaxies.",
    longDescription:
      "Throughout their journey, players will encounter diverse alien races, each with their own unique cultures and technologies. Engage in thrilling space combat, negotiate complex diplomatic relations, and make critical decisions that affect the balance of power in the galaxy.",
    image:
      "https://animations.dev/how-i-use-framer-motion/how-i-code-animations/space.png",
  },
  {
    title: "Angry Rabbits",
    description: "They are coming for you.",
    longDescription:
      "The rabbits are angry and they are coming for you. You have to defend yourself with your carrot gun. The game is not simple, you have to be fast and accurate to survive.",
    image:
      "https://animations.dev/how-i-use-framer-motion/how-i-code-animations/rabbit.png",
  },
  {
    title: "Ghost town",
    description: "Find the ghosts.",
    longDescription:
      "You are in a ghost town and you have to find the ghosts. But be careful, they are dangerous.",
    image:
      "https://animations.dev/how-i-use-framer-motion/how-i-code-animations/ghost.webp",
  },
  {
    title: "Pirates in the jungle",
    description: "Find the treasure.",
    longDescription:
      "You are a pirate and you have to find the treasure in the jungle. But be careful, there are traps and wild animals.",
    image:
      "https://animations.dev/how-i-use-framer-motion/how-i-code-animations/pirate.png",
  },

  {
    title: "Lost in the mountains",
    description: "Find your way home.",
    longDescription:
      "You are lost in the mountains and you have to find your way home. But be careful, there are dangerous animals and you can get lost.",
    image:
      "https://animations.dev/how-i-use-framer-motion/how-i-code-animations/boy.webp",
  },
];
</script>

<template>
  <div>
    <AnimatePresence>
      <motion.div
        v-if="activeGame"
        class="overlay"
        :initial="{opacity: 0}"
        :animate="{opacity: 1}"
        :exit="{opacity: 0}"
      />
    </AnimatePresence>
    <AnimatePresence>
      <div v-if="activeGame" class="active-game">
        <motion.div
          ref="el"
          class="inner"
          :layout-id="`game-${activeGame.title}`"
          :style="{borderRadius: '12px'}"
          :transition="{
            layout: {
              duration: 0.5,
              type: 'spring',
              bounce: 0.2,
            },
          }"
        >
          <div class="header">
            <motion.img
              height="56"
              width="56"
              :src="activeGame.image"
              class="rounded-xl"
              :layout-id="`image-${activeGame.title}`"
            />
            <div class="header-inner">
              <div class="content-wrapper">
                <motion.h2
                  class="game-title"
                  :layout-id="`title-${activeGame.title}`"
                  >{{ activeGame.title }}</motion.h2
                >
                <motion.p
                  class="game-description"
                  :layout-id="`description-${activeGame.title}`"
                  >{{ activeGame.description }}</motion.p
                >
              </div>
              <motion.button
                class="button"
                :layout-id="`button-${activeGame.title}`"
              >
                Get
              </motion.button>
            </div>
          </div>

          <motion.p
            class="long-description"
            :initial="{opacity: 0}"
            :animate="{opacity: 1}"
            :exit="{opacity: 0}"
            :layout-id="`long-description-${activeGame.title}`"
            >{{ activeGame.longDescription }}</motion.p
          >
        </motion.div>
      </div>
    </AnimatePresence>
    <ul class="list">
      <motion.li
        v-for="game in GAMES"
        :key="game.title"
        :style="{borderRadius: '8px'}"
        :layout-id="`game-${game.title}`"
        @click="activeGame = game"
      >
        <motion.img
          height="56"
          width="56"
          alt=""
          :src="game.image"
          :layout-id="`image-${game.title}`"
          :style="{borderRadius: '12px'}"
        />
        <div class="game-wrapper">
          <div class="content-wrapper">
            <motion.h2 class="game-title" :layout-id="`title-${game.title}`">{{
              game.title
            }}</motion.h2>
            <motion.p
              class="game-description"
              :layout-id="`description-${game.title}`"
              >{{ game.description }}</motion.p
            >
          </div>
          <motion.button class="button" :layout-id="`button-${game.title}`">
            Get
          </motion.button>
        </div>
      </motion.li>
    </ul>
  </div>
</template>

<style scoped>
.list {
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  padding: 0;
  margin: 48px 0;
}

.list li {
  display: flex;
  width: 386px;
  cursor: pointer;
  align-items: center;
  gap: 16px;
  padding: 0;
}

.game-wrapper {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #d4d6d861;
}

.list li:last-of-type .game-wrapper {
  border: none;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
}

.active-game .content-wrapper {
  padding: 0;
}

.game-title {
  font-size: 14px;
  font-weight: 500;
}

.game-description {
  font-size: 14px;
  color: #63635d;
}

.button {
  border-radius: 9999px;
  background: #f1f0ef;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #007aff;
}

.active-game {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 10;
}

.active-game .inner {
  display: flex;
  height: fit-content;
  width: 500px;
  cursor: pointer;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  overflow: hidden;
  background: white;
  padding: 16px;
}

.header {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 16px;
}

.header-inner {
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: space-between;
}

.long-description {
  font-size: 14px;
  color: #63635d;
}

.overlay {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.2);
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
