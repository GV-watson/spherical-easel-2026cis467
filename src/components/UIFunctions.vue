<template>
  <!-- This component contains tour logic only; the UI is in UITour.vue. -->
  <span hidden aria-hidden="true"></span>
</template>

<script setup lang="ts">
/*///////////////////////////////////////////////////////////// Spherical Easel TypeScript ///////////////////////////////////////////////////////////////////////////////////////////*/

import { driver } from "driver.js";
import "driver.js/dist/driver.css";


//******************************************************* */  watching for click and object creation
import { watch } from "vue"; 
import { useSEStore } from "@/stores/se"; 

// The steps of a tour, including the element to highlight and the popover content.
type TourStep = {
  element: string;
  title: string;
  description: string;
  advanceOnClick?: boolean;
  waitFor?: "click" | "segment-created"
};

function selectTour(tourId: string): void {
  const selectedTour = tourDefinitions[tourId as TourId];
  if (!selectedTour) return;

  const seStore = useSEStore();
  let cleanupStep: (() => void) | undefined;
  let driverObj: ReturnType<typeof driver>;

  const steps = selectedTour.map(step => ({
    element: step.element,
    popover: {
      title: step.title,
      description: step.description,
    },

    onHighlighted: (element?: Element) => {
      cleanupStep?.();
      cleanupStep = undefined;

      if (!element) {
        return;
      }

      if (step.waitFor === "click") {
        const handleClick = () => driverObj.moveNext();
        element.addEventListener("click", handleClick, { once: true });
        cleanupStep = () =>
          element.removeEventListener("click", handleClick);
      }

      if (step.waitFor === "segment-created") {
        const startingCount = seStore.seSegments.length;
        const stopWatching = watch(
          () => seStore.seSegments.length,
          currentCount => {
            if (currentCount > startingCount) {
              stopWatching();
              cleanupStep = undefined;
              driverObj.moveNext();
            }
          },
        );
        cleanupStep = stopWatching;
      }
    },

    onDeselected: () => {
      cleanupStep?.();
      cleanupStep = undefined;
    },
  }));

  driverObj = driver({
    showProgress: true,
    steps,
  });

  driverObj.drive();
}


//******************************************************* 


/* Called by UITour.vue when a tour button is selected.
function selectTour(tourId: string): void {
  if (!Object.hasOwn(tourDefinitions, tourId)) {
    console.warn(`Unknown tour: ${tourId}`);
    return;
  }

  const selectedTour = tourDefinitions[tourId as TourId];

  const steps = selectedTour.map((step) => ({
    element: step.element,
    popover: {
      title: step.title,
      description: step.description,
    },
    ...(step.advanceOnClick ? { onNextClick: () => driverObj.moveNext() } : {}),
  }));

  const driverObj = driver({
    showProgress: true,
    steps,
  });

  driverObj.drive();
}
  */

// Search filtering is currently owned by UITour.vue. This function is exposed
// so the parent and child are connected; it can be expanded later if needed.
function searchTours(query: string): void {
  console.debug("Tour search:", query);
}

// Expose the functions to the parent component (UITour.vue) so it can call them 
// when a tour button is clicked or when the search input changes.
defineExpose({ selectTour, searchTours }); 



// The tour definitions are stored in a separate component to keep the logic organized and maintainable. 
// Each tour consists of a series of steps, each with an element to highlight and a popover with a title and description. 
// The selectTour function is called by UITour.vue when a tour button is clicked, 
// and it uses the driver.js library to display the tour.
type TourId = "createPoint" | "rotateSphere" | "createSegment" | "createCircle"; // $$$$ Step 1 create an ID $$$$


// The tour definitions are stored in a separate component to keep the logic organized and maintainable. //////////
const tourDefinitions: Record<TourId, TourStep[]> = { // $$$$ Step 2 record of tour steps $$$$

  createPoint: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Click here to go to the Tools category (if not already).",
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Click here to open the Basic Tools section.",
    },
    {
      element: '[data-tour="bu-point"]',
      title: "Create Point",
      description: "Click to select the Create Point Tool.",
      advanceOnClick: true,
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Place the point anywhere within the circle.\nYou have created a point!",
    },
  ],

  rotateSphere: [
    {
      element: "#app",
      title: "Tour Prerequisite",
      description: 'This tour requires you to have an object on the sphere. Please create one now. If you do not know how, please check the "Create Point" tour.',
    },
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Click here to go to the Tools category (if not already).",
    },
    {
      element: '[data-tour="gr-DisplayTools"]',
      title: "Display Tools Category",
      description: "Click here to enter the Display Tools category.",
    },
    {
      element: '[data-tour="bu-rotate"]',
      title: "Rotate Sphere Button",
      description: "Click here to select the Rotate Sphere Button.",
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Click and drag anywhere on the canvas to rotate the sphere! Clicking and letting go with velocity will make the sphere spin! Have fun!",
    },
  ],

  createSegment: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
    },
    {
  element: '[data-tour="bu-segment"]',
  title: "Create Segment",
  description: "Click to select the segment tool.",
  waitFor: "click", // Wait for the user to click the segment tool button before proceeding to the next step.
},
{
  element: "#sphereContainer",
  title: "Create a segment",
  description: "Click two points on the sphere to create a segment.",
  waitFor: "segment-created", // Wait for the user to create a segment before proceeding to the next step.
},
  ],
  

  createCircle: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
    },
    {
      element: '[data-tour="bu-circle"]',
      title: "Create Circle",
      description: "Select the Create Circle tool.",
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Click two locations on the sphere to create a circle.",
    },
  ],



};




</script>
