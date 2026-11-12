
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
  { id: "createPoint_Func", label: "Create a Func_Point" },
  { id: "createPoint_Hard", label: "Create a Hard_Point" },
  // { id: "rotateSphere",  label: "Rotate Sphere" },
  // { id: "createSegment", label: "Create a Line Segment" },
  // { id: "createCircle",  label: "Create a Circle" },
  // { id: "createBehindSpherePoint", label: "Create a Point Behind the Sphere" },
  // { id: "createLongerThanPiSegment", label: "Create a Line Segment Longer than π" },
  // { id: "moveObject", label: "Move an Object" },
  // { id: "measureSegment", label: "Measure a Line Segment" },
  // { id: "changeMeasurementUnits", label: "Change Measurement Units" },
  // { id: "createRightTriangle", label: "Create a Right Triangle" },
  // { id: "createEquilateralTriangle", label: "Create an Equilateral Triangle" },
] as const;


// 2
// The tour definitions are the core of the tour engine.
// Each tour is defined as an array of steps, and each step contains the following properties:
//
// - element: The CSS selector for the page element that Driver.js will highlight.
// - title: The title text shown in the Driver.js popover.
// - description: The description text shown in the Driver.js popover.
// - waitFor: A reusable function that determines when the step is complete.
//  - > Each step contains its own waitFor logic, but that logic can now be reused with the functions at the bottom 

const tourDefinitions: Record<TourId, TourStep[]> = {

  createPoint_Hard: [
    {
      element: '[data-tour="bu-point"]',

      title: "Create Hard Point",
      description: "Click to select the point creation tool for a hard point.",
      waitFor: (seStore, advanceTour, element) => {

        // Wait for the user to click the highlighted element.
        if (!element) return;

        const handleClick = () => {
          advanceTour();
        };

        element.addEventListener("click", handleClick, { once: true });

        // Return cleanup function to remove the event listener.
        return () => element.removeEventListener("click", handleClick);
      },
    },

    {
      element: "#sphereContainer",
      title: "Sphere Canvas",
      description: "Place the point anywhere within the circle.\nYou have created a point!",
      waitFor: (seStore, advanceTour) => {
        const startingCount = seStore.sePoints.length;

        const stopWatching = watch(
          () => seStore.sePoints.length,
          currentCount => {
            if (currentCount > startingCount) {
              stopWatching();
              advanceTour();
            }
          },
        );
        return stopWatching;
      },

    },

  ],

  createPoint_Func: [
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
    },
  ],


};

////////////////////////////////////////////////////* TOUR ENGINE */////////////////////////////////////////////////////////////

