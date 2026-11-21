/* Tour definitions and reusable wait conditions for the guided tours. */
import { watch } from "vue";
import { useSEStore } from "@/stores/se";
import { SEPoint } from "@/models-spherical/SEPoint";
import { SELine } from "@/models-spherical/SELine";
import { SESegment } from "@/models-spherical/SESegment";
import { SEPerpendicularLineThruPoint } from "@/models-spherical/SEPerpendicularLineThruPoint";
import { SESegmentLength } from "@/models-spherical/SESegmentLength";

// 1 To Add new tours create a tour id and a label for the button in the tour tab
export const tours = [

  //{ id: "create_Demo", label: "tours.create_Demo.label" },

  { id: "createPoint", label: "tours.createPoint.label" },
  { id: "rotateSphere", labelKey: "tours.rotateSphere.label" },
  { id: "createSegment", labelKey: "tours.createSegment.label" },
  { id: "createCircle", labelKey: "tours.createCircle.label" },
  { id: "createBehindSpherePoint", labelKey: "tours.createBehindSpherePoint.label" },
  { id: "createLongerThanPiSegment", labelKey: "tours.createLongerThanPiSegment.label" },
  { id: "moveObject", labelKey: "tours.moveObject.label" },
  { id: "measureSegment", labelKey: "tours.measureSegment.label" },
  { id: "changeMeasurementUnits", labelKey: "tours.changeMeasurementUnits.label" },
  { id: "createRightTriangle", labelKey: "tours.createRightTriangle.label" },
  { id: "createEquilateralTriangle", labelKey: "tours.createEquilateralTriangle.label" },
] as const;


