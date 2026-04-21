<script setup lang="tsx">
import {AnimatePresence, motion} from "motion-v";
import Spinner from "../animations/components/Spinner.vue";

const open = ref(false);
const formState = ref("idle");
const feedback = ref("");
const el = useTemplateRef("ref");

onClickOutside(el, () => {
  console.log("clicked outside");
  open.value = false;
});

function submit() {
  formState.value = "loading";
  setTimeout(() => {
    formState.value = "success";
  }, 1500);

  setTimeout(() => {
    open.value = false;
  }, 3300);
}

watchEffect((onCleanUp) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      open.value = false;
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "Enter" &&
      open.value &&
      formState.value === "idle"
    ) {
      submit();
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  onCleanUp(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });
});

const MyComponent = () => (
  <div class="feedback-wrapper">
    <button
      onClick={() => {
        open.value = true;
        formState.value = "idle";
        feedback.value = "";
      }}
      class="feedback-button"
    >
      <span>Feedback</span>
    </button>
    {open.value ? (
      <div class="feedback-popover" ref="el">
        <span
          aria-hidden
          class="placeholder"
          data-feedback={feedback.value ? "true" : "false"}
        >
          Feedback
        </span>

        {formState.value === "success" ? (
          <div class="success-wrapper">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
                fill="#2090FF"
                fill-opacity="0.16"
              />
              <path
                d="M12.1334 16.9667L15.0334 19.8667L19.8667 13.1M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
                stroke="#2090FF"
                stroke-width="2.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <h3>Feedback received!</h3>
            <p>Thanks for helping me improve Sonner.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!feedback.value) return;
              submit();
            }}
            class="feedback-form"
          >
            <textarea
              auto-focus
              placeholder="Feedback"
              onChange={(e: Event) =>
                (feedback.value = (e.target as HTMLTextAreaElement).value)
              }
              class="textarea"
              required
            />
            <div class="feedback-footer">
              <svg
                class="dotted-line"
                width="352"
                height="2"
                viewBox="0 0 352 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 1H352" stroke="#E6E7E8" stroke-dasharray="4 4" />
              </svg>
              <div class="half-circle-left">
                <svg
                  width="6"
                  height="12"
                  viewBox="0 0 6 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_2029_22)">
                    <path
                      d="M0 2C0.656613 2 1.30679 2.10346 1.91341 2.30448C2.52005 2.5055 3.07124 2.80014 3.53554 3.17157C3.99982 3.54301 4.36812 3.98396 4.6194 4.46927C4.87067 4.95457 5 5.47471 5 6C5 6.52529 4.87067 7.04543 4.6194 7.53073C4.36812 8.01604 3.99982 8.45699 3.53554 8.82843C3.07124 9.19986 2.52005 9.4945 1.91341 9.69552C1.30679 9.89654 0.656613 10 0 10V6V2Z"
                      fill="#F5F6F7"
                    />
                    <path
                      d="M1 12V10C2.06087 10 3.07828 9.57857 3.82843 8.82843C4.57857 8.07828 5 7.06087 5 6C5 4.93913 4.57857 3.92172 3.82843 3.17157C3.07828 2.42143 2.06087 2 1 2V0"
                      stroke="#E6E7E8"
                      stroke-width="1"
                      stroke-linejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2029_22">
                      <rect width="6" height="12" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>

              <div class="half-circle-right">
                <svg
                  width="6"
                  height="12"
                  viewBox="0 0 6 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_2029_22)">
                    <path
                      d="M0 2C0.656613 2 1.30679 2.10346 1.91341 2.30448C2.52005 2.5055 3.07124 2.80014 3.53554 3.17157C3.99982 3.54301 4.36812 3.98396 4.6194 4.46927C4.87067 4.95457 5 5.47471 5 6C5 6.52529 4.87067 7.04543 4.6194 7.53073C4.36812 8.01604 3.99982 8.45699 3.53554 8.82843C3.07124 9.19986 2.52005 9.4945 1.91341 9.69552C1.30679 9.89654 0.656613 10 0 10V6V2Z"
                      fill="#F5F6F7"
                    />
                    <path
                      d="M1 12V10C2.06087 10 3.07828 9.57857 3.82843 8.82843C4.57857 8.07828 5 7.06087 5 6C5 4.93913 4.57857 3.92172 3.82843 3.17157C3.07828 2.42143 2.06087 2 1 2V0"
                      stroke="#E6E7E8"
                      stroke-width="1"
                      stroke-linejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2029_22">
                      <rect width="6" height="12" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>

              <button type="submit" class="submit-button">
                {/* We already built this one in the animate presence part */}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    transition={{
                      type: "spring",
                      duration: 0.3,
                      bounce: 0,
                    }}
                    initial={{opacity: 0, y: -25}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 25}}
                    key={formState.value}
                  >
                    {formState.value === "loading" ? (
                      <Spinner size={14} color="rgba(255, 255, 255, 0.65)" />
                    ) : (
                      <span>Send feedback</span>
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </form>
        )}
      </div>
    ) : null}
  </div>
);
</script>

