/*///////////////////////////////////////////////////////////// Spherical Easel TypeScript ///////////////////////////////////////////////////////////////////////////////////////////*/

import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { ref, watch } from "vue";
import { useSEStore } from "@/stores/se";
import { useAccountStore } from "@/stores/account";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { SEPoint } from "@/models-spherical/SEPoint";
import { SESegmentLength } from "@/models-spherical/SESegmentLength";


// 1 Add new tours here when creating their definitions below.
const tours = [
  { id: "createPoint", label: "Create a Point" },
  { id: "rotateSphere", label: "Rotate Sphere" },
  { id: "createSegment", label: "Create a Line Segment" },
  { id: "createCircle", label: "Create a Circle" },
  { id: "createBehindSpherePoint", label: "Create a Point Behind the Sphere" },
  { id: "createLongerThanPiSegment", label: "Create a Line Segment Longer than π" },
  { id: "moveObject", label: "Move an Object" },
  { id: "measureSegment", label: "Measure a Line Segment" },
  { id: "changeMeasurementUnits", label: "Change Measurement Units" },
  { id: "createRightTriangle", label: "Create a Right Triangle" },
  { id: "createEquilateralTriangle", label: "Create an Equilateral Triangle" },
] as const;



// 2
// The tour definitions are the core of the tour engine.
// Each tour is defined as an array of steps, and each step contains the following properties:
//
// - element: The CSS selector for the page element that Driver.js will highlight.
// - title: The title text shown in the Driver.js popover.
// - description: The description text shown in the Driver.js popover.
// - waitFor: A reusable function that determines when the step is complete.
//  - > Each step contains its own waitFor function call, and the logic is defined at the bottom.
const tourDefinitions = {



  // Construct a right triangle using a perpendicular line.
  createRightTriangle: [],








  // Construct an equilateral triangle using two intersecting circles.
  createEquilateralTriangle: [],













  createPoint: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Click here to go to the Tools category (if not already).",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Click here to open the Basic Tools section.",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-point"]',
      title: "Create Point",
      description: "Click to select the Create Point Tool.",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Place the point anywhere within the circle.\nYou have created a point!",
      waitFor: pointCreated(),
      //update firestore account 
      //if first time completeing tour when logged in send time when completed and completetion flag.
      //completedtour at 
    },
  ],

  rotateSphere: [
    {
      element: "#app",
      title: "Tour Prerequisite",
      description: 'This tour requires an object on the sphere. Create a point, segment, or circle if you do not already have one.',
      waitFor: hasObject(),
    },
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Click here to go to the Tools category (if not already).",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-DisplayTools"]',
      title: "Display Tools Category",
      description: "Click here to enter the Display Tools category.",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-rotate"]',
      title: "Rotate Sphere Button",
      description: "Click here to select the Rotate Sphere Button.",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Click and drag anywhere on the canvas to rotate the sphere! Clicking and letting go with velocity will make the sphere spin! Have fun!",
      waitFor: sphereRotated(),
    },
  ],

  createSegment: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-segment"]',
      title: "Create Segment",
      description: "Click to select the segment tool.",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      title: "Create a segment",
      description: "Click two points on the sphere to create a segment, or click and drag to create a segment.",
      waitFor: segmentCreated(), // Wait for the user to create a segment before proceeding to the next step.
    },
  ],


  createCircle: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-circle"]',
      title: "Create Circle",
      description: "Select the Create Circle tool.",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Click two locations on the sphere to create a circle, or click and drag to create a circle.",
      waitFor: circleCreated(),
    },
  ],

  // Create a point on the back of the sphere.
  createBehindSpherePoint: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-point"]',
      title: "Create Point",
      description: "Select the Create Point tool.",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      title: "Create a Point on the Back",
      description: "Hold Shift and click on the sphere canvas to create a point on the back of the sphere.",
      waitFor: behindSpherePointCreated(),
    },
  ],

  // Create a segment with a length greater than Pi.
  createLongerThanPiSegment: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: click(),

    },
    {
      element: '[data-tour="bu-segment"]',
      title: "Create Segment",
      description: "Click to select the segment tool.",
      waitFor: click(),
    },
    {
      element: '#sphereContainer',
      title: "Create the Segment",
      description: "While holding CTRL (control), click and drag from one location to another on the sphere to make the segment.",
      waitFor: longerThanPiSegmentCreated(),
    },
  ],

  // Move an existing geometric object.
  moveObject: [
    {
      element: "#app",
      title: "Tour Prerequisite",
      description: "This tour needs a movable point on the sphere. Create one if you do not already have one.",
      waitFor: hasMovablePoint(),
    },
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-DisplayTools"]',
      title: "Display Tools",
      description: "Open the Display Tools section.",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-move"]',
      title: "Move Tool",
      description: "Select the Move tool.",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      title: "Move an Object",
      description: "Click and drag any movable object to a new location on the sphere.",
      waitFor: objectMoved(),
    },
  ],

  measureSegment: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-segment"]',
      title: "Create Segment",
      description: "Select the Segment tool.",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      title: "Create a Segment",
      description: "Click two locations on the sphere to create a line segment.",
      waitFor: segmentCreated(),
    },
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category.",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-MeasurementTools"]',
      title: "Measurement Tools",
      description: "Open the Measurement Tools section.",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-segmentLength"]',
      title: "Line Segment Length",
      description: "Select the Line Segment Length tool.",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      title: "Measure the Segment",
      description: "Click the segment you just created. Its length will appear on the sphere and in the Objects panel.",
      waitFor: measureSegment(),
    },
  ],

  // Change the units of an existing measurement.
  changeMeasurementUnits: [
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-BasicTools"]',
      title: "Basic Tools",
      description: "Open the Basic Tools section.",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-segment"]',
      title: "Create Segment",
      description: "Select the Segment tool.",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      title: "Create a Segment",
      description: "Click two locations on the sphere to create a line segment.",
      waitFor: segmentCreated(),
    },
    {
      element: '[data-tour="ta-tools"]',
      title: "Tools Category",
      description: "Open the Tools category if it is not already selected.",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-MeasurementTools"]',
      title: "Measurement Tools",
      description: "Open the Measurement Tools section.",
      waitFor: click(),
    },
    {
      element: '[data-tour="bu-segmentLength"]',
      title: "Line Segment Length",
      description: "Select the Line Segment Length tool.",
      waitFor: click(),
    },
    {
      element: "#sphereContainer",
      title: "Measure the Segment",
      description: "Click the segment you just created. Its length measurement will appear.",
      waitFor: measureSegment(),
    },
    {
      element: '[data-tour="ta-obj"]',
      title: "Objects Category",
      description: "Open the Objects panel.",
      waitFor: click(),
    },
    {
      element: '[data-tour="gr-expression"]',
      title: "Measurements Section",
      description: "Open the Measurements section.",
      waitFor: click(),
    },
    {
      element: "#app",
      title: "Change Units",
      description: "Find the measurement you just created and click its change-units icon. The units cycle through decimals, multiples of Pi, and degrees.",
      waitFor: measurementUnitsChanged(),
    },
  ],



} satisfies Record<string, TourStep[]>;

