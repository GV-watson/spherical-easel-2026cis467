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

  "point-created" |
  "sphere-rotated" |
  "segment-created" |
  "circle-created" |

  // "alt-circle-created" |
  "object-moved" |
  // "alt-segment-created" |

  "behind-sphere-point-created" |
  "longer-than-Pi-tour" |
  "line-segment-measured" |
  "measurement-units-changed" |

  "right-triangle-created" |
  "create-90-degree-angle" |


  "equilateral-triangle-created" |
  "has-object" |
  "has-segment" |
  "has-measurement" |
  "has-movable-point";
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

      // For a click step, advance when the highlighted element is clicked.
      if (step.waitFor === "click") {
        const handleClick = () => driverObj.moveNext();
        // { once: true } makes the browser remove the listener after its first click.
        element.addEventListener("click", handleClick, { once: true });
        // Save a cleanup function in case the user leaves this step before clicking.
        cleanupStep = () => element.removeEventListener("click", handleClick);
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
          },
        );

        // Save the watcher's stop function to clean it up if this step is left early.
        cleanupStep = stopWatching;
      }

      //////// For a point-creation step, advance when a point is created.
      if (step.waitFor === "point-created") {
        // Capture how many points existed when this step began.
        const startingCount = seStore.sePoints.length;

        // Watch the reactive Pinia collection for a new point.
        const stopWatching = watch(
          () => seStore.sePoints.length,
          currentCount => {
            // A larger count means at least one point was added.
            if (currentCount > startingCount) {
              stopWatching();
              cleanupStep = undefined;
              driverObj.moveNext();
            }
          },
        );

        // Save the watcher's stop function to clean it up if this step is left early.
        cleanupStep = stopWatching;
      }

      // Advance when a new segment-length measurement is created.
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
            // Find a measurement created after this step began.
            const newMeasurement = measurements.find(
              measurement => !existingMeasurementIds.has(measurement.id),
            );

            if (newMeasurement) {
              stopWatching();
              cleanupStep = undefined;
              driverObj.moveNext();
            }
          },
        );

        // Stop watching if the user leaves this step early.
        cleanupStep = stopWatching;
      }

      //////// For a back-of-sphere point step, advance when the point is created.
      if (step.waitFor === "behind-sphere-point-created") {
        // TODO: Detect when a point is created on the back of the sphere.
      }

      /*
      //////// For a segment step using click and drag, advance when the segment is created.
      if (step.waitFor === "alt-segment-created") {
        // TODO: Detect when a segment is created using click and drag.
      }
      */

      //////// For a segment longer than Pi, advance when the segment is created.
      if (step.waitFor === "longer-than-Pi-tour") {
        // Do not count segments that already exist.
        const existingSegmentIds = new Set(
          seStore.seSegments.map(segment => segment.id),
        );
        const startingCount = seStore.seSegments.length;
        // Watch Pinia to see if a segment greater than Pi has been made.
        const stopWatching = watch(
          () => seStore.seSegments.length,
          currentCount => {
            if (currentCount <= startingCount) return; // If for some reason the count is less than starting, stop.
            // This will find a segment if it's larger than Pi and isn't on the sphere originally.
            const longerSegment = seStore.seSegments.find(
              segment =>
                !existingSegmentIds.has(segment.id) && // If it didn't already exist
                segment.arcLength > Math.PI,           // If the arc length is greater than Pi.
            );
            // If the segment was found, clean up and stop watching. 
            if (longerSegment) {
              stopWatching();
              cleanupStep = undefined;
              driverObj.moveNext();
            }
          },
        );
        cleanupStep = stopWatching;
      }

      //////// For a circle-creation step, advance when a circle is created.
      if (step.waitFor === "circle-created") {
        // Capture how many circles existed when this step began.
        const startingCount = seStore.seCircles.length;

        // Watch the reactive Pinia collection for a new circle.
        const stopWatching = watch(
          () => seStore.seCircles.length,
          currentCount => {
            // A larger count means at least one circle was added.
            if (currentCount > startingCount) {
              stopWatching();
              cleanupStep = undefined;
              driverObj.moveNext();
            }
          },
        );

        // Save the watcher's stop function to clean it up if this step is left early.
        cleanupStep = stopWatching;
      }
      /*
            //////// For a circle step using click and drag, advance when the circle is created.
            if (step.waitFor === "alt-circle-created") {
              // TODO: Detect when a circle is created using click and drag.
            }
      */

      //////// For a sphere-rotation step, advance when the sphere is rotated.
      if (step.waitFor === "sphere-rotated") {
        // Capture the current rotation matrix of the sphere.
        const startingRotation =
          seStore.inverseTotalRotationMatrix.elements.join(",");

        // Watch for changes to the sphere's rotation matrix.
        const stopWatching = watch(
          () => seStore.inverseTotalRotationMatrix.elements.join(","),
          currentRotation => {
            // A different matrix means the sphere has rotated.
            if (currentRotation !== startingRotation) {
              stopWatching();
              cleanupStep = undefined;
              driverObj.moveNext();
            }
          },
        );

        // Save the watcher's stop function to clean it up if this step is left early.
        cleanupStep = stopWatching;
      }

      //////// For an object-movement step, advance when an object is moved.
      if (step.waitFor === "object-moved") {
        // Save each existing object's position when this tour step starts.
        const startingPositions = new Map(
          seStore.sePoints.map(point => [
            point.id,
            point.locationVector.toArray().join(","), // Convert the vector to a string for easy comparison.
          ]),
        );

        // Watch the positions so a change to an existing object can be detected.
        const stopWatching = watch(
          () =>
            seStore.sePoints
              .map(point => `${point.id}:${point.locationVector.toArray().join(",")}`)
              .join("|"), () => {

                // Check only objects that existed when the step began.
                const moved = seStore.sePoints.some(
                  point =>
                    startingPositions.has(point.id) &&
                    startingPositions.get(point.id) !== point.locationVector.toArray().join(","),
                );

                // Stop watching and advance once an existing object has moved.
                if (moved) {
                  stopWatching();
                  cleanupStep = undefined;
                  driverObj.moveNext();
                }
              },
        );

        // Keep the stop function so leaving the step early removes the watcher.
        cleanupStep = stopWatching;
      }

      // Advance when a new line-segment measurement is created.
      if (step.waitFor === "line-segment-measured") {
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
              stopWatching();
              cleanupStep = undefined;
              driverObj.moveNext();
            }
          },
        );

        cleanupStep = stopWatching;
      }

      // Advance when the measurement units change.
      if (step.waitFor === "measurement-units-changed") {
        const startingUnits = seStore.seExpressions
          .filter(
            (expression): expression is SESegmentLength =>
              expression instanceof SESegmentLength,
          )
          .map(measurement => `${measurement.id}:${measurement.value}`);

        const stopWatching = watch(
          () =>
            seStore.seExpressions
              .filter(
                (expression): expression is SESegmentLength =>
                  expression instanceof SESegmentLength,
              )
              .map(measurement => `${measurement.id}:${measurement.value}`),
          currentMeasurements => {
            // Advance when an existing measurement's displayed value changes.
            const unitsChanged = currentMeasurements.some(
              (measurement, index) =>
                startingUnits[index] !== measurement,
            );

            if (unitsChanged) {
              stopWatching();
              cleanupStep = undefined;
              driverObj.moveNext();
            }
          },
        );

        // Stop watching if the user leaves this step early.
        cleanupStep = stopWatching;
      }





      //////// For a right-triangle step, advance when the final side is created.
      if (step.waitFor === "right-triangle-created") {
        const startingCount = seStore.seSegments.length;
        const stopWatching = watch(
          () => seStore.seSegments.length,
          currentCount => {
            if (currentCount >= startingCount + 1) {
              stopWatching();
              cleanupStep = undefined;
              driverObj.moveNext();
            }
          },
        );
        cleanupStep = stopWatching;
      }

      //////// For an equilateral-triangle step, advance when the final side is created.
      if (step.waitFor === "equilateral-triangle-created") {
        const startingCount = seStore.seSegments.length;
        const stopWatching = watch(
          () => seStore.seSegments.length,
          currentCount => {
            if (currentCount >= startingCount + 1) {
              stopWatching();
              cleanupStep = undefined;
              driverObj.moveNext();
            }
          },
        );
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
// Each tour consists of a series of steps, including the element to highlight and the popover content.
// The selectTour function is called by UITour.vue when a tour button is clicked,
// and it uses the tour definitions below to display the correct tour.
type TourId =
  | "createPoint"
  | "rotateSphere"
  | "createSegment"
  | "createCircle"
  //  | "createAltSegment"
  | "createBehindSpherePoint"
  | "createLongerThanPiSegment"
  //  | "createAltCircle"
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
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Click here to open the Basic Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-point"]',
      title: "Create Point",
      description: "Click to select the Create Point Tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Place the point anywhere within the circle.\nYou have created a point!",
      waitFor: "point-created",
    },
  ],

  rotateSphere: [
    {
      element: "#app",
      title: "Tour Prerequisite",
      description: 'This tour requires an object on the sphere. Create a point, segment, or circle if you do not already have one.',
      waitFor: "has-object",
    },
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Click here to go to the Tools category (if not already).",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-DisplayTools"]',
      title: "Display Tools Category",
      description: "Click here to enter the Display Tools category.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-rotate"]',
      title: "Rotate Sphere Button",
      description: "Click here to select the Rotate Sphere Button.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Click and drag anywhere on the canvas to rotate the sphere! Clicking and letting go with velocity will make the sphere spin! Have fun!",
      waitFor: "sphere-rotated",
    },
  ],

  createSegment: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-segment"]',
      title: "Create Segment",
      description: "Click to select the segment tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Create a segment",
      description: "Click two points on the sphere to create a segment, or click and drag to create a segment.",
      waitFor: "segment-created", // Wait for the user to create a segment before proceeding to the next step.
    },
  ],


  createCircle: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-circle"]',
      title: "Create Circle",
      description: "Select the Create Circle tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Click two locations on the sphere to create a circle, or click and drag to create a circle.",
      waitFor: "circle-created",
    },
  ],

  // Create a point on the back of the sphere.
  createBehindSpherePoint: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-point"]',
      title: "Create Point",
      description: "Select the Create Point tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Create a Point on the Back",
      description: "Hold Shift and click on the sphere canvas to create a point on the back of the sphere.",
      waitFor: "behind-sphere-point-created",
    },
  ],

  // Create a segment with a length greater than Pi.
  createLongerThanPiSegment: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: "click",

    },
    {
      element: '[data-tour="bu-segment"]',
      title: "Create Segment",
      description: "Click to select the segment tool.",
      waitFor: "click",
    },
    {
      element: '#sphereContainer',
      title: "Create the Segment",
      description: "While holding CTRL (control), click and drag from one location to another on the sphere to make the segment.",
      waitFor: "longer-than-Pi-tour",
    },
  ],

  // Move an existing geometric object.
  moveObject: [
    {
      element: "#app",
      title: "Tour Prerequisite",
      description: "This tour needs a movable point on the sphere. Create one if you do not already have one.",
      waitFor: "has-movable-point",
    },
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-DisplayTools"]',
      title: "Display Tools",
      description: "Open the Display Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-move"]',
      title: "Move Tool",
      description: "Select the Move tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Move an Object",
      description: "Click and drag any movable object to a new location on the sphere.",
      waitFor: "object-moved",
    },
  ],

  measureSegment: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-segment"]',
      title: "Create Segment",
      description: "Select the Segment tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Create a Segment",
      description: "Click two locations on the sphere to create a line segment.",
      waitFor: "segment-created",
    },
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-MeasurementTools"]',
      title: "Measurement Tools",
      description: "Open the Measurement Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-segmentLength"]',
      title: "Line Segment Length",
      description: "Select the Line Segment Length tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Measure the Segment",
      description: "Click the segment you just created. Its length will appear on the sphere and in the Objects panel.",
      waitFor: "measure-segment",
    },
  ],

  // Change the units of an existing measurement.
  changeMeasurementUnits: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-segment"]',
      title: "Create Segment",
      description: "Select the Segment tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Create a Segment",
      description: "Click two locations on the sphere to create a line segment.",
      waitFor: "segment-created",
    },
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-MeasurementTools"]',
      title: "Measurement Tools",
      description: "Open the Measurement Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-segmentLength"]',
      title: "Line Segment Length",
      description: "Select the Line Segment Length tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Measure the Segment",
      description: "Click the segment you just created. Its length measurement will appear.",
      waitFor: "measure-segment",
    },
    {
      element: '[data-tour="ta-obj"]',
      title: "Objects Category",
      description: "Open the Objects panel.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-expression"]',
      title: "Measurements Section",
      description: "Open the Measurements section.",
      waitFor: "click",
    },
    {
      element: "#app",
      title: "Change Units",
      description: "Find the measurement you just created and click its change-units icon. The units cycle through decimals, multiples of Pi, and degrees.",
      waitFor: "measurement-units-changed",
    },
  ],

  // Construct a right triangle using a perpendicular line.
  createRightTriangle: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-segment"]',
      title: "Create the Base Segment",
      description: "Select the Segment tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Create the Base Segment",
      description: "Click two locations on the sphere to create the base of the triangle.",
      waitFor: "segment-created",
    },
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-ConstructionTools"]',
      title: "Construction Tools",
      description: "Open the Construction Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-perpendicular"]',
      title: "Perpendicular Tool",
      description: "Select the Perpendicular tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Select the Base Segment",
      description: "Click the base segment away from its endpoints.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Choose an Endpoint",
      description: "Click one endpoint of the base segment to construct a perpendicular line through it.",
      waitFor: "click",
    },
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-segment"]',
      title: "Segment Tool",
      description: "Select the Segment tool to draw the two remaining sides.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Create the First Side",
      description: "Click the other endpoint of the base, then click a point on the perpendicular line.",
      waitFor: "segment-created",
    },
    {
      element: "#sphereContainer",
      title: "Complete the Triangle",
      description: "Click the new point on the perpendicular line, then click the first endpoint of the base to close the triangle.",
      waitFor: "right-triangle-created",
    },
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-DisplayTools"]',
      title: "Display Tools",
      description: "Open the Display Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-hide"]',
      title: "Hide Tool",
      description: "Select the Hide tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Hide the Perpendicular Line",
      description: "Click the portion of the perpendicular line that is not covered by a triangle side.",
      waitFor: "click",
    },
  ],

  // Construct an equilateral triangle using two intersecting circles.
  createEquilateralTriangle: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: "click",
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: "click",
    },
    {
      element: '[data-tour="bu-segment"]',
      title: "Create the Base Segment",
      description: "Select the Segment tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Create the Base Segment",
      description: "Click two locations to create the base segment, with endpoints P1 and P2.",
      waitFor: "segment-created",
    },
    {
      element: '[data-tour="bu-circle"]',
      title: "Circle Tool",
      description: "Select the Circle tool.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Create the First Circle",
      description: "Click P1, then click P2. This creates a circle centered at P1 that passes through P2.",
      waitFor: "circle-created",
    },
    {
      element: "#sphereContainer",
      title: "Create the Second Circle",
      description: "With the Circle tool still active, click P2, then click P1 to create the second circle.",
      waitFor: "circle-created",
    },

    {
      element: '[data-tour="bu-segment"]',
      title: "Segment Tool",
      description: "Select the Segment tool to connect the circle intersection to each endpoint.",
      waitFor: "click",
    },
    {
      element: "#sphereContainer",
      title: "Connect P1 to the Intersection",
      description: "Click P1, then click one of the two circle intersection points.",
      waitFor: "segment-created",
    },
    {
      element: "#sphereContainer",
      title: "Complete the Equilateral Triangle",
      description: "Click P2, then click the same circle intersection point to complete the triangle.",
      waitFor: "equilateral-triangle-created",
    },
  ],
};



</script>
