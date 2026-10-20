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

import { SEPoint } from "@/models-spherical/SEPoint";
import { SESegmentLength } from "@/models-spherical/SESegmentLength";

// The steps of a tour, including the element to highlight and the popover content.
type TourStep = {
  element: string;
  title: string;
  description: string;
  advanceOnClick?: boolean;
  waitFor?:
  "click" | //done
  "get-point" | //example
  "measure-segment" | //example

  "point-created" | //Wyatt
  "sphere-rotated" | //Wyatt
  "segment-created" | //Wyatt
  "circle-created" | //Wyatt

  "alt-circle-created" |
  "object-moved" |
  "alt-segment-created" |

  "behind-sphere-point-created" |
  "longer-than-Pi-tour" |
  "line-segment-measured" |
  "measurement-units-changed" |

  "right-triangle-created" |
  "equilateral-triangle-created";
};



//selectTour takes a tour ID, finds its definition, 
// and converts each step into the format Driver.js expects. 
// It also sets up any click listeners or Pinia watchers required by the step’s waitFor condition. 
// Once the steps are ready, it starts the tour.


function selectTour(tourId: string): void {
  // Look up the requested tour's step definitions.
  // The cast tells TypeScript to treat this string as one of the known TourId values.
  const selectedTour = tourDefinitions[tourId as TourId];


  // the newly selected SEPoint *************here*********************//
  let pointForLater: SEPoint | undefined;
  // the new SESegmentLength ****************here******************//
  let measurementForLater: SESegmentLength | undefined;
  //measurementForLaterStep?.seSegment // the measured SESegment


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

      // Capture a newly selected point so later steps can refer to it.
      if (step.waitFor === "get-point") {
        const alreadySelectedPointIds = new Set(
          seStore.selectedSENodules.filter((nodule): nodule is SEPoint => nodule instanceof SEPoint).map(point => point.id),);
        const stopWatching = watch(
          () =>
            seStore.selectedSENodules.filter((nodule): nodule is SEPoint => nodule instanceof SEPoint,), selectedPoints => {
              const newlySelectedPoint = selectedPoints.find(
                point => !alreadySelectedPointIds.has(point.id),
              );

              if (newlySelectedPoint) {
                pointForLater = newlySelectedPoint; // Save it for later tour steps!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                stopWatching();
                cleanupStep = undefined;
                driverObj.moveNext();
              }
            },
        );
        cleanupStep = stopWatching;
      }

      // Capture a newly created segment-length measurement.
      if (step.waitFor === "measure-segment") {
        const existingMeasurementIds = new Set(
          seStore.seExpressions
            .filter(
              (expression): expression is SESegmentLength =>
                expression instanceof SESegmentLength,
            )
            .map(measurement => measurement.id),
        );

        const stopWatching = watch(
          () =>
            seStore.seExpressions.filter(
              (expression): expression is SESegmentLength =>
                expression instanceof SESegmentLength,
            ),
          measurements => {
            const newMeasurement = measurements.find(
              measurement => !existingMeasurementIds.has(measurement.id),
            );

            if (newMeasurement) {
              measurementForLater = newMeasurement; // Save it for later tour steps!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
              stopWatching();
              cleanupStep = undefined;
              driverObj.moveNext();
            }
          },
        );

        cleanupStep = stopWatching;
      }

      // For a click step, advance when the highlighted element is clicked.
      if (step.waitFor === "click") {
        const handleClick = () => driverObj.moveNext();
        // { once: true } makes the browser remove the listener after its first click.
        element.addEventListener("click", handleClick, { once: true });
        // Save a cleanup function in case the user leaves this step before clicking.
        cleanupStep = () => element.removeEventListener("click", handleClick);
      }

      //For a segment-creation step, advance when the segment collection grows.
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

            //////// For a point-creation step, advance when a point is created.
            if (step.waitFor === "point-created") {
              // TODO: Detect when a new point is created.
            }

            if (step.waitFor === "measure-segment") {
              // TODO: Detect when the user selects a segment to measure.
            }

            //////// For a back-of-sphere point step, advance when the point is created.
            if (step.waitFor === "behind-sphere-point-created") {
              // TODO: Detect when a point is created on the back of the sphere.
            }

            //////// For a segment step using click and drag, advance when the segment is created.
            if (step.waitFor === "alt-segment-created") {
              // TODO: Detect when a segment is created using click and drag.
            }

            //////// For a segment longer than Pi, advance when the segment is created.
            if (step.waitFor === "longer-than-Pi-tour") {
              // TODO: Detect when a segment longer than Pi is created.
            }

            //////// For a circle-creation step, advance when a circle is created.
            if (step.waitFor === "circle-created") {
              // TODO: Detect when a new circle is created.
            }

            //////// For a circle step using click and drag, advance when the circle is created.
            if (step.waitFor === "alt-circle-created") {
              // TODO: Detect when a circle is created using click and drag.
            }

            //////// For a sphere-rotation step, advance when the sphere is rotated.
            if (step.waitFor === "sphere-rotated") {
              // TODO: Detect when the sphere is rotated.
            }

            //////// For an object-movement step, advance when an object is moved.
            if (step.waitFor === "object-moved") {
              // TODO: Detect when an existing object is moved.
            }

            //////// For a measurement step, advance when the segment is measured.


            //////// For a line-segment measurement, advance when the measurement is created.
            if (step.waitFor === "line-segment-measured") {
              // TODO: Detect when a line segment measurement is created.
            }

            //////// For a measurement-units step, advance when the units are changed.
            if (step.waitFor === "measurement-units-changed") {
              // TODO: Detect when the measurement units are changed.
            }

            //////// For a right-triangle step, advance when the triangle is completed.
            if (step.waitFor === "right-triangle-created") {
              // TODO: Detect when the right triangle is completed.
            }

            //////// For an equilateral-triangle step, advance when the triangle is completed.
            if (step.waitFor === "equilateral-triangle-created") {
              // TODO: Detect when the equilateral triangle is completed.
            }

            //////// For a point-selection step, advance when the user selects a point.

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
type TourId =
  | "createPoint"
  | "rotateSphere"
  | "createSegment"
  | "createCircle"
  | "createPoint"
  | "rotateSphere"
  | "createSegment"
  | "createCircle"
  | "createAltSegment"
  | "createBehindSpherePoint"
  | "createLongerThanPiSegment"
  | "createAltCircle"
  | "moveObject"
  | "measureSegment"
  | "changeMeasurementUnits"
  | "createRightTriangle"
  | "createEquilateralTriangle";

// The tour definitions are stored in a separate component to keep the logic organized and maintainable. //////////
const tourDefinitions: Record<TourId, TourStep[]> = {

  createPoint: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Click here to go to the Tools category (if not already).",
      waitFor: "click", //
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Click here to open the Basic Tools section.",
      waitFor: "click", //
    },
    {
      element: '[data-tour="bu-point"]',
      title: "Create Point",
      description: "Click to select the Create Point Tool.",
      waitFor: "click", //

    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Place the point anywhere within the circle.\nYou have created a point!",
      //need waitfor
    },
  ],

  rotateSphere: [
    {
      element: "#app",
      title: "Tour Prerequisite",
      description: 'This tour requires you to have an object on the sphere. Please create one now. If you do not know how, please check the "Create Point" tour.',
      waitFor: "click", //
    },
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Click here to go to the Tools category (if not already).",
      waitFor: "click", //

    },
    {
      element: '[data-tour="gr-DisplayTools"]',
      title: "Display Tools Category",
      description: "Click here to enter the Display Tools category.",
      waitFor: "click", //
    },
    {
      element: '[data-tour="bu-rotate"]',
      title: "Rotate Sphere Button",
      description: "Click here to select the Rotate Sphere Button.",
      waitFor: "click", //
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Click and drag anywhere on the canvas to rotate the sphere! Clicking and letting go with velocity will make the sphere spin! Have fun!",
      //need waitfor
    },
  ],

  createSegment: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: "click", //
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: "click", //

    },
    {
      element: '[data-tour="bu-segment"]',
      title: "Create Segment",
      description: "Click to select the segment tool.",
      waitFor: "click", //
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
      waitFor: "click", //

    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: "click", //

    },
    {
      element: '[data-tour="bu-circle"]',
      title: "Create Circle",
      description: "Select the Create Circle tool.",
      waitFor: "click", //

    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Click two locations on the sphere to create a circle.",
      //need waitfor
    },
  ],

  // Alternate way to create a segment using click and drag.
  createAltSegment: [
    // TODO: Activate the Segment tool.
    // TODO: Click and drag between two locations on the sphere.
    // TODO: Wait for "alt-segment-created".
  ],

  // Create a point on the back of the sphere.
  createBehindSpherePoint: [
    // TODO: Activate the Point tool.
    // TODO: Hold Shift and click on the sphere.
    // TODO: Wait for "behind-sphere-point-created".
  ],

  // Create a segment with a length greater than Pi.
  createLongerThanPiSegment: [
    // TODO: Activate the Segment tool.
    // TODO: Hold Control while creating the segment.
    // TODO: Wait for "longer-than-Pi-tour".
  ],

  // Alternate way to create a circle using click and drag.
  createAltCircle: [
    // TODO: Activate the Circle tool.
    // TODO: Click and drag to create the circle.
    // TODO: Wait for "alt-circle-created".
  ],

  // Move an existing geometric object.
  moveObject: [
    // TODO: Create or require an existing geometric object.
    // TODO: Activate the Move Objects tool.
    // TODO: Click and drag the object.
    // TODO: Wait for "object-moved".
  ],

  // Measure the length of a line segment.
  measureSegment: [
    // TODO: Create or require an existing segment.
    // TODO: Activate the Line Segment Length tool.
    // TODO: Select the segment to measure.
    // TODO: Wait for "line-segment-measured".
  ],

  // Change the units of an existing measurement.
  changeMeasurementUnits: [
    // TODO: Create and measure a line segment.
    // TODO: Open the Objects panel and Measurements section.
    // TODO: Change the measurement units.
    // TODO: Wait for "measurement-units-changed".
  ],

  // Construct a right triangle using a perpendicular line.
  createRightTriangle: [
    // TODO: Create a line segment.
    // TODO: Activate the Perpendicular tool and select the segment.
    // TODO: Select an endpoint to create the perpendicular line.
    // TODO: Create the remaining triangle segments.
    // TODO: Hide the perpendicular line.
    // TODO: Wait for "right-triangle-created".
  ],

  // Construct an equilateral triangle using two intersecting circles.
  createEquilateralTriangle: [
    // TODO: Create a line segment with endpoints P1 and P2.
    // TODO: Create a circle centered at P1 containing P2.
    // TODO: Create a circle centered at P2 containing P1.
    // TODO: Connect P1 and P2 to the same circle intersection point.
    // TODO: Wait for "equilateral-triangle-created".
  ]


};


</script>
