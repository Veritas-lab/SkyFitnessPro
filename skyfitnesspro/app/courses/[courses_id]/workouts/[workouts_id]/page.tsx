'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AxiosError } from 'axios';
import styles from './workouts.module.css';
import { useAppSelector } from '@/store/store';
import { Workout } from '@/lib/types';
import { workoutsApi, progressApi } from '@/lib/api';
import Header from '@/components/Header/Header';
import BaseButton from '@/components/Button/Button';
import ModalProgress from '@/components/ModalProgress/ModalProgress';

export default function WorkoutPage() {
  const params = useParams<{ courses_id: string; workouts_id: string }>();
  const { allCourses } = useAppSelector((state) => state.course);
  const workoutId = params.workouts_id;
  const courseId = params.courses_id;
  const targetCourse = allCourses.find((course) => course._id === courseId);
  const courseName = targetCourse
    ? targetCourse.nameRU
    : 'Название курса не найдено';
  const token = useAppSelector((state) => state.auth.token);
  const [workoutData, setWorkoutData] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<number[]>([]);

  useEffect(() => {
    if (!workoutId) {
      setIsLoading(false);
      return;
    }

    const loadWorkout = async () => {
      try {
        // Загружаем данные тренировки
        const workoutResponse = await workoutsApi.getById(workoutId);
        const workout = workoutResponse.data;
        setWorkoutData(workout);

        // Инициализируем прогресс нулями
        const initialProgress = new Array(workout.exercises.length).fill(0);
        setCurrentProgress(initialProgress);

        // Загружаем прогресс пользователя, если авторизован
        if (token && courseId) {
          try {
            const progressResponse = await progressApi.getWorkoutProgress(
              courseId,
              workoutId
            );
            const progress = progressResponse.data;
            if (progress.progressData && progress.progressData.length > 0) {
              setCurrentProgress(progress.progressData);
            }
          } catch (progressError) {
            // Если прогресс не найден, используем нули
          }
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response) {
          setErrorMessage(
            error.response.data.message || 'Ошибка загрузки тренировки',
          );
        } else {
          setErrorMessage('Ошибка сети или неизвестная ошибка.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkout();
  }, [workoutId, courseId, token]);

  const workoutName = workoutData?.name || 'Тренировка';
  const videoUrl = workoutData?.video;

  if (isLoading) {
    return (
      <div className={styles.workoutContainer}>
        <Header />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Загрузка данных тренировки...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !workoutData) {
    return (
      <div className={styles.workoutContainer}>
        <Header />
        <div style={{ padding: '40px', textAlign: 'center', color: '#ff0000' }}>
          <p>Ошибка: {errorMessage || 'Данные тренировки не найдены.'}</p>
        </div>
      </div>
    );
  }

  const openWorkOut = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSaveProgress = (updatedProgress: number[]) => {
    setCurrentProgress(updatedProgress);
  };

  return (
    <div className={styles.workoutContainer}>
      <Header />

      <h1 className={styles.workoutTitle}>{courseName}</h1>

      <div className={styles.videoBlock}>
        {videoUrl ? (
          <iframe
            width="100%"
            height="639px"
            src={videoUrl}
            title={workoutName}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        ) : (
          <p style={{ color: 'black' }}>Ссылка на видео отсутствует.</p>
        )}
      </div>

      <div className={styles.exercisesBlock}>
        <h2 className={styles.exercisesBlockTitle}>
          Упражнения тренировки {workoutData.name || '2'}
        </h2>
        <ul className={styles.exercisesBlockUl}>
          {workoutData.exercises.map((exercise, index: number) => {
            const progressValue = currentProgress[index] || 0;
            const progressPercentage = workoutData.exercises[index]?.quantity
              ? Math.round((progressValue / workoutData.exercises[index].quantity) * 100)
              : 0;
            
            return (
              <li className={styles.exercisesBlockList} key={exercise._id || index}>
                {exercise.name} {progressPercentage}%
              </li>
            );
          })}
        </ul>
        <BaseButton
          disabled={isLoading}
          onClick={openWorkOut}
          fullWidth={false}
          text="Заполнить свой прогресс"
        />
        {isModalOpen ? (
          <ModalProgress
            key={workoutId}
            courseId={courseId}
            workoutId={workoutId}
            initialProgress={currentProgress}
            onSaveProgress={handleSaveProgress}
            onClose={() => setIsModalOpen(false)}
          />
        ) : null}
      </div>
    </div>
  );
}