// 2 Then define the steps for each tour in the tourDefinitions object.
// Each tour is an array of steps. Each step has a target element, translation keys, and a waitFor function.
export const tourDefinitions = {


  /*
  create_Demo: [
    {
      element: '[data-tour="bu-point"]',
      titleKey: "tours.create_Demo.steps.1.title",
      descriptionKey: "tours.create_Demo.steps.1.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.create_Demo.steps.1.title",
      descriptionKey: "tours.create_Demo.steps.1.description",
      waitFor: pointCreated(),
    },
  ],
  */



  // Construct a right triangle using a perpendicular line.
  createRightTriangle: [
    {
      element: "#sphereContainer",
      titleKey: "tours.createRightTriangle.steps.1.title",
      descriptionKey: "tours.createRightTriangle.steps.1.description",
      waitFor: hasSegment(),
    },
    {
      element: '[data-tour="ta-tools"]',
      titleKey: "tours.createRightTriangle.steps.2.title",
      descriptionKey: "tours.createRightTriangle.steps.2.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-ConstructionTools"]',
      titleKey: "tours.createRightTriangle.steps.3.title",
      descriptionKey: "tours.createRightTriangle.steps.3.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-perpendicular"]',
      titleKey: "tours.createRightTriangle.steps.4.title",
      descriptionKey: "tours.createRightTriangle.steps.4.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.createRightTriangle.steps.5.title",
      descriptionKey: "tours.createRightTriangle.steps.5.description",
      waitFor: rightAnglePerpendicularCreated(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      titleKey: "tours.createRightTriangle.steps.6.title",
      descriptionKey: "tours.createRightTriangle.steps.6.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-segment"]',
      titleKey: "tours.createRightTriangle.steps.7.title",
      descriptionKey: "tours.createRightTriangle.steps.7.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.createRightTriangle.steps.8.title",
      descriptionKey: "tours.createRightTriangle.steps.8.description",
      waitFor: secondSideCreated(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.createRightTriangle.steps.9.title",
      descriptionKey: "tours.createRightTriangle.steps.9.description",
      waitFor: triangleClosed(),
    },
    {
      element: '[data-tour="gr-DisplayTools"]',
      titleKey: "tours.createRightTriangle.steps.10.title",
      descriptionKey: "tours.createRightTriangle.steps.10.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-hide"]',
      titleKey: "tours.createRightTriangle.steps.11.title",
      descriptionKey: "tours.createRightTriangle.steps.11.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.createRightTriangle.steps.12.title",
      descriptionKey: "tours.createRightTriangle.steps.12.description",
      waitFor: perpendicularHidden(),
    },
  ],

  // Construct an equilateral triangle using two intersecting circles.
  createEquilateralTriangle: [
    {
      element: '[data-tour="ta-tools"]',
      titleKey: "tours.createEquilateralTriangle.steps.1.title",
      descriptionKey: "tours.createEquilateralTriangle.steps.1.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      titleKey: "tours.createEquilateralTriangle.steps.2.title",
      descriptionKey: "tours.createEquilateralTriangle.steps.2.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-segment"]',
      titleKey: "tours.createEquilateralTriangle.steps.3.title",
      descriptionKey: "tours.createEquilateralTriangle.steps.3.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.createEquilateralTriangle.steps.4.title",
      descriptionKey: "tours.createEquilateralTriangle.steps.4.description",
      waitFor: segmentCreated(),
    },
    {
      element: '[data-tour="bu-circle"]',
      titleKey: "tours.createEquilateralTriangle.steps.5.title",
      descriptionKey: "tours.createEquilateralTriangle.steps.5.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.createEquilateralTriangle.steps.6.title",
      descriptionKey: "tours.createEquilateralTriangle.steps.6.description",
      waitFor: circleCreated(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.createEquilateralTriangle.steps.7.title",
      descriptionKey: "tours.createEquilateralTriangle.steps.7.description",
      waitFor: circleCreated(),
    },
    {
      element: '[data-tour="bu-segment"]',
      titleKey: "tours.createEquilateralTriangle.steps.8.title",
      descriptionKey: "tours.createEquilateralTriangle.steps.8.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.createEquilateralTriangle.steps.9.title",
      descriptionKey: "tours.createEquilateralTriangle.steps.9.description",
      waitFor: segmentCreated(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.createEquilateralTriangle.steps.10.title",
      descriptionKey: "tours.createEquilateralTriangle.steps.10.description",
      waitFor: equilateralTriangleCreated(),
    },
  ],


  createPoint: [
    /*{
    element: '[data-tour="ta-tools"]',
     titleKey: "tours.createPoint.steps.1.title",
     descriptionKey: "tours.createPoint.steps.1.description",
     waitFor: click(),
   },*/
    {
      element: '[data-tour="gr-BasicTools"]',
      titleKey: "tours.createPoint.steps.2.title",
      descriptionKey: "tours.createPoint.steps.2.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-point"]',
      titleKey: "tours.createPoint.steps.3.title",
      descriptionKey: "tours.createPoint.steps.3.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.createPoint.steps.4.title",
      descriptionKey: "tours.createPoint.steps.4.description",
      waitFor: pointCreated(),
    },
  ],

  rotateSphere: [
    {
      element: "#app",
      titleKey: "tours.rotateSphere.steps.1.title",
      descriptionKey: "tours.rotateSphere.steps.1.description",
      waitFor: hasObject(),
    },
    {
      element: '[data-tour="ta-tools"]',
      titleKey: "tours.rotateSphere.steps.2.title",
      descriptionKey: "tours.rotateSphere.steps.2.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-DisplayTools"]',
      titleKey: "tours.rotateSphere.steps.3.title",
      descriptionKey: "tours.rotateSphere.steps.3.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-rotate"]',
      titleKey: "tours.rotateSphere.steps.4.title",
      descriptionKey: "tours.rotateSphere.steps.4.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.rotateSphere.steps.5.title",
      descriptionKey: "tours.rotateSphere.steps.5.description",
      waitFor: sphereRotated(),
    },
  ],

  createSegment: [
    {
      element: '[data-tour="ta-tools"]',
      titleKey: "tours.createSegment.steps.1.title",
      descriptionKey: "tours.createSegment.steps.1.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      titleKey: "tours.createSegment.steps.2.title",
      descriptionKey: "tours.createSegment.steps.2.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-segment"]',
      titleKey: "tours.createSegment.steps.3.title",
      descriptionKey: "tours.createSegment.steps.3.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.createSegment.steps.4.title",
      descriptionKey: "tours.createSegment.steps.4.description",
      waitFor: segmentCreated(),
    },
  ],


  createCircle: [
    {
      element: '[data-tour="ta-tools"]',
      titleKey: "tours.createCircle.steps.1.title",
      descriptionKey: "tours.createCircle.steps.1.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      titleKey: "tours.createCircle.steps.2.title",
      descriptionKey: "tours.createCircle.steps.2.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-circle"]',
      titleKey: "tours.createCircle.steps.3.title",
      descriptionKey: "tours.createCircle.steps.3.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.createCircle.steps.4.title",
      descriptionKey: "tours.createCircle.steps.4.description",
      waitFor: circleCreated(),
    },
  ],

  // Create a point on the back of the sphere.
  createBehindSpherePoint: [
    {
      element: '[data-tour="ta-tools"]',
      titleKey: "tours.createBehindSpherePoint.steps.1.title",
      descriptionKey: "tours.createBehindSpherePoint.steps.1.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      titleKey: "tours.createBehindSpherePoint.steps.2.title",
      descriptionKey: "tours.createBehindSpherePoint.steps.2.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-point"]',
      titleKey: "tours.createBehindSpherePoint.steps.3.title",
      descriptionKey: "tours.createBehindSpherePoint.steps.3.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.createBehindSpherePoint.steps.4.title",
      descriptionKey: "tours.createBehindSpherePoint.steps.4.description",
      waitFor: behindSpherePointCreated(),
    },
  ],

  // Create a segment with a length greater than Pi.
  createLongerThanPiSegment: [
    {
      element: '[data-tour="ta-tools"]',
      titleKey: "tours.createLongerThanPiSegment.steps.1.title",
      descriptionKey: "tours.createLongerThanPiSegment.steps.1.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      titleKey: "tours.createLongerThanPiSegment.steps.2.title",
      descriptionKey: "tours.createLongerThanPiSegment.steps.2.description",
      waitFor: click(),

    },
    {
      element: '[data-tour="bu-segment"]',
      titleKey: "tours.createLongerThanPiSegment.steps.3.title",
      descriptionKey: "tours.createLongerThanPiSegment.steps.3.description",
      waitFor: click(),
    },
    {
      element: '#sphereContainer',
      titleKey: "tours.createLongerThanPiSegment.steps.4.title",
      descriptionKey: "tours.createLongerThanPiSegment.steps.4.description",
      waitFor: longerThanPiSegmentCreated(),
    },
  ],

  // Move an existing geometric object.
  moveObject: [
    {
      element: "#app",
      titleKey: "tours.moveObject.steps.1.title",
      descriptionKey: "tours.moveObject.steps.1.description",
      waitFor: hasMovablePoint(),
    },
    {
      element: '[data-tour="ta-tools"]',
      titleKey: "tours.moveObject.steps.2.title",
      descriptionKey: "tours.moveObject.steps.2.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-DisplayTools"]',
      titleKey: "tours.moveObject.steps.3.title",
      descriptionKey: "tours.moveObject.steps.3.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-move"]',
      titleKey: "tours.moveObject.steps.4.title",
      descriptionKey: "tours.moveObject.steps.4.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.moveObject.steps.5.title",
      descriptionKey: "tours.moveObject.steps.5.description",
      waitFor: objectMoved(),
    },
  ],

  measureSegment: [
    {
      element: '[data-tour="ta-tools"]',
      titleKey: "tours.measureSegment.steps.1.title",
      descriptionKey: "tours.measureSegment.steps.1.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      titleKey: "tours.measureSegment.steps.2.title",
      descriptionKey: "tours.measureSegment.steps.2.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-segment"]',
      titleKey: "tours.measureSegment.steps.3.title",
      descriptionKey: "tours.measureSegment.steps.3.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.measureSegment.steps.4.title",
      descriptionKey: "tours.measureSegment.steps.4.description",
      waitFor: segmentCreated(),
    },
    {
      element: '[data-tour="ta-tools"]',
      titleKey: "tours.measureSegment.steps.5.title",
      descriptionKey: "tours.measureSegment.steps.5.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-MeasurementTools"]',
      titleKey: "tours.measureSegment.steps.6.title",
      descriptionKey: "tours.measureSegment.steps.6.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-segmentLength"]',
      titleKey: "tours.measureSegment.steps.7.title",
      descriptionKey: "tours.measureSegment.steps.7.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.measureSegment.steps.8.title",
      descriptionKey: "tours.measureSegment.steps.8.description",
      waitFor: measureSegment(),
    },
  ],

  // Change the units of an existing measurement.
  changeMeasurementUnits: [
    {
      element: '[data-tour="ta-tools"]',
      titleKey: "tours.changeMeasurementUnits.steps.1.title",
      descriptionKey: "tours.changeMeasurementUnits.steps.1.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      titleKey: "tours.changeMeasurementUnits.steps.2.title",
      descriptionKey: "tours.changeMeasurementUnits.steps.2.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-segment"]',
      titleKey: "tours.changeMeasurementUnits.steps.3.title",
      descriptionKey: "tours.changeMeasurementUnits.steps.3.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.changeMeasurementUnits.steps.4.title",
      descriptionKey: "tours.changeMeasurementUnits.steps.4.description",
      waitFor: segmentCreated(),
    },
    {
      element: '[data-tour="ta-tools"]',
      titleKey: "tours.changeMeasurementUnits.steps.5.title",
      descriptionKey: "tours.changeMeasurementUnits.steps.5.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-MeasurementTools"]',
      titleKey: "tours.changeMeasurementUnits.steps.6.title",
      descriptionKey: "tours.changeMeasurementUnits.steps.6.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-segmentLength"]',
      titleKey: "tours.changeMeasurementUnits.steps.7.title",
      descriptionKey: "tours.changeMeasurementUnits.steps.7.description",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      titleKey: "tours.changeMeasurementUnits.steps.8.title",
      descriptionKey: "tours.changeMeasurementUnits.steps.8.description",
      waitFor: measureSegment(),
    },
    {
      element: '[data-tour="ta-obj"]',
      titleKey: "tours.changeMeasurementUnits.steps.9.title",
      descriptionKey: "tours.changeMeasurementUnits.steps.9.description",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-expression"]',
      titleKey: "tours.changeMeasurementUnits.steps.10.title",
      descriptionKey: "tours.changeMeasurementUnits.steps.10.description",
      waitFor: click(),
    },
    {
      element: "#app",
      titleKey: "tours.changeMeasurementUnits.steps.11.title",
      descriptionKey: "tours.changeMeasurementUnits.steps.11.description",
      waitFor: measurementUnitsChanged(),
    },
  ],



} satisfies Record<string, TourStep[]>;

