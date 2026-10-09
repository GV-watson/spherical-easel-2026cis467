<script setup lang="ts">
/*
UITour.vue
Main UI component for the Tour system.

This file is responsible for:
Opening and closing the Tour tab
Displaying the search bar
Displaying the available tours
Selecting a tour
Calling the functions in UIFunctions.vue

 */

import { ref } from "vue";
import UIFunctions from "./UIFunctions.vue";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";


const isOpen = ref(false); // Controls whether the Tour tab is visible.
const searchText = ref(""); // Search text for the Tour search bar.

function openTourTab(): void { isOpen.value = true;} // Opens the Tour tab.
function closeTourTab(): void {isOpen.value = false;} // Closes the Tour tab.


// Starts the selected tour
// The actual tour definitions and logic are handled by UIFunctions.vue
function selectTour(tourId: string): void {
  console.log("Starting tour:", tourId);
  // Future:
  // Call the appropriate function from UIFunctions
}

// Sample tour for createPoint
function createPointTour(): void {
  const driverObj = driver({
    showProgress: true,
    steps: [
      { element: '.mdi-tools', 
        popover: {
          title: 'Tools Category',
          description: 'Click here to go to the Tools category (if not already).',
        },
      },
      { element: '#BasicTools',
        popover: {
          title: 'Basic Tools',
          description: 'Click here to open the Basic Tools section.',
        },
      },
      {
        element: '.v-card:has(svg[aria-labelledby="point"])',
        advanceOnClick: true,
        popover: {
          title: 'Create Point',
          description: 'Click to select the Create Point Tool.',
        },
      },
      {
        element: '#sphereContainer',
        popover: {
          title: 'Sphere Canvas',
          description: 'Place the point anywhere within the circle.\nYou have created a point!'
        },
      },
    ],
  });
  driverObj.drive();
  
};

function rotateSphereTour(): void {
  const driverObj = driver({
    showProgress: true,
    steps: [
      {
        element: '#app',
        popover: {
          title: 'Tour Prerequisite',
          description: 'This tour requires you to have an object on the sphere. Please create one now. If you do not know how, please check the "Create Point" tour.',
        },
      },
      {
        element: '.mdi-tools', 
        popover: {
          title: 'Tools Category',
          description: 'Click here to go to the Tools category (if not already).',
        },
      },
      {
        element: '#DisplayTools',
        popover: {
          title: 'Display Tools Category',
          description: 'Click here to enter the Display Tools category.',
        },
      },
      {
        element: '.toolbutton:has(.mdi-rotate-3d-variant)',
        popover: {
          title: 'Rotate Sphere Button',
          description: 'Click here to select the Rotate Sphere Button.',
        },
      },
      {
        element: '#sphereContainer',
        popover: {
          title: 'Sphere Canvas',
          description: 'Click and drag anywhere on the canvas to rotate the sphere! Clicking and letting go with velocity will make the sphere spin! Have fun!',
        }, 
      },
    ],
  });
  driverObj.drive();
  
}

// Search functionality will be added later
function searchTours(): void {
  // TODO: Search/filter available tours.
}


// Scroll functionality will be added later
function scrollTours(direction: "up" | "down"): void {
  // TODO: Scroll through available tours.
  console.log("Scroll:", direction);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
</script>


<template> 
  <!-- Open Tour Button -->
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

  <!-- Tour Tab -->
  <section
    v-else
    class="tour-panel"
    aria-label="Guided tours"
  >

    <!-- Tour Header -->
    <header class="tour-header">

      <h2>Tour</h2>
      <!-- Chevron closes the Tour tab ▲ ^ -->
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


    <!-- Search -->
    <div class="tour-search">
      <span class="search-icon"> ⌕ </span>
      <input
        v-model="searchText"
        type="text"
        placeholder="Search For Tour"
        aria-label="Search for tour"
        @input="searchTours"
      />
    </div>


    <!-- tour-list ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          The tours are provided by UIFunctions.vue.
          For now, these are placeholder buttons.
     -->

    <div class="tour-list-container">
      <div class="tour-list">


        <button
          type="button"
          class="tour-choice"
          @click="createPointTour">
          Create a Point
        </button>

        <button
          type="button"
          class="tour-choice"
          @click="rotateSphereTour">
          Rotate Sphere
        </button>

        <button
          type="button"
          class="tour-choice"
          @click="selectTour('createSegment')">
          Create a Line Segment
        </button>
      
        <!-- Add new tour button right here 
         
        <button type="button" class="tour-choice" @click="selectTour('testSegment')"> TEST  </button>
      
        -->
    
        <button type="button" class="tour-choice" @click="selectTour('testSegment')"> TEST  </button>

      </div>


      <!-- Scroll controls 
        <div class="tour-scroll-controls">
        <button
          type="button"
          aria-label="Scroll tours up"
          title="Scroll up"
          @click="scrollTours('up')"> 
          ▲
        </button>

        <button
          type="button"
          aria-label="Scroll tours down"
          title="Scroll down"
          @click="scrollTours('down')"> 
          ▼
        </button>
        </div>  
      -->

    </div>
  </section>
</template>


<style scoped>
/*
SE Color Hex codes: 
Main light green panels	  #D9F2DF
Sidebar/background green	#B9D9C1
Dark green sidebar	      #002108
Tool button green		      #8CCD8F
Dark text/icon color	    #212522
Light border/shadow green	#BED4C3
*/

/* Open Tour Button */
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
  border-radius: 12px
}

/* Tour Panel     */
.tour-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
  width: 360px;
  height: 480px;
  display: flex;
  flex-direction: column;
  background: #B9D9C1;
  border-radius: 12px
}

/* Header */
.tour-header {
  height: 62px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #002108;
  color: white;
  border-radius: 12px
}

.tour-header h2 {
  margin: 0;
  font-size: 20px;
  border-radius: 12px
}

/* Close Chevron        */
.close-button {
  width: 42px;
  height: 42px;
  background: #8CCD8F;
  color: #002108;
  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 12px
}

/* Search               */
.tour-search {
  margin: 14px;
  height: 46px;
  display: flex;
  align-items: center;
  background: #8CCD8F;
  border-radius: 12px
}

.search-icon {
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #002108;
  border-radius: 12px
}

.tour-search input {
  flex: 1;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: #002108;
  font-size: 14px;
  border-radius: 12px
}

.tour-search input::placeholder {
  color: #002108;
  border-radius: 12px
}

/* Tour List    */
.tour-list-container {
  flex: 1;
  min-height: 0;
  margin: 0 14px 14px;
  display: flex;
  background: #8CCD8F;
  border-radius: 12px
}

.tour-list {
  flex: 1;
  min-width: 0;
  padding: 8px;
  overflow: hidden;
  border-radius: 12px
}

/* Individual tour buttons */
.tour-choice {
  width: 100%;
  min-height: 54px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: #D9F2DF;
  color: #111;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  border-radius: 12px
}

.tour-choice:hover {
  background: #8CCD8F;
  border-radius: 12px
}

/*
Main light green panels	  #D9F2DF
Sidebar/background green	#B9D9C1
Dark green sidebar	      #002108
Tool button green		      #8CCD8F
Dark text/icon color	    #212522
Light border/shadow green	#BED4C3
*/

</style>