<template>
  <MyComponent />
</template>

<style>
.feedback-wrapper {
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.feedback-button {
  position: relative;
  display: flex;
  height: 36px;
  align-items: center;
  border-radius: 8px;
  border: 1px solid #e9e9e7;
  background: white;
  padding: 0 12px;
  font-weight: 500;
  outline: none;
}

.feedback-button span {
  display: block;
  font-size: 14px;
}

.feedback-popover {
  position: absolute;
  height: 192px;
  width: 364px;
  overflow: hidden;
  border-radius: 12px;
  background: #f5f6f7;
  padding: 4px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.08),
    0px 2px 2px rgba(0, 0, 0, 0.04);
  outline: none;
}

.placeholder {
  position: absolute;
  font-size: 14px;
  color: #63635d;
  left: 16px;
  top: 17px;
}

.success-wrapper {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.success-wrapper svg {
  margin-top: -4px;
}

.success-wrapper h3 {
  margin-bottom: 4px;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #21201c;
}

.success-wrapper p {
  font-size: 14px;
  color: #63635d;
}

.feedback-form {
  border-radius: 8px;
  border: 1px solid #e6e7e8;
  background: white;
}

.textarea {
  width: 100%;
  height: 128px;
  resize: none;
  border-radius: 8px 0;
  padding: 12px;
  font-size: 14px;
  outline: none;
}

.textarea::placeholder {
  opacity: 0;
}

.feedback-footer {
  position: relative;
  display: flex;
  height: 48px;
  align-items: center;
  padding: 0 10px;
}

.dotted-line {
  position: absolute;
  left: 0;
  right: 0;
  top: -1px;
}

.half-circle-left {
  position: absolute;
  left: 0;
  top: 0;
  transform: translateX(-1.5px) translateY(-50%);
}

.half-circle-right {
  position: absolute;
  right: 0;
  top: 0;
  transform: translateX(1.5px) translateY(-50%) rotate(180deg);
}

.submit-button {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  height: 24px;
  width: 104px;
  overflow: hidden;
  background: linear-gradient(180deg, #1994ff 0%, #157cff 100%);
  box-shadow:
    0px 0px 1px 1px rgba(255, 255, 255, 0.08) inset,
    0px 1px 1.5px 0px rgba(0, 0, 0, 0.32),
    0px 0px 0px 0.5px #1a94ff;
  position: relative;
}

.submit-button span {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  color: white;
  text-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.16);
}

.wrapper {
  height: var(--spinner-size, 20px);
  width: var(--spinner-size, 20px);
}

.spinner {
  position: relative;
  top: 50%;
  left: 50%;
  height: var(--spinner-size, 20px);
  width: var(--spinner-size, 20px);
}
</style>
