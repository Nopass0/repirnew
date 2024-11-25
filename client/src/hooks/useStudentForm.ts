import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import {
  selectStudentForm,
  selectSubjects,
  selectCurrentSubject,
  selectIsEdited,
  selectValidationErrors,
  updateField,
  addSubject,
  updateSubject,
  removeSubject,
  updateTrialLesson,
  updateSchedule,
  setFormData,
  resetForm,
  saveStudentForm,
  clearValidationErrors,
} from "@/store/student/studentFormSlice";
import type { Subject, TimeRange } from "@/types/student";

export const useStudentForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const formState = useSelector(selectStudentForm);
  const subjects = useSelector(selectSubjects);
  const isEdited = useSelector(selectIsEdited);
  const validationErrors = useSelector(selectValidationErrors);

  // Basic form management
  const updateFormField = useCallback(
    (field: string, value: any) => {
      dispatch(updateField({ field, value }));
    },
    [dispatch],
  );

  // Subject management
  const getCurrentSubject = useCallback((index: number) => {
    return useSelector((state) => selectCurrentSubject(state, index));
  }, []);

  const handleAddSubject = useCallback(() => {
    dispatch(addSubject());
  }, [dispatch]);

  const handleUpdateSubject = useCallback(
    (index: number, field: keyof Subject, value: any) => {
      dispatch(updateSubject({ index, field, value }));
    },
    [dispatch],
  );

  const handleRemoveSubject = useCallback(
    (index: number) => {
      dispatch(removeSubject(index));
    },
    [dispatch],
  );

  // Trial lesson management
  const handleUpdateTrialLesson = useCallback(
    (subjectIndex: number, field: keyof Subject["trialLesson"], value: any) => {
      dispatch(updateTrialLesson({ subjectIndex, field, value }));
    },
    [dispatch],
  );

  // Schedule management
  const handleUpdateSchedule = useCallback(
    (subjectIndex: number, dayIndex: number, timeRanges: TimeRange[]) => {
      dispatch(updateSchedule({ subjectIndex, dayIndex, timeRanges }));
    },
    [dispatch],
  );

  // Form state management
  const handleResetForm = useCallback(() => {
    dispatch(resetForm());
  }, [dispatch]);

  const handleSetFormData = useCallback(
    (data: any) => {
      dispatch(setFormData(data));
    },
    [dispatch],
  );

  const handleSaveForm = useCallback(async () => {
    try {
      dispatch(clearValidationErrors());
      await dispatch(saveStudentForm()).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  }, [dispatch]);

  return {
    // State
    formState,
    subjects,
    isEdited,
    validationErrors,

    // Basic form methods
    updateField: updateFormField,
    setFormData: handleSetFormData,
    resetForm: handleResetForm,
    saveForm: handleSaveForm,

    // Subject methods
    getCurrentSubject,
    addSubject: handleAddSubject,
    updateSubject: handleUpdateSubject,
    removeSubject: handleRemoveSubject,

    // Trial lesson methods
    updateTrialLesson: handleUpdateTrialLesson,

    // Schedule methods
    updateSchedule: handleUpdateSchedule,
  };
};

export default useStudentForm;