type TourId = keyof typeof tourDefinitions;

////////////////////////////////////////////////////* TOUR ENGINE */////////////////////////////////////////////////////////////

// 1. INITIALIZE ENGINE
//    - Initialize completedTours
//    - Initialize accountStore
//    - Initialize seStore
//    - Initialize Firestore

// 2. TOUR COMPLETION MANAGEMENT
//    - loadCompletedTours()
//    - watch(accountStore.firebaseUid)
//    - saveTourCompletion()

// 3. TOUR LIFECYCLE MANAGEMENT
//    - cleanupCurrentStep()
//    - advanceTour()
//    - completeTour()
//    - startTour()

// 4. STEP EXECUTION
//    - createDriverSteps()

// 5. TOUR INITIALIZATION
//    - selectTour()

// 6. SEARCH FUNCTIONALITY
//    - searchTours()

// 7. RETURN/EXPOSE FUNCTIONS
//    - completedTours
//    - loadCompletedTours
//    - saveTourCompletion
//    - selectTour
//    - searchTours
//    - tours

/*

tourDefinitions[tourId] >

selectTour() >

startTour() >

createDriverSteps() >

Driver.js displays and manages the tour steps >

waitFor() handles user interactions and advances the tour >

advanceTour() moves to the next step → completeTour() saves completion when the tour is finished.
*/

