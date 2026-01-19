'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  workoutsApi,
  progressApi,
  coursesApi,
} from '@/lib/api';
import { Workout, WorkoutProgress, Course } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils';

// Динамический импорт ReactPlayer для избежания SSR проблем
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export default function WorkoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const workoutId = params.id as string;
  const courseId = searchParams.get('courseId') || '';

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<WorkoutProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [progressData, setProgressData] = useState<number[]>([]);
  const loadingRef = useRef(false);

  const loadWorkoutData = useCallback(async () => {
    // Защита от множественных одновременных запросов
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      const [workoutRes, courseRes, progressRes] = await Promise.all([
        workoutsApi.getById(workoutId),
        courseId ? coursesApi.getById(courseId).catch(() => null) : null,
        courseId
          ? progressApi
              .getWorkoutProgress(courseId, workoutId)
              .catch(() => null)
          : null,
      ]);

      setWorkout(workoutRes.data);
      setCourse(courseRes?.data || null);
      const progressData = progressRes?.data || null;
      setProgress(progressData);

      // Инициализируем progressData либо из сохранённого прогресса, либо нулями
      if (progressData && progressData.progressData.length > 0) {
        setProgressData(progressData.progressData);
      } else {
        setProgressData(
          new Array(workoutRes.data.exercises.length).fill(0)
        );
      }

      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [workoutId, courseId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    if (!courseId) {
      setError('Не указан ID курса');
      setLoading(false);
      return;
    }
    loadWorkoutData();
  }, [workoutId, courseId, isAuthenticated, router, loadWorkoutData]);

  const handleProgressChange = (index: number, value: number) => {
    const newProgress = [...progressData];
    newProgress[index] = Math.max(0, value);
    setProgressData(newProgress);
  };

  const handleSaveProgress = async () => {
    if (!courseId) {
      alert('Не указан ID курса');
      return;
    }

    try {
      setSaving(true);
      await workoutsApi.saveProgress(courseId, workoutId, progressData);
      await loadWorkoutData(); // Перезагружаем данные
      alert('Прогресс сохранён!');
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleResetProgress = async () => {
    if (!courseId) {
      alert('Не указан ID курса');
      return;
    }

    if (!confirm('Вы уверены, что хотите сбросить прогресс по тренировке?'))
      return;

    try {
      await workoutsApi.resetProgress(courseId, workoutId);
      await loadWorkoutData();
      alert('Прогресс тренировки удалён!');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Roboto']">
        <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-[140px] pt-20">
          <div className="text-center py-20">
            <p className="text-gray-600">Загрузка тренировки...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-white font-['Roboto']">
        <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-[140px] pt-20">
          <div className="text-center py-20">
            <p className="text-red-600">
              Ошибка: {error || 'Тренировка не найдена'}
            </p>
            {courseId && (
              <Link
                href={`/courses/${courseId}`}
                className="mt-4 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Вернуться к курсу
              </Link>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Roboto']">
      <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-[140px] pt-20 pb-12">
        {/* Навигация */}
        <div className="mb-8">
          {courseId && course ? (
            <Link
              href={`/courses/${courseId}`}
              className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
            >
              ← Вернуться к курсу: {course.nameRU}
            </Link>
          ) : (
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
            >
              ← Вернуться к курсам
            </Link>
          )}
        </div>

        {/* Заголовок тренировки */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {workout.name}
          </h1>
          {progress && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-lg font-semibold mb-2">
                Статус:{' '}
                {progress.workoutCompleted ? (
                  <span className="text-green-600">✓ Завершена</span>
                ) : (
                  <span className="text-gray-600">В процессе</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Видео */}
        {workout.video && (
          <div className="mb-8">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
              <ReactPlayer
                url={workout.video}
                width="100%"
                height="100%"
                controls
                playing={false}
              />
            </div>
          </div>
        )}

        {/* Упражнения */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Упражнения</h2>
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <div
                key={exercise._id || index}
                className="p-6 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{exercise.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Рекомендуется: {exercise.quantity} повторений
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    Выполнено:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={progressData[index] || 0}
                    onChange={(e) =>
                      handleProgressChange(index, parseInt(e.target.value) || 0)
                    }
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <span className="text-sm text-gray-600">повторений</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="flex gap-4">
          <button
            onClick={handleSaveProgress}
            disabled={saving}
            className="px-6 py-3 bg-[#BCEC30] hover:bg-[#a8d228] text-black font-medium rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить прогресс'}
          </button>
          {progress && (
            <button
              onClick={handleResetProgress}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition"
            >
              Сбросить прогресс
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
