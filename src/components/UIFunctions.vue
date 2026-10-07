<template>
  <!--
    UIFunctions currently has no visible UI.
    All Tour-tab UI is contained in UITour.vue.
  -->
</template>


<script setup lang="ts">
/*
UIFunctions.vue
Contains the tour definitions and the functionality used by the Tour system.

UITour.vue:
Displays the Tour UI
Allows the user to select a tour

UIFunctions.vue:
Defines what each tour contains
Will eventually control tour progression
Will eventually detect whether the user completed each required action
 */

// Tour Types
type TourId =
  | "createPoint"
  | "rotateSphere"
  | "createSegment";

type TourStep = {
  instruction: string;
  action: string;
  expectedResult?: string;
};

type Tour = {
  id: TourId;
  title: string;
  steps: TourStep[];
};



// Tour Definitions
const tours: Tour[] = [
//Create a Point Tour

  {
    id: "createPoint",
    title: "Create a Point",

    steps: [
      {
        instruction:
          'Click "Create Point" in the "Basic Tools" button group.',

        action:
          "Activate the Point tool.",
      },

      {
        instruction:
          "Click anywhere on the main sphere canvas.",

        action:
          "Create a point on the sphere.",

        expectedResult:
          'A point should be created on the front of the sphere and information about that point should appear in the "Points" list in the "Objects" panel.',
      },
    ],
  },



//Create a Line Segment Tour
  {
    id: "createSegment",
    title: "Create a Line Segment",

    steps: [
      {
        instruction:
          'Click "Create Segment" in the "Basic Tools" button group.',

        action:
          "Activate the Segment tool.",
      },

      {
        instruction:
          "Click a location on the main sphere canvas.",

        action:
          "Select the first location.",
      },

      {
        instruction:
          "Click a second location on the main sphere canvas.",

        action:
          "Select the second location.",

        expectedResult:
          'A line segment from the first location to the second should be created and information about that segment should appear in the "Line segments" list in the "Objects" panel.',
      },
    ],
  },
];


// Tour Functions
/*
 * Start a tour.
 *
 * TODO:
 * - Set the selected tour
 * - Start at the first step
 * - Display the appropriate tooltip
 */
function startTour(tourId: TourId): void {
  // TODO: Implement tour start.
}

/*
 * Move to the next step.
 *
 * TODO:
 * - Check whether the current step is complete
 * - Advance to the next step
 */
function nextStep(): void {
  // TODO: Implement next step.
}

/*
 * Move to the previous step.
 */
function previousStep(): void {
  // TODO: Implement previous step.
}

/*
 * Check whether the user completed the current action.
 *
 * This will eventually be where we detect things such as:
 *
 * - A new point being created
 * - The sphere being rotated
 * - A line segment being created
 */
function checkStepCompletion(): boolean {
  // TODO: Implement automatic completion detection.

  return false;
}

/*
 * Finish the current tour.
 *
 * TODO:
 * - Display completion message
 * - Save completion state
 * - Eventually send Firebase data
 */
function completeTour(): void {
  // TODO: Implement tour completion.
}
</script>