export type TourId = keyof typeof tourDefinitions;

////////////////////////////////////////////////////* REUSABLE WAITFOR FUNCTIONS *////////////////////////////////////////////


// The structure of an individual tour step.
type SEStore = ReturnType<typeof useSEStore>;

type WaitForFunction = (
  seStore: SEStore,
  advanceTour: () => void,
  element?: Element,
) => (() => void) | void;

// Each step contains the element to highlight, the popover content,
// and a reusable waitFor function that determines when the step is complete.
export type TourStep = {
  element: string;
  titleKey: string;
  descriptionKey: string;
  waitFor?: WaitForFunction;
};



// Each function below contains the logic for a specific waitFor condition.
// The function returns a cleanup callback when it creates a listener or watcher.
// This allows the tour engine to stop watching when the user leaves the current step.

// Wait for the user to click the highlighted element.
function oldclick(): WaitForFunction {
  return (_seStore, advanceTour, element) => {
    if (!element) return;

    const handleClick = () => advanceTour();

    // { once: true } removes the listener after the first click.
    element.addEventListener("click", handleClick, { once: true });

    // Return a cleanup function in case the user leaves this step early.
    return () => element.removeEventListener("click", handleClick);
  };
}

// Wait for the user to click the highlighted element.
function click(): WaitForFunction {
  return (_seStore, advanceTour, element) => {
    if (!element) return;

    const handleClick = () => advanceTour();

    // { once: true } removes the listener after the first click.
    element.addEventListener("click", handleClick, { once: true });

    // Return a cleanup function in case the user leaves this step early.
    return () => element.removeEventListener("click", handleClick);
  };
}


