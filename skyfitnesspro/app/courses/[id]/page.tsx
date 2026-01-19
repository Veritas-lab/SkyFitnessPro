'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { coursesApi, usersApi, progressApi } from '@/lib/api';
import { Course, Workout, CourseProgress } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils';

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const loadingRef = useRef(false);

  const loadCourseData = useCallback(async () => {
    // Защита от множественных одновременных запросов
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
    try {
      setLoading(true);
      const [courseRes, workoutsRes, progressRes] = await Promise.all([
        coursesApi.getById(courseId),
        coursesApi.getWorkouts(courseId),
        progressApi.getCourseProgress(courseId).catch(() => null),
      ]);

      setCourse(courseRes.data);
      setWorkouts(workoutsRes.data);
      setProgress(progressRes?.data || null);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [courseId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    loadCourseData();
  }, [courseId, isAuthenticated, router, loadCourseData]);

  const handleRemoveCourse = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот курс?')) return;

    try {
      setIsRemoving(true);
      await usersApi.removeCourse(courseId);
      router.push('/profile');
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsRemoving(false);
    }
  };

  const handleResetProgress = async () => {
    if (!confirm('Вы уверены, что хотите сбросить весь прогресс по курсу?'))
      return;

    try {
      await coursesApi.resetProgress(courseId);
      await loadCourseData();
      alert('Прогресс курса удалён!');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const getWorkoutProgress = (workoutId: string) => {
    if (!progress) return null;
    return progress.workoutsProgress.find((w) => w.workoutId === workoutId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Roboto']">
        <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-[140px] pt-20">
          <div className="text-center py-20">
            <p className="text-gray-600">Загрузка курса...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white font-['Roboto']">
        <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-[140px] pt-20">
          <div className="text-center py-20">
            <p className="text-red-600">Ошибка: {error || 'Курс не найден'}</p>
            <Link
              href="/"
              className="mt-4 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Вернуться на главную
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Roboto']">
      <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-[140px] pt-20 pb-12">
        {/* Заголовок курса */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Вернуться к курсам
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {course.nameRU}
          </h1>
          {course.description && (
            <p className="text-lg text-gray-600 mb-4">{course.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {course.durationInDays && (
              <span>Длительность: {course.durationInDays} дней</span>
            )}
            {course.dailyDurationInMinutes && (
              <span>
                Время в день:{' '}
                {course.dailyDurationInMinutes.from}-
                {course.dailyDurationInMinutes.to} минут
              </span>
            )}
            {course.difficulty && <span>Сложность: {course.difficulty}</span>}
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={handleResetProgress}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
          >
            Сбросить прогресс
          </button>
          <button
            onClick={handleRemoveCourse}
            disabled={isRemoving}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
          >
            {isRemoving ? 'Удаление...' : 'Удалить курс'}
          </button>
        </div>

        {/* Прогресс курса */}
        {progress && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-lg font-semibold mb-2">
              Прогресс курса:{' '}
              {progress.courseCompleted ? (
                <span className="text-green-600">✓ Завершён</span>
              ) : (
                <span className="text-gray-600">В процессе</span>
              )}
            </p>
            <p className="text-sm text-gray-600">
              Выполнено тренировок:{' '}
              {
                progress.workoutsProgress.filter((w) => w.workoutCompleted)
                  .length
              }{' '}
              из {progress.workoutsProgress.length}
            </p>
          </div>
        )}

        {/* Список тренировок */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Тренировки</h2>
          {workouts.length === 0 ? (
            <p className="text-gray-600">Тренировки пока не добавлены</p>
          ) : (
            workouts.map((workout) => {
              const workoutProgress = getWorkoutProgress(workout._id);
              const isCompleted = workoutProgress?.workoutCompleted || false;

              return (
                <Link
                  key={workout._id}
                  href={`/workouts/${workout._id}?courseId=${courseId}`}
                  className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {workout.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Упражнений: {workout.exercises.length}
                      </p>
                      {workoutProgress && (
                        <p className="text-sm text-green-600 mt-1">
                          Прогресс: {workoutProgress.progressData.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      {isCompleted ? (
                        <span className="text-2xl">✓</span>
                      ) : (
                        <span className="text-2xl text-gray-400">→</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
