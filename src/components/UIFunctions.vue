<template>
  <!-- This component contains tour logic only; the UI is in UITour.vue. -->
  <span hidden aria-hidden="true"></span>
</template>

<script setup lang="ts">
/*///////////////////////////////////////////////////////////// Spherical Easel TypeScript ///////////////////////////////////////////////////////////////////////////////////////////*/

import { driver } from "driver.js";
import "driver.js/dist/driver.css";


//******************************************************* */  Driver.js watching for click and object creation
import { watch } from "vue"; 
import { useSEStore } from "@/stores/se";

// The steps of a tour, including the element to highlight and the popover content.
type TourStep = {
  element: string;
  title: string;
  description: string;
  advanceOnClick?: boolean;
  waitFor?: 
  "click" | //done
  "get-point" |  

  "measure-segment" |
  "point-created" | 
  "sphere-rotated" |
  "segment-created" | //done ?

  "alt-segment-created" |
  "behind-sphere-point-created" |
  "longer-than-Pi-tour" |

  "circle-created" |
  "alt-circle-created" |

  "object-moved" |
  "line-segment-measured" |
  "measurement-units-changed" |

  "right-triangle-created" |
  "equilateral-triangle-created"
  ; 
  
};


//selectTour takes a tour ID, finds its definition, 
// and converts each step into the format Driver.js expects. 
// It also sets up any click listeners or Pinia watchers required by the step’s waitFor condition. 
// Once the steps are ready, it starts the tour.
function selectTour(tourId: string): void {
  // Look up the requested tour's step definitions.
  // The cast tells TypeScript to treat this string as one of the known TourId values.
  const selectedTour = tourDefinitions[tourId as TourId];

  if (!selectedTour) return;  // Stop if the ID doesn't match a defined tour.

  const seStore = useSEStore();   // Get the Pinia store so a tour step can observe created objects.
  // const { seSegments } = storeToRefs(useSEStore()); //could make that dependency more explicit


  // Holds the cleanup function for the current step's click listener or store watcher.
  let cleanupStep: (() => void) | undefined;

  // Declared here so callbacks below can use the Driver.js instance after it is created.
  let driverObj: ReturnType<typeof driver>;

  // Convert this tour's step definitions into the format Driver.js expects.
  const steps = selectedTour.map(step => ({

    // CSS selector for the page element Driver.js highlights.
    element: step.element,

    // Text shown in the Driver.js popover.
    popover: {
      title: step.title,
      description: step.description,
    },

    // Runs when Driver.js highlights this step.
    onHighlighted: (element?: Element) => {

      // Remove the previous step's listener if one is still active.
      cleanupStep?.();
      cleanupStep = undefined;

      // There may be no matching element on the page
      // don't set up detection in that case.
      if (!element) {
        return;
      }

      //////// For a click step, advance when the highlighted element is clicked.
      if (step.waitFor === "click") {
        const handleClick = () => driverObj.moveNext();
        // { once: true } makes the browser remove the listener after its first click.
        element.addEventListener("click", handleClick, { once: true });
        // Save a cleanup function in case the user leaves this step before clicking.
        cleanupStep = () => element.removeEventListener("click", handleClick);
      }

      //////// For a segment-creation step, advance when the segment collection grows.
      if (step.waitFor === "segment-created") {
        // Capture how many segments existed when this step began.
        const startingCount = seStore.seSegments.length;
        // Watch the reactive Pinia collection for a new segment.
        const stopWatching = watch(
          () => seStore.seSegments.length,
          currentCount => {
            // A larger count means at least one segment was added.
            if (currentCount > startingCount) {
              stopWatching(); // Stop watching after the condition succeeds.
              cleanupStep = undefined;
              driverObj.moveNext(); // Advance to the next tour step.
            }
          },
        );

        // Save the watcher's stop function to clean it up if this step is left early.
        cleanupStep = stopWatching;
      }

    



    },//End onhighlight

    //////// Runs when the user leaves this step, including when advancing.
    onDeselected: () => {
      // Prevent an old listener or watcher from triggering after this step ends.
      cleanupStep?.();
      cleanupStep = undefined;
    },



  }));

  // Create the Driver.js tour using the converted steps.
  driverObj = driver({
    showProgress: true, // Show the step counter/progress indicator.
    steps,
  });

  // Start the tour.
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
type TourId = "createPoint" | "rotateSphere" | "createSegment" | "createCircle"; 

// The tour definitions are stored in a separate component to keep the logic organized and maintainable. //////////
const tourDefinitions: Record<TourId, TourStep[]> = { 

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
      waitFor: "click", // Wait for the user to click the segment tool button before proceeding to the next step.

    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: "click", // Wait for the user to click the segment tool button before proceeding to the next step.

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
