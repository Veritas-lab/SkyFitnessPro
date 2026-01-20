'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { coursesApi, progressApi } from '@/lib/api';
import { Workout, CourseProgress } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import styles from './ModalWorkouts.module.css';

interface ModalWorkoutsProps {
  courseId: string;
  onClose: () => void;
}

export default function ModalWorkouts({ courseId, onClose }: ModalWorkoutsProps) {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          // Прогресс не обязателен
          console.warn('Прогресс не загружен:', progressErr);
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

  const handleWorkoutClick = (workoutId: string) => {
    router.push(`/courses/${courseId}/workouts/${workoutId}`);
    onClose();
  };

  const isWorkoutCompleted = (workoutId: string): boolean => {
    if (!progress) return false;
    const workoutProgress = progress.workoutsProgress.find(
      (wp) => wp.workoutId === workoutId
    );
    return workoutProgress?.workoutCompleted || false;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.modalTitle}>Выберите тренировку</h2>
        
        {isLoading ? (
          <div className={styles.loading}>Загрузка тренировок...</div>
        ) : error ? (
          <div className={styles.error}>Ошибка: {error}</div>
        ) : workouts.length === 0 ? (
          <div className={styles.empty}>Тренировки не найдены</div>
        ) : (
          <ul className={styles.workoutsList}>
            {workouts.map((workout, index) => {
              const isCompleted = isWorkoutCompleted(workout._id);
              return (
                <li
                  key={workout._id}
                  className={`${styles.workoutItem} ${isCompleted ? styles.completed : ''}`}
                  onClick={() => handleWorkoutClick(workout._id)}
                >
                  <div className={styles.workoutNumber}>{index + 1}</div>
                  <div className={styles.workoutInfo}>
                    <h3 className={styles.workoutName}>{workout.name}</h3>
                    <p className={styles.workoutExercises}>
                      {workout.exercises.length} упражнений
                    </p>
                  </div>
                  {isCompleted && (
                    <div className={styles.completedBadge}>✓</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
