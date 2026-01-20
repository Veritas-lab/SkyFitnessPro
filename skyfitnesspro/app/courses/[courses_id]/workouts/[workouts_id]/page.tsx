'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AxiosError } from 'axios';
import styles from './workout.module.css';
import { useAppDispatch, useAppSelector } from '../../../../../../store/store';
import { WorkOutTypes } from '../../../../../../sharedTyres/shared.Types';
import { getWorkOutId } from '../../../../../../servises/course/courseApi';
import Header from '../../../../../../components/Header/Header';
import BaseButton from '../../../../../../components/Button/Button';
import ModalProgress from '../../../../../../components/ModalProgress/ModalProgress';

export default function WorkoutPage() {
  const dispatch = useAppDispatch();
  const params = useParams<{ courseId: string; workoutId: string }>();
  const { allCourses } = useAppSelector((state) => state.course);
  const workoutId = params.workoutId;
  const courseId = params.courseId;
  const targetCourse = allCourses.find((course) => course._id === courseId);
  const courseName = targetCourse
    ? targetCourse.nameRU
    : 'Название курса не найдено';
  const token = useAppSelector((state) => state.auth.token);
  const [workoutData, setWorkoutData] = useState<WorkOutTypes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<number[]>([]);

  useEffect(() => {
    if (!workoutId || !token) {
      return;
    }

    getWorkOutId(workoutId, token)
      .then((data: WorkOutTypes) => {
        setWorkoutData(data);
        setCurrentProgress(new Array(data.exercises.length).fill(0));
        console.log(data);
      })
      .catch((error) => {
        if (error instanceof AxiosError && error.response) {
          setErrorMessage(
            error.response.data.message || 'Ошибка загрузки тренировки',
          );
        } else {
          setErrorMessage('Ошибка сети или неизвестная ошибка.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [workoutId, token]);

  const workoutName = workoutData?.name || 'Тренировка';
  const videoUrl = workoutData?.video;

  if (isLoading) {
    return (
      <div style={{ color: 'white', padding: '20px' }}>
        Загрузка данных тренировки...
      </div>
    );
  }

  if (errorMessage || !workoutData) {
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        Ошибка: {errorMessage || 'Данные тренировки не найдены.'}
      </div>
    );
  }

  const onWorkOut = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    openWorkOut();
  };

  const openWorkOut = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSaveProgress = (updatedProgress: number[]) => {
  
    setCurrentProgress(updatedProgress);
    // добавить сообщение об успехе
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
        <h2 className={styles.exercisesBlockTitle}>Упражнения тренировки </h2>
        <ul className={styles.exercisesBlockUl}>
          {workoutData.exercises.map((exercise, index) => (
            <li className={styles.exercisesBlockList} key={exercise._id}>
              {exercise.name} ({currentProgress[index] || 0} %)
            </li>
          ))}
        </ul>
        <BaseButton
          disabled={isLoading}
          onClick={onWorkOut}
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