export function useUIFunctions() {

  // 1. INITIALIZE ENGINE
  const completedTours = ref<Record<string, string>>({});
  const accountStore = useAccountStore();
  const seStore = useSEStore();
  const appDB = getFirestore();


  // 2. TOUR COMPLETION MANAGEMENT
  // Load completion timestamps for a user.
  async function loadCompletedTours(
    uid: string | null | undefined,
  ): Promise<void> {

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

    // Update local data even when the user is signed out.
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


  // 3. TOUR LIFECYCLE MANAGEMENT
  // Remove the current step's listeners or watchers.
  function cleanupCurrentStep(
    cleanupStep: (() => void) | undefined,
  ): void {

    cleanupStep?.();
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

      // CSS selector for the page element Driver.js highlights.
      element: step.element,

      // Text shown in the Driver.js popover.
      popover: {
        title: step.title,
        description: step.description,
      },


      // Runs when Driver.js highlights a step.
      onHighlighted: (element?: Element) => {

        // Track the currently highlighted step.
        setCurrentStepIndex(stepIndex);

        // Reset advancement tracking for the new step.
        resetStepAdvanced();

        // Remove the previous step's listeners or watchers.
        cleanupCurrentStep();

        // Execute the current step's custom waitFor logic.
        if (step.waitFor) {

          const cleanup = step.waitFor(
            seStore,
            () => advanceTour(true),
            element,
          );

          if (typeof cleanup === "function") {
            setCleanupStep(cleanup);
          } else {
            setCleanupStep(undefined);
          }

        }
      },

    }));

  }


  // 5. TOUR INITIALIZATION
  // Initialize and start a selected tour.
  function startTour(tourId: string, selectedTour: TourStep[]): void {

    // Holds the cleanup function for the current step's listener or watcher.
    let cleanupStep: (() => void) | undefined;

    // Declared here so callbacks below can use the Driver.js instance after it is created.
    let driverObj: ReturnType<typeof driver>;

    // Tracks which step is currently highlighted.
    let currentStepIndex = 0;


    // Prevents a step from advancing more than once.
    let stepAdvanced = false;

    // Tracks whether every step was completed naturally.
    let completedNaturally = true;

    // Prevents completion from being saved more than once.
    let completionSaved = false;


    // Remove the current step's listeners or watchers.
    function cleanupCurrentStepForTour(): void {
      cleanupCurrentStep(cleanupStep);
      cleanupStep = undefined;
    }


    // Update the cleanup function for the current step.
    function setCleanupStep(cleanup?: () => void): void {
      cleanupStep = cleanup;
    }


    // Update the currently highlighted step.
    function setCurrentStepIndex(index: number): void {
      currentStepIndex = index;
    }


    // Reset advancement tracking when a new step is highlighted.
    function resetStepAdvanced(): void {
      stepAdvanced = false;
    }


    // Save completion when every step has been completed naturally.
    function completeTour(): void {
      if (completionSaved) return;
      completionSaved = true;
      void saveTourCompletion(tourId);
    }


    // Advances the tour and determines whether it was completed naturally.
    function advanceTour(naturallyCompleted: boolean): void {

      // Prevent multiple events or watchers from advancing the same step.
      if (stepAdvanced) return;

      stepAdvanced = true;

      // If the user manually advances, the tour is no longer naturally completed.
      if (!naturallyCompleted) {
        completedNaturally = false;
      }

      // Only save completion if every step was completed naturally.
      if (
        currentStepIndex === selectedTour.length - 1 &&
        naturallyCompleted &&
        completedNaturally
      ) {
        completeTour();
      }

      driverObj.moveNext();
    }


    // Convert the tour definitions into Driver.js steps.
    const steps = createDriverSteps(
      selectedTour,
      advanceTour,
      cleanupCurrentStepForTour,
      setCleanupStep,
      setCurrentStepIndex,
      resetStepAdvanced,
    );


    // Create the Driver.js tour using the converted steps.
    driverObj = driver({

      showProgress: true,
      steps,

      // The Next button manually advances the tour.
      // This does not count as naturally completing the step.
      onNextClick: () => {
        advanceTour(false);
      },

      // Clean up the current step when the tour is destroyed.
      onDestroyed: () => {
        cleanupCurrentStepForTour();
      },

    });


    // Start the tour.
    driverObj.drive();
  }


  // Select a tour by its ID and initialize it.
  function selectTour(tourId: string): void {

    // Look up the requested tour's step definitions.
    const selectedTour = tourDefinitions[tourId as TourId];
    if (!selectedTour) return;
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

} //end of useUIFunctions

////////////////////////////////////////////////////* REUSABLE WAITFOR FUNCTIONS *////////////////////////////////////////////

// Automatically determine valid tour IDs from the tours array.
type TourId = typeof tours[number]["id"];

type TourStep = {
  element: string;
  title: string;
  description: string;
  waitFor?: WaitForFunction;
  isSelected?: (element: Element) => boolean;
};

// The structure of an individual tour step.
// waitFor contains the custom logic for advancing that specific step.
type WaitForFunction = (
  seStore: ReturnType<typeof useSEStore>,
  advanceTour: () => void,
  element?: Element
) => (() => void) | void;


/////////////Start of functions

function click(): WaitForFunction {
  return (_seStore, advanceTour, element) => {
    if (!element) return;
    const handleClick = () => advanceTour();
    element.addEventListener("click", handleClick, { once: true });
    return () => element.removeEventListener("click", handleClick);
  };
}



// Wait for a new point to be created.
function pointCreated(): WaitForFunction {
  return (seStore, advanceTour) => {

    const existingPointIds = new Set(
      seStore.sePoints.map(point => point.id)
    );

    const stopWatching = watch(
      () => seStore.sePoints.length,
      () => {

        const newPoint = seStore.sePoints.find(
          point => !existingPointIds.has(point.id)
        );

        if (newPoint) {
          stopWatching();
          advanceTour();
        }
      },
    );

    return stopWatching;
  };
}

