<template>
  <!-- This card sits over the easel and contains the tour menu and current instructions. -->
  <section v-if="!isMinimized" class="tour-box" aria-label="Guided tours">
    <header class="tour-header">

      <h2>Wyatt Demo</h2> <!-- dark header -->
      <button
        type="button"
        class="minimize-button"
        aria-label="Minimize tour menu"
        title="Minimize tour menu"
        @click="isMinimized = true">−</button>
    </header>

    <!-- Show the list of tours until the user chooses one. -->
    <template v-if="!selectedTour">
      <div class="tour-menu">
        <p>Choose a tour</p>

        <!-- Each menu button starts the tour that matches its id. -->
        <button
          v-for="tour in tours"
          :key="tour.id"
          type="button"
          class="tour-choice"
          @click="startTour(tour.id)">
          {{ tour.title }}

          <!-- Tours without instructions are labeled so their unfinished state is clear. -->
        </button>
      </div>
    </template>

    <!-- Display the active instruction and step controls while the tour is running. -->
    <template v-else-if="!isFinished">

      <div class="tour-content">
        <h3>{{ selectedTour.title }}</h3>
        <p>{{ currentStep }}</p> <!-- The instruction changes when Next or Prev is clicked. -->
      </div>

      <footer class="tour-controls">
        <!-- Prev is disabled on the first step because there is no earlier instruction. -->
        <button type="button" 
        :disabled="stepIndex === 0" 
        @click="previousStep"> Prev
        </button>

        <!-- Show the current position within this tour. -->
        <span>{{ stepIndex + 1 }}/{{ selectedTour.steps.length }}</span>
        <button 
        type="button" 
        @click="nextStep">
          {{ stepIndex === selectedTour.steps.length - 1 ? "Finish tour" : "Next" }}
        </button>

      </footer>
    </template>

    <!-- Once the last instruction is finished, invite the user back to the menu. -->
    <template v-else>
      <div class="tour-content">
        <h3>Tour complete!</h3>
        <p>{{ finishMessage }}</p>
      </div>

      <footer 
        class="tour-controls tour-controls-end">
        <button type="button" 
        @click="returnToTours">Back to tours</button>
      </footer>
    </template>
  </section>
  <button
    v-else
    type="button"
    class="restore-button"
    aria-label="Open tour menu"
    title="Open tour menu"
    @click="isMinimized = false">Tours</button>
</template>

<!-- 

 <VTooltip :activator="tooltipAnchor" v-model="showUITour"  position="right" :text="tooltipText" /> 


<template>
  <span>Tutorial Mode {{ tooltipIndex }}/{{ anchors.length }}</span> 
  
  <VTooltip
    :activator="tooltipAnchor" 
    v-model="showUITour" 
    
    position="right" 
    :text="`This is a tooltip inserted programmatically by UITutor to ${tooltipAnchor}`"/>

  </template>

-->


<script lang="ts" setup>
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Vue refs hold values that change, and computed values update when those refs change.
import { computed, ref } from "vue";

// TourId limits menu choices to the tours listed below. 
// each tour has a title and ordered instructions.
type TourId = "createPoint" | "createLineSegment" | "createLine" | "createCircle";
type Tour = {
  id: TourId;
  title: string;
  steps: string[];
};

// Keep the tour catalog in one place so adding steps to the other demos is simple.
const tours: Tour[] = [
  {
    id: "createPoint", 
    title: "Create a Point",
    steps: [
      "Open the Tools tab on the left.",
      "Open Basic Tools.",
      "Select Create Point.",
      "Click anywhere inside the circle to place a point.",
      "Open the Objects tab to see your new point in the object list.",
  ] },

  { id: "createLineSegment", title: "Create a Line Segment", steps: [
      "Open the Tools tab on the left.",
      "Open Basic Tools.",
      "Select Create Point.",
      "Click anywhere inside the circle to place a point.",
      "Open the Objects tab to see your new point in the object list.",

   ] },

  { id: "createLine", title: "Create a Line", steps: [ ] },

  { id: "createCircle", title: "Create a Circle", steps: [ ] }
];

// The following refs and computed values track the current tour and step,

const selectedTourId = ref <TourId | null>(null); // null means the tour menu is currently shown.
const stepIndex = ref(0);                         // The array position of the instruction currently shown.
const isFinished = ref(false);                    // Turns on the completion screen after the final instruction.
const isMinimized = ref(false);                   // Hides the tour card while preserving its current tour state.

                                                  // Look up the full tour record from the selected id 
                                                  // null returns the view to the menu.
const selectedTour = computed(
  () => tours.find(tour => tour.id === selectedTourId.value) ?? null
);

                                                  // Find the instruction for this step, 
                                                  // or use placeholder text when a tour has no steps yet.
const currentStep = computed(
  () => selectedTour.value?.steps[stepIndex.value] ?? "This tour is being prepared."
);

                                                  // The completion message encourages returning to the list
                                                  // and trying another tour.
const finishMessage = computed(() =>
  selectedTourId.value === "createPoint"
    ? "You can now choose another tour from the tour menu."
    : "Choose another tour from the tour menu when you are ready."
);

//Tooling to start, advance, and finish a tour. These functions are called from the template above.

