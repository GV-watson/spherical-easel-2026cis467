<template>
  <!-- Mount the logic component so its exposed functions are available. -->
  <UIFunctions ref="uiFunctions" />

  <!-- The open button is hidden when the tour panel is open. -->
  <button
    v-if="!isOpen"
    type="button"
    class="tour-open-button"
    aria-label="Open Tour menu"
    title="Open Tour menu"
    @click="openTourTab"
  >
    ?
  </button>

  <!-- The tour panel is hidden when the open button is visible. -->
  <section v-else class="tour-panel" aria-label="Guided tours">
    <header class="tour-header">
      <h2>Tour</h2>
      <button
        type="button"
        class="close-button"
        aria-label="Close Tour menu"
        title="Close Tour menu"
        @click="closeTourTab"
      >
        ^
      </button>
    </header>

    <!-- The search input is used to filter the list of tours. -->
    <div class="tour-search">
      <span class="search-icon">⌕</span>
      <input
        v-model="searchText"
        type="text"
        placeholder="Search For Tour"
        aria-label="Search for tour"
        @input="searchTours"
      />
    </div>

    <!-- $$$$ Step 3 Create Tour Button $$$$-->
    <div class="tour-list-container">

      <div class="tour-list">
        <button
          v-for="tour in filteredTours"
          :key="tour.id"
          type="button"
          class="tour-choice"
          @click="selectTour(tour.id)"
        >
          {{ tour.label }}
        </button>

        <p v-if="filteredTours.length === 0" class="no-tours-found">
          No tours found.
        </p>
      </div>



    </div>
  </section>
</template>

<script setup lang="ts">
/*///////////////////////////////////////////////////////////// Spherical Easel TypeScript ///////////////////////////////////////////////////////////////////////////////////////////*/

/* Displays the Tour panel and calls the tour functions exposed by UIFunctions.vue. */

import { computed, ref } from "vue";
import UIFunctions from "./UIFunctions.vue";

const isOpen = ref(false); // Controls whether the tour panel is open or closed.
const searchText = ref("");  // The text entered in the search input to filter the list of tours.

// The available tours and the labels displayed in the Tour panel.
const tours = [
  { id: "createPoint", label: "Create a Point" },
  { id: "rotateSphere", label: "Rotate Sphere" },
  { id: "createSegment", label: "Create a Line Segment" },
  { id: "createCircle", label: "Create a Circle" },
];

// Filter the tour buttons based on the text entered in the search input.
const filteredTours = computed(() => {
  const query = searchText.value.trim().toLowerCase();
  return tours.filter((tour) => tour.label.toLowerCase().includes(query));
});

// The ref to the UIFunctions component, which exposes the selectTour and searchTours functions. */
const uiFunctions = ref<{
  selectTour: (tourId: string) => void; // Called by the tour buttons to start a tour.
  searchTours: (query: string) => void; // Called by the search input. The text is passed to the child component.
} | null>(null); 

function openTourTab(): void { isOpen.value = true; } // Called by the open button to show the tour panel.

function closeTourTab(): void { isOpen.value = false; } // Called by the close button to hide the tour panel.

function selectTour(tourId: string): void { uiFunctions.value?.selectTour(tourId); } // Called by the tour buttons to start a tour.

function searchTours(): void { uiFunctions.value?.searchTours(searchText.value); } // Passes the search text to UIFunctions.vue.


</script>

<style scoped>
/*///////////////////////////////////////////////////////////// Spherical Easel CSS ///////////////////////////////////////////////////////////////////////////////////////////*/
.tour-open-button {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
  width: 42px;
  height: 42px;
  background: #8ccd8f;
  color: #102316;
  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 12px;
}

.tour-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
  width: 360px;
  height: 480px;
  display: flex;
  flex-direction: column;
  background: #b9d9c1;
  border-radius: 12px;
}

.tour-header {
  min-height: 62px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #002108;
  color: white;
  border-radius: 12px;
}

.tour-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-button {
  width: 42px;
  height: 42px;
  background: #8ccd8f;
  color: #002108;
  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 12px;
}

.tour-search {
  margin: 14px;
  height: 46px;
  display: flex;
  align-items: center;
  background: #8ccd8f;
  border-radius: 12px;
}

.search-icon {
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #002108;
}

.tour-search input {
  flex: 1;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: #002108;
  font-size: 14px;
}

.tour-search input::placeholder {
  color: #002108;
}

.tour-list-container {
  flex: 1;
  min-height: 0;
  margin: 0 14px 14px;
  display: flex;
  background: #8ccd8f;
  border-radius: 12px;
}

.tour-list {
  flex: 1;
  min-width: 0;
  padding: 8px;
  overflow-y: auto;
  border-radius: 12px;
}

.tour-choice {
  width: 100%;
  min-height: 54px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: #d9f2df;
  color: #111;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  border-radius: 12px;
}

.tour-choice:hover {
  background: #8ccd8f;
}

.no-tours-found {
  margin: 12px;
  color: #002108;
  font-size: 14px;
}
</style>