////////////////////////////////////////////////////
export function useUIFunctions() {

  // 1. INITIALIZE ENGINE
  const completedTours = ref<Record<string, string>>({});
  const accountStore = useAccountStore();
  const seStore = useSEStore();
  const appDB = getFirestore();

  // 2. TOUR COMPLETION MANAGEMENT
  // Load completion timestamps for a user.
  async function loadCompletedTours(uid: string | null | undefined): Promise<void> {
    completedTours.value = {};
    if (!uid) return;

    try {
      const userDoc = await getDoc(doc(appDB, "users", uid));
      if (userDoc.exists()) {
        completedTours.value = userDoc.data().completedTours ?? {};
      }
    } catch (error) {
      console.error("Unable to load completed tours:", error);
    }
  }

  // Reload completion data whenever the signed-in user changes.
  watch(
    () => accountStore.firebaseUid,
    uid => void loadCompletedTours(uid),
    { immediate: true },
  );

  // Save a completion timestamp for a specific tour.
  async function saveTourCompletion(tourId: string): Promise<void> {
    const completedAt = new Date().toISOString();

    completedTours.value = {
      ...completedTours.value,
      [tourId]: completedAt,
    };

    const uid = accountStore.firebaseUid;
    if (!uid) return;

    try {
      await updateDoc(doc(appDB, "users", uid), {
        [`completedTours.${tourId}`]: completedAt,
      });
    } catch (error) {
      console.error("Unable to save tour completion:", error);
    }
  }

  // 4. STEP EXECUTION
  // Convert the selected tour's definitions into Driver.js steps.
  function createDriverSteps(
    selectedTour: TourStep[],
    advanceTour: (naturallyCompleted: boolean) => void,
    cleanupCurrentStep: () => void,
    setCleanupStep: (cleanup?: () => void) => void,
    setCurrentStepIndex: (index: number) => void,
    resetStepAdvanced: () => void,
  ) {
    return selectedTour.map((step, stepIndex) => ({
      element: step.element,
      popover: {
        title: step.title,
        description: step.description,
      },
      onHighlighted: (element?: Element) => {
        setCurrentStepIndex(stepIndex);
        resetStepAdvanced();
        cleanupCurrentStep();

        if (!step.waitFor) return;

        const cleanup = step.waitFor(
          seStore,
          () => advanceTour(true),
          element,
        );
        setCleanupStep(typeof cleanup === "function" ? cleanup : undefined);
      },
    }));
  }

  // 3. TOUR LIFECYCLE MANAGEMENT
  // Initialize and start a selected tour.
  function startTour(tourId: string, selectedTour: TourStep[]): void {
    let cleanupStep: (() => void) | undefined;
    let driverObj: ReturnType<typeof driver>;
    let currentStepIndex = 0;
    let stepAdvanced = false;
    let completedNaturally = true;
    let completionSaved = false;

    function cleanupCurrentStep(): void {
      cleanupStep?.();
      cleanupStep = undefined;
    }

    function setCleanupStep(cleanup?: () => void): void {
      cleanupStep = cleanup;
    }

    function setCurrentStepIndex(index: number): void {
      currentStepIndex = index;
    }

    function resetStepAdvanced(): void {
      stepAdvanced = false;
    }

    function completeTour(): void {
      if (completionSaved) return;
      completionSaved = true;
      void saveTourCompletion(tourId);
    }

    function advanceTour(naturallyCompleted: boolean): void {
      if (stepAdvanced) return;
      stepAdvanced = true;

      if (!naturallyCompleted) {
        completedNaturally = false;
      }

      if (
        currentStepIndex === selectedTour.length - 1 &&
        naturallyCompleted &&
        completedNaturally
      ) {
        completeTour();
      }

      driverObj.moveNext();
    }

    const steps = createDriverSteps(
      selectedTour,
      advanceTour,
      cleanupCurrentStep,
      setCleanupStep,
      setCurrentStepIndex,
      resetStepAdvanced,
    );

    driverObj = driver({
      showProgress: true,
      steps,
      // Manual navigation advances the tour but does not count as natural completion.
      onNextClick: () => advanceTour(false),
      onDestroyed: cleanupCurrentStep,
    });

    driverObj.drive();
  }

  // 5. TOUR INITIALIZATION
  // Select a tour by its ID and initialize it.
  function selectTour(tourId: string): void {
    const selectedTour = tourDefinitions[tourId as TourId];
    if (!selectedTour) {
      console.warn(`Unknown tour: ${tourId}`);
      return;
    }
    startTour(tourId, selectedTour);
  }

  // 6. SEARCH FUNCTIONALITY
  // Search filtering is currently owned by UITour.vue.
  function searchTours(query: string): void {
    console.debug("Tour search:", query);
  }

  // 7. EXPOSE FUNCTIONS
  // Expose the functions to the parent component (UITour.vue).
  return {
    completedTours,
    loadCompletedTours,
    saveTourCompletion,
    selectTour,
    searchTours,
    tours,
  };
}

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
type TourStep = {
  element: string;
  title: string;
  description: string;
  waitFor?: WaitForFunction;
};



// Each function below contains the logic for a specific waitFor condition.
// The function returns a cleanup callback when it creates a listener or watcher.
// This allows the tour engine to stop watching when the user leaves the current step.

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


// For a right-triangle step, advance when the final side is created.
function rightTriangleCreated(): WaitForFunction {
  return segmentCreated();
}


// For an equilateral-triangle step, advance when the final side is created.
function equilateralTriangleCreated(): WaitForFunction {
  return segmentCreated();
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