function startTour(id: TourId): void {
                                                //Find the selected tour so empty tours                                                 
  const tour = tours.find(item => item.id === id);
  //Tours without steps remain selectable and show a small placeholder message.
  selectedTourId.value = id;
  stepIndex.value = 0;
  isFinished.value = Boolean(tour && tour.steps.length === 0);
}

function nextStep(): void {
  // Do nothing if there is no selected tour to advance.
  if (!selectedTour.value) return;

  // Advance while another instruction remains; otherwise show the completion screen.
  if (stepIndex.value < selectedTour.value.steps.length - 1) {
    stepIndex.value++;
  } else {
    isFinished.value = true;
  }
}

function previousStep(): void {
  // Keep the index at zero rather than moving before the first instruction.
  if (stepIndex.value > 0) stepIndex.value--;
}

function returnToTours(): void {
  // Clear the active tour and reset its progress before showing the menu again.
  selectedTourId.value = null;
  stepIndex.value = 0;
  isFinished.value = false;
}

//////////////////////////////////
/*

//import { onBeforeUnmount, onMounted, ref } from "vue";      // Imports lifecycle hooks and reactive refs
import { computed, ref } from "vue";                         // Imports the computed and ref functions from Vue for reactivity
// ref: Creates reactive references to hold state variables
// computed: Creates reactive computed properties that automatically update when their dependencies change

import { VTooltip } from "vuetify/components";              

const showUITour = ref(true);                               // Starts the tutorial with the tooltip visible
const tooltipIndex = ref(0);                          // Tracks the current step in the tutorial sequence

const tooltipAnchor = computed(() => anchors[tooltipIndex.value].selector);  
// Dynamically computes the selector of the current tutorial target based on the tooltip index
const tooltipText = computed(() => anchors[tooltipIndex.value].text);

//let timeoutHandle: number | null = null;                    // Stores the interval ID so it can be cleared later

const nextStep = () => { tooltipIndex.value = (tooltipIndex.value + 1) % anchors.length; }; 
// Advances to the next step in the tutorial, wrapping around to the first step after the last

const anchors = [          // Defines the ordered list of tutorial targets and their tooltip text
  {
    selector: "#BasicTools",                                  // ID of the element the tooltip will point to
    text: " Create Points lines segments circles and text"   // Tooltip text for Basic Tools
  },

  {
    selector: "#EditTools",                                 
    text: "Select Point and Delete"                                                
  },

  {
    selector: "#DisplayTools",                             
    text: "Display tools:..."                                                
  },

  {
    selector: "#ConstructionTools",                        
   text: "Construction tools:...        "                                                 
  },

  {
    selector: "#MeasurementTools",                          
      text: "Measurement tools:..."                                                
    },

  {
    selector: "#ConicTools",                                
    text: "Conic tools:..."                                                
  } 

];


*/

///////////////////////////////////////////////////////////////////////////////////////////////////////////
</script>

<style scoped>
/* Position the card near the top-right of the drawing area and allow scrolling/resizing. */
.tour-box {
  position: absolute;
  z-index: 20;
  top: 4px;
  right: 8px;
  width: min(345px, 34vw);
  min-width: 260px;
  min-height: 245px;
  max-height: calc(100% - 16px);
  overflow: auto;
  resize: both;
  background: #b9d9c1;
  color: #102316;
  box-shadow: 0 2px 8px #0003;
}

.tour-header {
  /* Match the dark green title bar in the tour sketch. */
  padding: 18px 16px;
  background: #002108;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tour-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.minimize-button,
.restore-button {
  border: 0;
  background: #8ccd8f;
  color: #102316;
  cursor: pointer;
  font-size: 1.25rem;
}

.minimize-button {
  width: 32px;
  height: 32px;
  line-height: 1;
}

.restore-button {
  position: absolute;
  z-index: 20;
  top: 4px;
  right: 8px;
  min-height: 40px;
  padding: 0 14px;
  box-shadow: 0 2px 8px #0003;
}

.tour-menu,
.tour-content {
  /* Give the menu and instructions comfortable space inside the card. */
  padding: 16px;
}

.tour-menu p {
  margin: 0 0 12px;
}

.tour-choice {
  /* Make each tour option a full-width button that is easy to select. */
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin: 6px 0;
  padding: 10px;
  border: 0;
  background: #8ccd8f;
  color: #102316;
  cursor: pointer;
  text-align: left;
}

.tour-choice:hover,
.tour-controls button:hover {
  filter: brightness(0.96);
}

.coming-soon {
  /* Visually distinguish tours that have not been written yet. */
  font-size: 0.75rem;
  font-style: italic;
}

.tour-content h3 {
  margin: 0 0 14px;
  font-size: 1rem;
}

.tour-content p {
  /* Reserve room for instructions so the navigation controls stay in place. */
  min-height: 58px;
  margin: 0;
  line-height: 1.5;
}

.tour-controls {
  /* Keep Prev, progress, and Next aligned across the bottom of the card. */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 10px 10px;
}

.tour-controls button {
  min-width: 76px;
  min-height: 44px;
  border: 0;
  background: #8ccd8f;
  color: #102316;
  cursor: pointer;
}

.tour-controls button:disabled {
  cursor: default;
  opacity: 0.5;
}

.tour-controls-end {
  justify-content: center;
}

@media (max-width: 700px) {
  /* Narrow the card on smaller screens while preserving a usable button width. */
  .tour-box {
    width: min(320px, calc(100vw - 24px));
    min-width: 240px;
  }
}
</style>
s
