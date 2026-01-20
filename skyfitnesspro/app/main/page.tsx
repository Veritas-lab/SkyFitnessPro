'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { usersApi, coursesApi, progressApi } from '@/lib/api';
import { User, Course, CourseProgress } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils';

// Маппинг изображений для курсов
const courseImageMap: Record<string, string> = {
  йога: '/img/yoga.png',
  yoga: '/img/yoga.png',
  стретчинг: '/img/stretching.png',
  stretching: '/img/stretching.png',
  фитнес: '/img/fitness.png',
  fitness: '/img/fitness.png',
  'степ-аэробика': '/img/step-aerobics.png',
  'step-aerobics': '/img/step-aerobics.png',
  бодифлекс: '/img/bodyflex.png',
  bodyflex: '/img/bodyflex.png',
};

const bgColorMap: Record<string, string> = {
  йога: 'bg-yellow-300',
  yoga: 'bg-yellow-300',
  стретчинг: 'bg-blue-300',
  stretching: 'bg-blue-300',
  фитнес: 'bg-orange-300',
  fitness: 'bg-orange-300',
  'степ-аэробика': 'bg-pink-300',
  'step-aerobics': 'bg-pink-300',
  бодифлекс: 'bg-purple-300',
  bodyflex: 'bg-purple-300',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<
    Record<string, CourseProgress>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const loadUserCourses = useCallback(async () => {
    // Защита от множественных одновременных запросов
    if (loadingRef.current) return;
    
    if (!user?.selectedCourses || user.selectedCourses.length === 0) {
      setLoading(false);
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      const coursePromises = user.selectedCourses.map((courseId) =>
        coursesApi.getById(courseId)
      );
      const coursesRes = await Promise.all(coursePromises);
      const coursesData = coursesRes.map((res) => res.data);
      setCourses(coursesData);

      // Загружаем прогресс для каждого курса
      const progressPromises = user.selectedCourses.map((courseId) =>
        progressApi
          .getCourseProgress(courseId)
          .then((res) => ({ courseId, progress: res.data }))
          .catch(() => null)
      );
      const progressResults = await Promise.all(progressPromises);
      const progressMapData: Record<string, CourseProgress> = {};
      progressResults.forEach((result) => {
        if (result) {
          progressMapData[result.courseId] = result.progress;
        }
      });
      setProgressMap(progressMapData);

      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [user?.selectedCourses]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth');
        return;
      }
      loadUserCourses();
    }
  }, [isAuthenticated, authLoading, router, loadUserCourses]);

  const handleRemoveCourse = async (courseId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот курс?')) return;

    try {
      await usersApi.removeCourse(courseId);
      // Перезагружаем страницу для обновления данных
      window.location.reload();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const getCourseImage = (course: Course): string => {
    const nameLower = course.nameRU.toLowerCase();
    for (const [key, image] of Object.entries(courseImageMap)) {
      if (nameLower.includes(key)) {
        return image;
      }
    }
    return '/img/fitness.png';
  };

  const getCourseBgColor = (course: Course): string => {
    const nameLower = course.nameRU.toLowerCase();
    for (const [key, color] of Object.entries(bgColorMap)) {
      if (nameLower.includes(key)) {
        return color;
      }
    }
    return 'bg-gray-300';
  };

  const getCourseProgress = (courseId: string) => {
    const progress = progressMap[courseId];
    if (!progress) return null;
    const completed = progress.workoutsProgress.filter(
      (w) => w.workoutCompleted
    ).length;
    const total = progress.workoutsProgress.length;
    return { completed, total, isCompleted: progress.courseCompleted };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white font-['Roboto']">
        <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-[140px] pt-20">
          <div className="text-center py-20">
            <p className="text-gray-600">Загрузка профиля...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white font-['Roboto']">
        <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-[140px] pt-20">
          <div className="text-center py-20">
            <p className="text-red-600">Ошибка: {error}</p>
            <button
              onClick={loadUserCourses}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Попробовать снова
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Roboto']">
      <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-[140px] pt-20 pb-12">
        {/* Информация о пользователе */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Мой профиль</h1>
          {user && (
            <p className="text-lg text-gray-600">Email: {user.email}</p>
          )}
        </div>

        {/* Выбранные курсы */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Мои курсы</h2>
          {courses.length === 0 ? (
            <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-gray-600 mb-4">
                У вас пока нет выбранных курсов
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#BCEC30] hover:bg-[#a8d228] text-black font-medium rounded-lg transition"
              >
                Выбрать курсы
              </Link>
            </div>
          ) : (
            <div
              className="
                grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
                gap-6 md:gap-8 lg:gap-[24px]
              "
            >
              {courses.map((course) => {
                const courseProgress = getCourseProgress(course._id);

                return (
                  <div
                    key={course._id}
                    className={`
                      relative rounded-[30px] overflow-hidden
                      w-full max-w-[360px] h-[501px]
                      shadow-[0_4px_67px_-12px_rgba(0,0,0,0.13)]
                      flex flex-col
                      ${getCourseBgColor(course)}
                      mx-auto lg:mx-0
                    `}
                  >
                    {/* Фото */}
                    <div className="relative h-[60%] bg-gray-200">
                      <Link href={`/courses/${course._id}`}>
                        <Image
                          src={getCourseImage(course)}
                          alt={course.nameRU}
                          fill
                          className="object-cover cursor-pointer"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      </Link>
                    </div>

                    {/* Информация */}
                    <div className="flex flex-col flex-1 p-6 pb-[15px] bg-white gap-4">
                      <Link href={`/courses/${course._id}`}>
                        <h3 className="text-xl md:text-2xl font-semibold cursor-pointer hover:text-blue-600">
                          {course.nameRU}
                        </h3>
                      </Link>

                      <div className="flex items-center text-sm md:text-base text-gray-600 gap-3">
                        <span>
                          {course.durationInDays
                            ? `${course.durationInDays} дней`
                            : '25 дней'}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>
                          {course.dailyDurationInMinutes
                            ? `${course.dailyDurationInMinutes.from}-${course.dailyDurationInMinutes.to} мин/день`
                            : '20-50 мин/день'}
                        </span>
                      </div>

                      {courseProgress && (
                        <div className="mt-auto">
                          <p className="text-sm text-gray-600 mb-1">
                            Прогресс: {courseProgress.completed} из{' '}
                            {courseProgress.total} тренировок
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${
                                  (courseProgress.completed /
                                    courseProgress.total) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          {courseProgress.isCompleted && (
                            <p className="text-sm text-green-600 font-medium mt-1">
                              ✓ Курс завершён
                            </p>
                          )}
                        </div>
                      )}

                      {course.difficulty && (
                        <div className="text-sm md:text-base text-blue-600 font-medium">
                          {course.difficulty}
                        </div>
                      )}
                    </div>

                    {/* Кнопка удаления */}
                    <button
                      onClick={() => handleRemoveCourse(course._id)}
                      className="
                        absolute top-5 right-5
                        bg-white rounded-full
                        w-10 h-10 md:w-12 md:h-12
                        flex items-center justify-center
                        shadow-md hover:bg-red-100
                        transition text-xl md:text-2xl font-bold
                        text-red-600
                      "
                      title="Удалить курс"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Кнопка добавления курсов */}
        {courses.length > 0 && (
          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
            >
              Добавить ещё курсы
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