// Capture a newly selected point so later steps can refer to it.
function getPoint(): WaitForFunction {
  return (seStore, advanceTour) => {
    const existingPointIds = new Set(
      seStore.selectedSENodules
        .filter((nodule): nodule is SEPoint => nodule instanceof SEPoint)
        .map(point => point.id),
    );

    const stopWatching = watch(
      () => seStore.selectedSENodules.filter(
        (nodule): nodule is SEPoint => nodule instanceof SEPoint,
      ),
      selectedPoints => {
        // Find a selected point that was not selected when this step began.
        const newlySelectedPoint = selectedPoints.find(
          point => !existingPointIds.has(point.id),
        );

        if (newlySelectedPoint) {
          stopWatching();
          advanceTour();
        }
      },
    );

    // Stop watching if the user leaves this step early.
    return stopWatching;
  };
}


// Wait for a new point to be created.
function pointCreated(): WaitForFunction {
  return (seStore, advanceTour) => {
    // Capture how many points existed when this step began.
    const startingCount = seStore.sePoints.length;

    // Watch the reactive Pinia collection for a new point.
    const stopWatching = watch(
      () => seStore.sePoints.length,
      currentCount => {
        // A larger count means at least one point was added.
        if (currentCount > startingCount) {
          stopWatching();
          advanceTour();
        }
      },
    );

    // Stop watching if the user leaves this step early.
    return stopWatching;
  };
}


