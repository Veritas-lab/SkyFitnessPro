'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { coursesApi, progressApi } from '@/lib/api';
import { Workout, CourseProgress } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import styles from './ModalWorkouts.module.css';

interface ModalWorkoutsProps {
  courseId: string;
  courseName?: string;
  onClose: () => void;
}

export default function ModalWorkouts({ courseId, courseName, onClose }: ModalWorkoutsProps) {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setIsLoading(true);
        const workoutsRes = await coursesApi.getWorkouts(courseId);
        setWorkouts(workoutsRes.data);

        // Загружаем прогресс
        try {
          const progressRes = await progressApi.getCourseProgress(courseId);
          setProgress(progressRes.data);
        } catch (progressErr) {
          // Прогресс не обязателен, игнорируем ошибку
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      loadWorkouts();
    }
  }, [courseId]);

  // Автоматически выбираем первую незавершенную тренировку или первую тренировку
  useEffect(() => {
    if (workouts.length > 0 && !selectedWorkoutId) {
      if (progress && progress.workoutsProgress) {
        // Ищем первую незавершенную тренировку
        const firstIncomplete = workouts.find((workout) => {
          const workoutProgress = progress.workoutsProgress.find(
            (wp) => wp.workoutId === workout._id
          );
          return !workoutProgress || !workoutProgress.workoutCompleted;
        });
        setSelectedWorkoutId(firstIncomplete?._id || workouts[0]._id);
      } else {
        // Если прогресса нет, выбираем первую тренировку
        setSelectedWorkoutId(workouts[0]._id);
      }
    }
  }, [workouts, progress, selectedWorkoutId]);

  const handleWorkoutSelect = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
  };

  const handleStart = () => {
    if (selectedWorkoutId) {
      router.push(`/courses/${courseId}/workouts/${selectedWorkoutId}`);
      onClose();
    }
  };

  const isWorkoutCompleted = (workoutId: string): boolean => {
    if (!progress) return false;
    const workoutProgress = progress.workoutsProgress.find(
      (wp) => wp.workoutId === workoutId
    );
    return workoutProgress?.workoutCompleted || false;
  };

  const getWorkoutSubtitle = (workout: Workout, index: number): string => {
    if (courseName) {
      return `${courseName} / ${index + 1} день`;
    }
    return `Тренировка ${index + 1} / ${index + 1} день`;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Выберите тренировку</h2>
        
        {isLoading ? (
          <div className={styles.loading}>Загрузка тренировок...</div>
        ) : error ? (
          <div className={styles.error}>Ошибка: {error}</div>
        ) : workouts.length === 0 ? (
          <div className={styles.empty}>Тренировки не найдены</div>
        ) : (
          <>
            <ul className={styles.workoutsList}>
              {workouts.map((workout, index) => {
                const isCompleted = isWorkoutCompleted(workout._id);
                const isSelected = selectedWorkoutId === workout._id;
                return (
                  <li
                    key={workout._id}
                    className={`${styles.workoutItem} ${isSelected ? styles.selected : ''} ${isCompleted ? styles.completed : ''}`}
                    onClick={() => handleWorkoutSelect(workout._id)}
                  >
                    {isSelected ? (
                      <div className={styles.checkmark}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="9" fill="#bcec30" stroke="#bcec30" strokeWidth="2"/>
                          <path d="M6 10L9 13L14 7" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    ) : (
                      <div className={styles.radioButton}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="9" stroke="#000000" strokeWidth="2" fill="none"/>
                        </svg>
                      </div>
                    )}
                    <div className={styles.workoutInfo}>
                      <h3 className={styles.workoutName}>{workout.name}</h3>
                      <p className={styles.workoutSubtitle}>{getWorkoutSubtitle(workout, index)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <button 
              className={styles.startButton}
              onClick={handleStart}
              disabled={!selectedWorkoutId}
            >
              Начать
            </button>
          </>
        )}
      </div>
    </div>
  );
}
