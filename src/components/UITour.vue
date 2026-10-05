<template>
  <!-- The tooltip sticks to whatever the current step points at.
       "interactive" lets you actually click the Next button inside it. -->
  <VTooltip
    v-model="showUITour"
    :activator="currentStep.target"
    location="right"
    interactive>
    <div>
      <div>{{ currentStep.message }}</div>
      <!-- Click to go to the next step (this replaced the old timer) -->
      <v-btn size="small" class="mt-2" @click="nextStep">
        {{ isLastStep ? "Done" : "Next" }}
      </v-btn>
      <span class="ml-2">{{ stepIndex + 1 }}/{{ steps.length }}</span>
    </div>
  </VTooltip>
</template>
<script lang="ts" setup>
/*
 * First prototype for "how to make a point" tour (Ben).
 *
 * What I changed:
 *  - Got rid of the timer that switched tooltips every 2 seconds.
 *  - The tour is now a list of steps, each with a target and a message.
 *  - You click Next to move forward instead of waiting.
 *
 * What it can't do yet:
 *  - The steps are hardcoded.
 *  - It only points at the Basic Tools panel, not the Point button itself.
 *    (That would need ids added in ToolButton.vue.)
 *  - It can't detect whether you actually made a point.
 */
import { computed, ref } from "vue";
import { VTooltip } from "vuetify/components";

// Step = what to point at + what to say
type TourStep = { target: string; message: string };

const steps: TourStep[] = [
  {
    target: "#BasicTools",
    message: "Open Basic Tools and select the Point tool."
  },
  {
    target: "#BasicTools",
    message: "Now click the sphere to place a point."
  }
];

const showUITour = ref(true);
const stepIndex = ref(0);
const currentStep = computed(() => steps[stepIndex.value]);
const isLastStep = computed(() => stepIndex.value === steps.length - 1);

// Go to the next step. On the last one, close the tour and start over.
function nextStep() {
  if (isLastStep.value) {
    showUITour.value = false;
    stepIndex.value = 0;
  } else {
    stepIndex.value++;
  }
}
</script>