// Wait for a new line segment to be created.
function segmentCreated(): WaitForFunction {
  return (seStore, advanceTour) => {
    // Capture how many segments existed when this step began.
    const startingCount = seStore.seSegments.length;

    // Watch the reactive Pinia collection for a new segment.
    const stopWatching = watch(
      () => seStore.seSegments.length,
      currentCount => {
        // A larger count means at least one segment was added.
        if (currentCount > startingCount) {
          stopWatching();
          advanceTour();
        }
      },
    );

    // Stop watching if the user leaves this step early.
    return stopWatching;
  };
}


// Wait for a new circle to be created.
function circleCreated(): WaitForFunction {
  return (seStore, advanceTour) => {
    // Capture how many circles existed when this step began.
    const startingCount = seStore.seCircles.length;

    // Watch the reactive Pinia collection for a new circle.
    const stopWatching = watch(
      () => seStore.seCircles.length,
      currentCount => {
        // A larger count means at least one circle was added.
        if (currentCount > startingCount) {
          stopWatching();
          advanceTour();
        }
      },
    );

    // Stop watching if the user leaves this step early.
    return stopWatching;
  };
}

// ---------------- Right triangle helpers ----------------
// Two positions on the sphere count as the same point if they are this close (radians).
const POSITION_TOLERANCE = 1e-3;

// True when both points are at the same location on the sphere.
function samePosition(a: SEPoint, b: SEPoint): boolean {
  return a.locationVector.angleTo(b.locationVector) < POSITION_TOLERANCE;
}

// True when the point lies on the great circle of the given line or segment.
function isOnCircleOf(point: SEPoint, line: SELine | SESegment): boolean {
  const normal = line.normalVector.clone().normalize();
  return Math.abs(point.locationVector.clone().normalize().dot(normal)) < POSITION_TOLERANCE;
}

// Find a perpendicular line that passes through an endpoint (A) of a segment
// and is perpendicular to that segment. Returns null if there is none.
function findRightAngle(seStore: SEStore) {
  for (const line of seStore.seLines) {
    if (!(line instanceof SEPerpendicularLineThruPoint)) continue;
    for (const segment of seStore.seSegments) {
      // The two great circles are perpendicular when their normals are perpendicular.
      const normalDot = line.normalVector.clone().normalize()
        .dot(segment.normalVector.clone().normalize());
      if (Math.abs(normalDot) > POSITION_TOLERANCE) continue;

      const through = line.startSEPoint; // the point the perpendicular goes through
      if (samePosition(through, segment.startSEPoint)) {
        return { line, segment, a: segment.startSEPoint, b: segment.endSEPoint };
      }
      if (samePosition(through, segment.endSEPoint)) {
        return { line, segment, a: segment.endSEPoint, b: segment.startSEPoint };
      }
    }
  }
  return null;
}

// Does a segment connect these two points (in either direction)?
function connects(segment: SESegment, p: SEPoint, q: SEPoint): boolean {
  return (
    (samePosition(segment.startSEPoint, p) && samePosition(segment.endSEPoint, q)) ||
    (samePosition(segment.startSEPoint, q) && samePosition(segment.endSEPoint, p))
  );
}

