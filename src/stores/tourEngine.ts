import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useI18n } from "vue-i18n";
import { useSEStore } from "@/stores/se";
import { useAccountStore } from "@/stores/account";
import { tours, tourDefinitions, type TourId, type TourStep } from "@/components/tourFunctions";

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

advanceTour() moves to the next step -> completeTour() saves completion when the tour is finished.
*/

////////////////////////////////////////////////////
export const useTourEngine = defineStore("tourEngine", () => {

    // 1. INITIALIZE ENGINE
    const { t } = useI18n();
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
                title: step.titleKey ? t(step.titleKey) : step.title,
                description: step.descriptionKey ? t(step.descriptionKey) : step.description,
                onNextClick: () => advanceTour(false),
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
    //Return the functions to the parent component (UITour.vue).
    return {
        completedTours,
        loadCompletedTours,
        saveTourCompletion,
        selectTour,
        searchTours,
        tours,
    };
});
////////////////////////////////////////////////////
