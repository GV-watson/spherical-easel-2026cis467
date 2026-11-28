import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import {
    doc,
    getDoc,
    getFirestore,
    updateDoc,
} from "firebase/firestore";
import { useI18n } from "vue-i18n";
import { useAccountStore } from "@/stores/account";
import { useSEStore } from "@/stores/se";
import {
    tours,
    tourDefinitions,
    type TourId,
    type TourStep,
} from "@/components/tourFunctions";

/** Coordinates tour selection, Driver.js execution, and completion tracking. */
export const useTourEngine = defineStore("tourEngine", () => {

    /*TOUR ENGINE GUIDE
     
     Section order:
       STORE SETUP: 
        Connect the stores and initialize tour state.
       
       RESTORE COMPLETION STATE:
        Load saved completion records for the signed-in user.
       
       TOUR MENU SEARCH: 
        Filter tour buttons by their translated labels.
       
       SELECT AND START A TOUR: 
        Find the selected definition and start Driver.js.
       
       BUILD DRIVER.JS STEPS: 
        Connect each step to its target, text, and wait condition.
       
       PERSIST TOUR COMPLETION: 
        Update store state and save to Firestore when signed in.
       
       STORE API: 
        Expose state and actions for UITour.vue.
     
    /*TOUR FLOW
      
      1. UITour.vue displays the tours and calls selectTour when a user picks one.
      
      2. selectTour looks up that tour in tourDefinitions from tourFunctions.ts.
      
      3. startTour builds the Driver.js steps and starts the walkthrough.
      
      4. When Driver.js highlights a step, its waitFor condition begins listening.
      
      5. A satisfied waitFor condition advances naturally; clicking Next advances manually.
      
      6. advanceTour prevents duplicate advances. Manual Next means the tour is not
         considered naturally completed, even if the user later reaches the final step.
    
      7. A naturally completed final step saves the completion timestamp. When Driver.js
         is destroyed, the active wait condition is cleaned up.
     
     Tour definitions and step-specific waitFor logic in tourFunctions.ts.
     */
    /////////////////////////////// STORE SETUP ///////////////////////////////

    // Initialize dependencies and reactive state shared by the tour workflow.
    const { t } = useI18n();
    const accountStore = useAccountStore();
    const seStore = useSEStore();
    const appDB = getFirestore();

    const completedTours = ref<Record<string, string>>({});
    const searchQuery = ref("");



    /////////////////////////////// RESTORE COMPLETION STATE ///////////////////////////////

    // Load completion timestamps for the signed-in user from Firestore.
    async function loadCompletedTours(uid: string | null | undefined,): Promise<void> {
        completedTours.value = {};
        if (!uid) return;

        try {
            const userDoc = await getDoc(doc(appDB, "users", uid));
            if (userDoc.exists()) {
                completedTours.value = userDoc.data().completedTours ?? {};
            }
        } catch (error) {
            console.error("Unable to load tour completion records:", error);
        }
    }

    // Reload completion data whenever the signed-in account changes.
    watch(
        () => accountStore.firebaseUid,
        uid => void loadCompletedTours(uid),
        { immediate: true },
    );



    /////////////////////////////// TOUR MENU SEARCH ///////////////////////////////

    // Filter tour buttons by their localized labels as the search query changes.
    const filteredTours = computed(() => {
        const query = searchQuery.value.trim().toLowerCase();

        return tours
            .map(tour => ({
                id: tour.id,
                labelKey: "labelKey" in tour ? tour.labelKey : `tours.${tour.id}.label`,
            }))
            .filter(tour => t(tour.labelKey).toLowerCase().includes(query));
    });

    // Update the query used by the tour menu's search input.
    function searchTours(query: string): void {
        searchQuery.value = query;
    }



    /////////////////////////////// SELECT AND START A TOUR ///////////////////////////////

    // Called when the user clicks a tour button; resolves the ID and starts its walkthrough.
    function selectTour(tourId: string): void {
        const selectedTour = tourDefinitions[tourId as TourId];
        if (!selectedTour) {
            console.warn(`Unknown tour: ${tourId}`);
            return;
        }

        startTour(tourId, selectedTour);
    }//end of selectTour

    ///////// Set up the tour's state, callbacks, and Driver.js instance, then begin./////////
    function startTour(tourId: string, selectedTour: TourStep[]): void {
        let cleanupStep: (() => void) | undefined;
        let driverObj: ReturnType<typeof driver>;
        let currentStepIndex = 0;
        let stepAdvanced = false;
        let completedNaturally = true;
        let completionSaved = false;

        // Stop the previous step's watcher or event listener before leaving it.
        function cleanupCurrentStep(): void {
            cleanupStep?.();
            cleanupStep = undefined;
        }

        // Store the cleanup returned by the active step's wait condition.
        function setCleanupStep(cleanup?: () => void): void {
            cleanupStep = cleanup;
        }

        // Track which tour step Driver.js currently highlights.
        function setCurrentStepIndex(index: number): void {
            currentStepIndex = index;
        }
        // Allow the next step to advance once after Driver.js highlights it.
        function resetStepAdvanced(): void {
            stepAdvanced = false;
        }

        // Advance Driver.js once and record whether the tour ended naturally.
        //Checks if the next button was hit, if so then the time will not be logged into firebase, 
        //nor show completetion check.
        function advanceTour(naturallyCompleted: boolean): void {
            // A wait condition and the Next button can both request an advance
            if (stepAdvanced) return;
            stepAdvanced = true;

            //If they hit the next button the user did not complete every step as instructed.
            if (!naturallyCompleted) {
                completedNaturally = false;
            }

            // Save completion only when the final step's wait condition was satisfied naturally.
            const isFinalStep = currentStepIndex === selectedTour.length - 1;
            if (isFinalStep && naturallyCompleted && completedNaturally) {
                completeTour();
            }

            // Tell Driver.js to display the next step, or finish after the last one.
            driverObj.moveNext();
        }

        // Save completion only once after every step is completed without manual skipping.
        function completeTour(): void {
            if (completionSaved) return;
            completionSaved = true;
            void saveTourCompletion(tourId);
        }

        // Translate tour definitions into Driver.js steps and attach step handlers.
        const steps = createDriverSteps(
            selectedTour,
            advanceTour,
            cleanupCurrentStep,
            setCleanupStep,
            setCurrentStepIndex,
            resetStepAdvanced,
        );

        // Configure Driver.js to clean up the active wait condition when destroyed.
        driverObj = driver({
            showProgress: true,
            steps,
            onDestroyed: cleanupCurrentStep,
        });

        // Display the first tour step.
        driverObj.drive();

    }//end of startTour



    /////////////////////////////// BUILD DRIVER.JS STEPS ///////////////////////////////
    // Convert definitions into Driver.js steps and install each wait condition on highlight.
    // selectedTour contains the step definitions; the remaining arguments manage the tour lifecycle.
    function createDriverSteps(
        selectedTour: TourStep[],
        advanceTour: (naturallyCompleted: boolean) => void,
        cleanupCurrentStep: () => void,
        setCleanupStep: (cleanup?: () => void) => void,
        setCurrentStepIndex: (index: number) => void,
        resetStepAdvanced: () => void,
    ) {
        // Driver.js needs one configuration object for every step in the selected tour.
        return selectedTour.map((step, stepIndex) => ({

            // This is the element Driver.js will highlight for the current step.
            element: step.element,
            popover: {

                title: t(step.titleKey),// Resolve the translated title and description for the popover.
                description: t(step.descriptionKey),// Next is a manual advance, so it does not count as natural completion.
                onNextClick: () => advanceTour(false),
            },

            onHighlighted: (element?: Element) => {
                // Update the active step and reset its one-advance guard.
                setCurrentStepIndex(stepIndex);
                resetStepAdvanced();

                // Stop any watcher or event listener left by the previous step.
                cleanupCurrentStep();

                // Some steps have no wait condition and advance through Next only.
                if (!step.waitFor) return;

                // Start this step's wait condition; its callback marks a natural completion.
                const cleanup = step.waitFor(
                    seStore,
                    () => advanceTour(true),
                    element,
                );

                // Keep its cleanup function so it can be stopped when the step changes.
                setCleanupStep(typeof cleanup === "function" ? cleanup : undefined);
            },
        }));
    }//end of createDriverSteps



    /////////////////////////////// PERSIST TOUR COMPLETION ///////////////////////////////
    // Record completion locally and update Firestore for a signed-in user.
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
    }//end of saveTourCompletion



    /////////////////////////////// STORE API ///////////////////////////////
    // Expose the tour state and actions used by UITour.vue.
    return {
        completedTours,
        filteredTours,
        loadCompletedTours,
        saveTourCompletion,
        selectTour,
        searchTours,
        tours,
    };
});//end of useTourEngine