// Shared helper: advance once a NEW segment (not present when the step began)
// satisfies the check. Wrong segments are ignored and the user keeps trying.
function newSegmentMatching(
  check: (seStore: SEStore, segment: SESegment) => boolean,
): WaitForFunction {
  return (seStore, advanceTour) => {
    const existingIds = new Set(seStore.seSegments.map(s => s.id));
    const stopWatching = watch(
      () => seStore.seSegments.length,
      () => {
        const match = seStore.seSegments.some(
          s => !existingIds.has(s.id) && check(seStore, s),
        );
        if (match) {
          stopWatching();
          advanceTour();
        }
      },
    );
    return stopWatching;
  };
}

// Step: the user creates a perpendicular line through an endpoint of a segment.
function rightAnglePerpendicularCreated(): WaitForFunction {
  return (seStore, advanceTour) => {
    const existingIds = new Set(seStore.seLines.map(l => l.id));
    const stopWatching = watch(
      () => seStore.seLines.length,
      () => {
        const found = findRightAngle(seStore);
        // Only count a perpendicular created during this step.
        if (found && !existingIds.has(found.line.id)) {
          stopWatching();
          advanceTour();
        }
      },
    );
    return stopWatching;
  };
}

// Step: a new segment from B (other endpoint) to a point C on the perpendicular line.
function secondSideCreated(): WaitForFunction {
  return newSegmentMatching((seStore, segment) => {
    const right = findRightAngle(seStore);
    if (!right) return false;
    for (const [from, to] of [
      [segment.startSEPoint, segment.endSEPoint],
      [segment.endSEPoint, segment.startSEPoint],
    ]) {
      if (
        samePosition(from, right.b) &&
        isOnCircleOf(to, right.line) &&
        !samePosition(to, right.a) // C must not be A itself
      ) {
        return true;
      }
    }
    return false;
  });
}

// Step: the third side connects C back to A, so all three sides now exist.
function triangleClosed(): WaitForFunction {
  return (seStore, advanceTour) => {
    const existingIds = new Set(seStore.seSegments.map(s => s.id));
    const stopWatching = watch(
      () => seStore.seSegments.length,
      () => {
        const right = findRightAngle(seStore);
        if (!right) return;
        // Look for the side from B to a point C on the perpendicular line.
        const sideBC = seStore.seSegments.find(s =>
          [s.startSEPoint, s.endSEPoint].some(c =>
            isOnCircleOf(c, right.line) && !samePosition(c, right.a) &&
            connects(s, right.b, c)),
        );
        if (!sideBC) return;
        const c = samePosition(sideBC.startSEPoint, right.b) ? sideBC.endSEPoint : sideBC.startSEPoint;
        // The new segment must join C and A.
        const sideCA = seStore.seSegments.find(
          s => !existingIds.has(s.id) && connects(s, c, right.a),
        );
        if (sideCA) {
          stopWatching();
          advanceTour();
        }
      },
    );
    return stopWatching;
  };
}

// Step: the perpendicular line has been hidden.
// Showing/hiding is not tracked reactively, so check it a few times per second.
function perpendicularHidden(): WaitForFunction {
  return (seStore, advanceTour) => {
    const timer = setInterval(() => {
      const right = findRightAngle(seStore);
      if (right && !right.line.showing) {
        clearInterval(timer);
        advanceTour();
      }
    }, 250);
    return () => clearInterval(timer);
  };
}





// Shared helper for watching a collection until its count increases.
function watchForIncrease(
  getCount: () => number,
  advanceTour: () => void,
): () => void {
  const startingCount = getCount();

  const stopWatching = watch(getCount, currentCount => {
    if (currentCount <= startingCount) return;
    stopWatching();
    advanceTour();
  });

  return stopWatching;
}


// For an equilateral-triangle step, advance when the final side is created.
function equilateralTriangleCreated(): WaitForFunction {
  return (seStore, advanceTour) => {
    const existingSegmentIds = new Set(seStore.seSegments.map(segment => segment.id));
    const stopWatching = watch(
      () => seStore.seSegments.length,
      () => {
        // The new side must be part of a closed triangle with three equal sides.
        if (hasNewEquilateralTriangle(seStore, existingSegmentIds)) {
          stopWatching();
          advanceTour();
        }
      },
    );

    // Stop watching if the user leaves this step early.
    return stopWatching;
  };
}

