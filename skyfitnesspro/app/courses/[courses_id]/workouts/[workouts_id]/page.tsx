'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AxiosError } from 'axios';
import styles from './workouts.module.css';
import { useAuth } from '@/hooks/useAuth';
import { Workout } from '@/lib/types';
import { workoutsApi, progressApi, coursesApi } from '@/lib/api';
import Logo from '@/components/Logo/Logo';
import ModalProgress from '@/components/ModalProgress/ModalProgress';
import { getErrorMessage } from '@/lib/utils';

export default function WorkoutPage() {
  const params = useParams<{ courses_id: string; workouts_id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const workoutId = params.workouts_id;
  const courseId = params.courses_id;
  const [courseName, setCourseName] = useState<string>('Тренировка');
  const [workoutData, setWorkoutData] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<number[]>([]);

  useEffect(() => {
    if (!workoutId || !courseId) {
      setIsLoading(false);
      return;
    }

    const loadWorkout = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        
        // Загружаем данные курса для получения названия
        try {
          const courseResponse = await coursesApi.getById(courseId);
          setCourseName(courseResponse.data.nameRU || 'Тренировка');
        } catch (courseError) {
          // Если не удалось загрузить курс, используем дефолтное название
          console.warn('Не удалось загрузить данные курса:', courseError);
        }

        // Загружаем данные тренировки
        const workoutResponse = await workoutsApi.getById(workoutId);
        const workout = workoutResponse.data;
        
        // Детальное логирование для отладки
        if (process.env.NODE_ENV === 'development') {
          console.log('📦 Полный ответ от API тренировки:', workoutResponse);
          console.log('📦 Данные тренировки:', workout);
          console.log('📹 Поле video:', workout.video);
          console.log('📹 Тип video:', typeof workout.video);
          if (workout.video) {
            console.log('📹 Длина video:', workout.video.length);
            console.log('📹 Первые 100 символов video:', workout.video.substring(0, 100));
          }
        }
        
        setWorkoutData(workout);

        // Инициализируем прогресс нулями
        const initialProgress = new Array(workout.exercises.length).fill(0);
        setCurrentProgress(initialProgress);

        // Загружаем прогресс пользователя, если авторизован
        if (isAuthenticated && courseId) {
          try {
            const progressResponse = await progressApi.getWorkoutProgress(
              courseId,
              workoutId
            );
            const progress = progressResponse.data;
            if (progress.progressData && Array.isArray(progress.progressData) && progress.progressData.length > 0) {
              setCurrentProgress(progress.progressData);
            }
          } catch (progressError) {
            // Если прогресс не найден, используем нули
            console.warn('Не удалось загрузить прогресс:', progressError);
          }
        }
      } catch (error: unknown) {
        const errorMsg = getErrorMessage(error);
        setErrorMessage(errorMsg || 'Ошибка загрузки тренировки');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkout();
  }, [workoutId, courseId, isAuthenticated]);

  const workoutName = workoutData?.name || 'Тренировка';
  const videoUrl = workoutData?.video;
  
  // Используем оригинальный embed URL из API, если он уже в правильном формате
  // Или извлекаем ID и формируем новый embed URL
  const embedUrl = useMemo(() => {
    if (!videoUrl) return null;
    
    const cleanUrl = String(videoUrl).trim();
    
    // Если это уже embed URL, используем его как есть (но добавляем параметры для лучшей совместимости)
    if (cleanUrl.includes('youtube.com/embed/')) {
      // Если в URL уже есть параметры, добавляем наши к существующим
      const separator = cleanUrl.includes('?') ? '&' : '?';
      return `${cleanUrl}${separator}rel=0&modestbranding=1&controls=1`;
    }
    
    // Если это watch URL, извлекаем ID и формируем embed URL
    if (cleanUrl.includes('youtube.com/watch')) {
      const match = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&controls=1`;
      }
    }
    
    // Если это короткий URL youtu.be, извлекаем ID
    if (cleanUrl.includes('youtu.be/')) {
      const match = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&controls=1`;
      }
    }
    
    // Если это только ID (11 символов), формируем embed URL
    if (cleanUrl.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return `https://www.youtube.com/embed/${cleanUrl}?rel=0&modestbranding=1&controls=1`;
    }
    
    // В остальных случаях возвращаем null
    return null;
  }, [videoUrl]);
  
  // Логируем для отладки
  if (process.env.NODE_ENV === 'development') {
    console.log('📹 Исходный videoUrl:', videoUrl);
    console.log('📹 Embed URL для iframe:', embedUrl);
  }

  // Получаем имя пользователя из email
  const getUserName = () => {
    if (!user?.email) return '';
    const emailParts = user.email.split('@');
    const namePart = emailParts[0];
    const nameBeforeDot = namePart.split('.')[0];
    const capitalizedName = nameBeforeDot.charAt(0).toUpperCase() + nameBeforeDot.slice(1);
    if (capitalizedName.length < 2 || /\d/.test(capitalizedName)) {
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return capitalizedName;
  };

  if (isLoading) {
    return (
      <div className={styles.workoutContainer}>
        <header className={styles.header}>
          <Logo />
          {isAuthenticated && user && (
            <div className={styles.userHeader}>
              <Image
                src="/img/Profile.svg"
                alt="profile"
                width={50}
                height={50}
              />
              <span className={styles.userHeaderName}>
                {getUserName() || user.email || 'Пользователь'}
              </span>
            </div>
          )}
        </header>
        <div className={styles.loading}>
          <p>Загрузка данных тренировки...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !workoutData) {
    return (
      <div className={styles.workoutContainer}>
        <header className={styles.header}>
          <Logo />
          {isAuthenticated && user && (
            <div className={styles.userHeader}>
              <Image
                src="/img/Profile.svg"
                alt="profile"
                width={50}
                height={50}
              />
              <span className={styles.userHeaderName}>
                {getUserName() || user.email || 'Пользователь'}
              </span>
            </div>
          )}
        </header>
        <div className={styles.error}>
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
      <header className={styles.header}>
        <Logo />
        {isAuthenticated && user && (
          <div className={styles.userHeader}>
            <Image
              src="/img/Profile.svg"
              alt="profile"
              width={50}
              height={50}
            />
            <span className={styles.userHeaderName}>
              {getUserName() || user.email || 'Пользователь'}
            </span>
          </div>
        )}
      </header>

      <h1 className={styles.workoutTitle}>{courseName}</h1>

      <div className={styles.videoBlock}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className={styles.videoIframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={workoutName}
            frameBorder="0"
            loading="lazy"
          />
        ) : (
          <div className={styles.noVideo}>
            <p>Ссылка на видео отсутствует.</p>
          </div>
        )}
      </div>

      <div className={styles.exercisesBlock}>
        <h2 className={styles.exercisesBlockTitle}>
          Упражнения тренировки {workoutData.name || '2'}
        </h2>
        <ul className={styles.exercisesBlockUl}>
          {workoutData.exercises.map((exercise, index: number) => {
            const progressValue = currentProgress[index] || 0;
            const targetQuantity = workoutData.exercises[index]?.quantity || 1;
            const progressPercentage = Math.min(
              Math.round((progressValue / targetQuantity) * 100),
              100
            );
            
            return (
              <li className={styles.exercisesBlockList} key={exercise._id || index}>
                <span className={styles.exerciseName}>{exercise.name}</span>
                <span className={styles.exerciseProgress}>{progressPercentage}%</span>
              </li>
            );
          })}
        </ul>
        <button
          className={styles.progressButton}
          onClick={openWorkOut}
          disabled={isLoading}
        >
          Заполнить свой прогресс
        </button>
        {isModalOpen && workoutData && (
          <ModalProgress
            key={workoutId}
            courseId={courseId}
            workoutId={workoutId}
            initialProgress={currentProgress}
            exercises={workoutData.exercises}
            onSaveProgress={handleSaveProgress}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
