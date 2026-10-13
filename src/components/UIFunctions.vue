<template>
  <!-- This component contains tour logic only; the UI is in UITour.vue. -->
  <span hidden aria-hidden="true"></span>
</template>

<script setup lang="ts">
/*///////////////////////////////////////////////////////////// Spherical Easel TypeScript ///////////////////////////////////////////////////////////////////////////////////////////*/

import { driver } from "driver.js";
import "driver.js/dist/driver.css";


// The steps of a tour, including the element to highlight and the popover content.
type TourStep = {
  element: string;
  title: string;
  description: string;
};

// Called by UITour.vue when a tour button is selected.
function selectTour(tourId: string): void {
  if (!(tourId in tourDefinitions)) {
    console.warn(`Unknown tour: ${tourId}`);
    return;
  }

  const steps = tourDefinitions[tourId as TourId].map((step) => ({
    element: step.element,
    popover: {
      title: step.title,
      description: step.description,
    },
  }));

  const driverObj = driver({
    showProgress: true,
    steps,
  });

  driverObj.drive();
}

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
// and it uses the driver.js library to display the tour steps.
type TourId = "createPoint" | "rotateSphere" | "createSegment" | "createCircle"; // $$$$ Step 1 create an ID $$$$


// The tour definitions are stored in a separate component to keep the logic organized and maintainable. //////////
const tourDefinitions: Record<TourId, TourStep[]> = { // $$$$ Step 2 record of tour steps $$$$

  createPoint: [
    {
      element: ".mdi-tools",
      title: "Tools Category",
      description: "Click here to open the Tools category if it is not already selected.",
    },
    {
      element: "#BasicTools",
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
    },
    {
      element: '.v-card:has(svg[aria-labelledby="point"])',
      title: "Create Point",
      description: "Select the Create Point tool.",
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Click anywhere on the sphere to place a point. You have created a point!",
    },
  ],

  rotateSphere: [
    {
      element: "#app",
      title: "Tour Prerequisite",
      description: 'This tour works best if you already have an object on the sphere. If needed, complete the "Create a Point" tour first.',
    },
    {
      element: ".mdi-tools",
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
    },
    {
      element: "#DisplayTools",
      title: "Display Tools",
      description: "Open the Display Tools category.",
    },
    {
      element: ".toolbutton:has(.mdi-rotate-3d-variant)",
      title: "Rotate Sphere Button",
      description: "Select the Rotate Sphere tool.",
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Click and drag on the canvas to rotate the sphere. A quick drag and release can make it continue spinning.",
    },
  ],

  createSegment: [
    {
      element: ".mdi-tools",
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
    },
    {
      element: "#BasicTools",
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
    },
    {
      element: '.v-card:has(svg[aria-labelledby="segment"])',
      title: "Create Segment",
      description: "Select the Create Segment tool. If this selector does not match your app's markup, update it to the segment tool's actual selector.",
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Click two locations on the sphere to create a line segment. You can also click and drag from the first location to the second.",
    },
  ],
  

  createCircle: [
    {
      element: ".mdi-tools",
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
    },
    {
      element: "#BasicTools",
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
    },
    {
      element: '.v-card:has(svg[aria-labelledby="circle"])',
      title: "Create Circle",
      description: "Select the Create Circle tool. If this selector does not match your app's markup, update it to the circle tool's actual selector.",
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Click two locations on the sphere to create a circle.",
    },
  ],



};




</script>