// Check that a newly created segment closes an equal-sided triangle.
function hasNewEquilateralTriangle(
  seStore: SEStore,
  existingSegmentIds: Set<number>,
): boolean {
  const segments = seStore.seSegments;

  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      if (Math.abs(segments[i].arcLength - segments[j].arcLength) >= 0.00001) continue;
      for (let k = j + 1; k < segments.length; k++) {
        const triangle = [segments[i], segments[j], segments[k]];
        if (Math.abs(segments[i].arcLength - segments[k].arcLength) >= 0.00001) continue;
        if (!triangle.some(segment => !existingSegmentIds.has(segment.id))) continue;

        if (formsClosedTriangle(triangle[0], triangle[1], triangle[2])) return true;
      }
    }
  }
  return false;
}

function formsClosedTriangle(a: SESegment, b: SESegment, c: SESegment): boolean {
  const vertices: SEPoint[] = [];
  const degree: number[] = [];
  for (const point of [a.startSEPoint, a.endSEPoint, b.startSEPoint, b.endSEPoint, c.startSEPoint, c.endSEPoint]) {
    let vertexIndex = vertices.findIndex(vertex => samePosition(vertex, point));
    if (vertexIndex < 0) {
      vertexIndex = vertices.length;
      vertices.push(point);
      degree.push(0);
    }
    degree[vertexIndex]++;
  }

  return vertices.length === 3 && degree.every(count => count === 2);
}



// Advance when a new line-segment measurement is created.
function measureSegment(): WaitForFunction {
  return lineSegmentMeasured();
}


// Advance when a new line-segment measurement is created.
function lineSegmentMeasured(): WaitForFunction {
  return (seStore, advanceTour) => {
    // Capture the IDs of measurements that already exist.
    const existingMeasurementIds = new Set(
      getSegmentMeasurements(seStore).map(measurement => measurement.id),
    );

    // Watch the measurements for a newly created one.
    const stopWatching = watch(
      () => getSegmentMeasurements(seStore),
      measurements => {
        const newMeasurement = measurements.find(
          measurement => !existingMeasurementIds.has(measurement.id),
        );

        if (newMeasurement) {
          stopWatching();
          advanceTour();
        }
      },
    );

    // Stop watching if the user leaves this step early.
    return stopWatching;
  };
}


// Return only the segment-length measurements from the expression collection.
function getSegmentMeasurements(seStore: SEStore): SESegmentLength[] {
  return seStore.seExpressions.filter(
    (expression): expression is SESegmentLength =>
      expression instanceof SESegmentLength,
  );
}


// For a back-of-sphere point step, advance when a point is created while Shift is held.
function behindSpherePointCreated(): WaitForFunction {
  return (seStore, advanceTour) => {
    // Track whether the Shift key is currently held.
    let isShiftHeld = false;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") isShiftHeld = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") isShiftHeld = false;
    };

    // Capture how many points existed when this step began.
    let startingCount = seStore.sePoints.length;

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Watch the reactive Pinia collection for a new point.
    const stopWatching = watch(
      () => seStore.sePoints.length,
      currentCount => {
        if (currentCount <= startingCount) return;

        if (isShiftHeld) {
          // The point was created while Shift was held.
          cleanup();
          advanceTour();
        } else {
          // Ignore points created without Shift and keep waiting.
          startingCount = currentCount;
        }
      },
    );

    // Remove both keyboard listeners and the watcher when leaving this step.
    function cleanup(): void {
      stopWatching();
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    }

    return cleanup;
  };
}


// For a segment longer than Pi, advance when a new segment greater than Pi is created.
function longerThanPiSegmentCreated(): WaitForFunction {
  return (seStore, advanceTour) => {
    // Do not count segments that already exist.
    const existingSegmentIds = new Set(
      seStore.seSegments.map(segment => segment.id),
    );
    const startingCount = seStore.seSegments.length;

    // Watch Pinia to see if a new segment greater than Pi has been made.
    const stopWatching = watch(
      () => seStore.seSegments.length,
      currentCount => {
        if (currentCount <= startingCount) return;

        // Find a new segment whose arc length is greater than Pi.
        const longerSegment = seStore.seSegments.find(
          segment =>
            !existingSegmentIds.has(segment.id) &&
            segment.arcLength > Math.PI,
        );

        if (longerSegment) {
          stopWatching();
          advanceTour();
        }
      },
    );

    // Stop watching if the user leaves this step early.
    return stopWatching;
  };
}


// For a sphere-rotation step, advance when the sphere is rotated.
function sphereRotated(): WaitForFunction {
  return (seStore, advanceTour) => {
    // Capture the current rotation matrix of the sphere.
    const startingRotation =
      seStore.inverseTotalRotationMatrix.elements.join(",");

    // Watch for changes to the sphere's rotation matrix.
    const stopWatching = watch(
      () => seStore.inverseTotalRotationMatrix.elements.join(","),
      currentRotation => {
        if (currentRotation !== startingRotation) {
          stopWatching();
          advanceTour();
        }
      },
    );

    // Stop watching if the user leaves this step early.
    return stopWatching;
  };
}


// For an object-movement step, advance when an existing point is moved.
function objectMoved(): WaitForFunction {
  return (seStore, advanceTour) => {
    // Save each existing object's position when this tour step starts.
    const startingPositions = new Map(
      seStore.sePoints.map(point => [
        point.id,
        point.locationVector.toArray().join(","),
      ]),
    );

    // Watch the positions so a change to an existing object can be detected.
    const stopWatching = watch(
      () => seStore.sePoints
        .map(point => `${point.id}:${point.locationVector.toArray().join(",")}`)
        .join("|"),
      () => {
        // Check only objects that existed when the step began.
        const moved = seStore.sePoints.some(
          point =>
            startingPositions.has(point.id) &&
            startingPositions.get(point.id) !== point.locationVector.toArray().join(","),
        );

        if (moved) {
          stopWatching();
          advanceTour();
        }
      },
    );

    // Stop watching if the user leaves this step early.
    return stopWatching;
  };
}


// Advance when the displayed value of an existing measurement changes.
function measurementUnitsChanged(): WaitForFunction {
  return (seStore, advanceTour) => {
    // Capture the values of the measurements when this step begins.
    const startingValues = new Map(
      getSegmentMeasurements(seStore).map(
        measurement => [measurement.id, measurement.value] as const,
      ),
    );

    // Watch for a change to an existing measurement's displayed value.
    const stopWatching = watch(
      () => getSegmentMeasurements(seStore).map(
        measurement => [measurement.id, measurement.value] as const,
      ),
      currentMeasurements => {
        const unitsChanged = currentMeasurements.some(
          ([id, value]) =>
            startingValues.has(id) && startingValues.get(id) !== value,
        );

        if (unitsChanged) {
          stopWatching();
          advanceTour();
        }
      },
    );

    // Stop watching if the user leaves this step early.
    return stopWatching;
  };
}


// Check whether at least one geometric object exists on the sphere.
function hasObject(): WaitForFunction {
  return (seStore, advanceTour) => watchForExistingCondition(
    () =>
      seStore.sePoints.length > 0 ||
      seStore.seSegments.length > 0 ||
      seStore.seCircles.length > 0,
    advanceTour,
  );
}


// Check whether at least one segment exists on the sphere.
function hasSegment(): WaitForFunction {
  return (seStore, advanceTour) =>
    watchForExistingCondition(() => seStore.seSegments.length > 0, advanceTour);
}


// Check whether at least one segment-length measurement exists.
function hasMeasurement(): WaitForFunction {
  return (seStore, advanceTour) =>
    watchForExistingCondition(() => getSegmentMeasurements(seStore).length > 0, advanceTour);
}


// Check whether at least one movable point exists on the sphere.
function hasMovablePoint(): WaitForFunction {
  return (seStore, advanceTour) =>
    watchForExistingCondition(() => seStore.sePoints.length > 0, advanceTour);
}


// Shared helper for prerequisite conditions that may already be satisfied.
function watchForExistingCondition(
  condition: () => boolean,
  advanceTour: () => void,
): (() => void) | void {
  // If the condition is already true, advance without creating a watcher.
  if (condition()) {
    advanceTour();
    return;
  }

  // Otherwise, wait until the condition becomes true.
  const stopWatching = watch(condition, satisfied => {
    if (!satisfied) return;
    stopWatching();
    advanceTour();
  });

  return stopWatching;
}
