'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import { coursesApi, usersApi } from '@/lib/api';
import { Course } from '@/lib/types';
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

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingCourseId, setAddingCourseId] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const loadCourses = useCallback(async () => {
    // Защита от множественных одновременных запросов
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      const res = await coursesApi.getAll();
      setCourses(res.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Загружаем курсы только в браузере
    if (typeof window !== 'undefined') {
      loadCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCourse = async (courseId: string) => {
    if (!isAuthenticated) {
      // Перенаправляем на страницу авторизации
      window.location.href = '/auth';
      return;
    }

    try {
      setAddingCourseId(courseId);
      await usersApi.addCourse(courseId);
      // Обновляем данные пользователя без перезагрузки страницы
      const userRes = await usersApi.getMe();
      // Обновляем состояние через useAuth - нужно будет добавить метод обновления
      // Пока просто показываем успех
      alert('Курс успешно добавлен!');
      // Перезагружаем страницу для обновления UI
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setAddingCourseId(null);
    }
  };

  const getCourseImage = (course: Course): string => {
    const nameLower = course.nameRU.toLowerCase();
    for (const [key, image] of Object.entries(courseImageMap)) {
      if (nameLower.includes(key)) {
        return image;
      }
    }
    return '/img/fitness.png'; // дефолтное изображение
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

  const formatDuration = (days?: number): string => {
    if (!days) return '25 дней';
    return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`;
  };

  const formatTime = (dailyDuration?: { from: number; to: number }): string => {
    if (!dailyDuration) return '20-50 мин/день';
    return `${dailyDuration.from}-${dailyDuration.to} мин/день`;
  };

  const isCourseSelected = (courseId: string): boolean => {
    return user?.selectedCourses?.includes(courseId) || false;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-['Roboto']">
      <main className="relative">
        {/* Заголовок и баннер */}
        <div>
          <div className="flex items-start gap-8">
            <div className="flex-1">
              <h1 
                className="text-[60px] font-medium leading-[100%] text-[#000000] text-left"
                style={{ fontFamily: 'Roboto', fontWeight: 500 }}
              >
                Начните заниматься спортом
                <br />
                и улучшите качество жизни
              </h1>
            </div>
            
            {/* Картинка справа */}
            <div className="hidden lg:block flex-shrink-0">
              <Image
                src="/img/change_body.png"
                alt="Измени своё тело"
                width={400}
                height={400}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Блок карточек */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-gray-600 mt-4">Загрузка курсов...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600">Ошибка: {error}</p>
            <button
              onClick={loadCourses}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Попробовать снова
            </button>
          </div>
        ) : (
          <div
            className="
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
              gap-[24px]
              mt-[50px]
              ml-0
            "
            style={{ left: '140px' }}
          >
            {courses.map((course) => {
              const isSelected = isCourseSelected(course._id);
              const isAdding = addingCourseId === course._id;

              return (
                <div
                  key={course._id}
                  className="relative rounded-[30px] overflow-hidden flex flex-col"
                  style={{
                    width: '360px',
                    height: '501px',
                  }}
                >
                  {/* Фото */}
                  <div 
                    className={`relative overflow-hidden ${getCourseBgColor(course)}`}
                    style={{
                      width: '360px',
                      height: '325px',
                    }}
                  >
                    <Link href={`/courses/${course._id}`}>
                      <Image
                        src={getCourseImage(course)}
                        alt={course.nameRU}
                        width={360}
                        height={325}
                        className="object-cover cursor-pointer"
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </Link>
                  </div>

                  {/* Информация */}
                  <div 
                    className="flex flex-col flex-1 bg-white px-6"
                    style={{
                      paddingBottom: '15px',
                      gap: '24px',
                    }}
                  >
                    <Link href={`/courses/${course._id}`}>
                      <h3 className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-600">
                        {course.nameRU}
                      </h3>
                    </Link>

                    <div className="flex items-center text-sm text-gray-600 gap-3">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/img/calendar.svg"
                          alt="Календарь"
                          width={16}
                          height={16}
                        />
                        <span>{formatDuration(course.durationInDays)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image
                          src="/img/clock.svg"
                          alt="Часы"
                          width={16}
                          height={16}
                        />
                        <span>{formatTime(course.dailyDurationInMinutes)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Image
                        src="/img/complexity.svg"
                        alt="Сложность"
                        width={16}
                        height={16}
                      />
                      <span>Сложность</span>
                    </div>
                  </div>

                  {/* Кнопка + */}
                  <button
                    onClick={() => handleAddCourse(course._id)}
                    disabled={isSelected || isAdding}
                    className="
                      absolute top-5 right-5
                      bg-white rounded-full
                      w-10 h-10 md:w-12 md:h-12
                      flex items-center justify-center
                      shadow-md hover:bg-gray-100
                      transition text-2xl md:text-3xl font-bold
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                    title={
                      isSelected
                        ? 'Курс уже добавлен'
                        : isAdding
                        ? 'Добавление...'
                        : 'Добавить курс'
                    }
                  >
                    {isSelected ? '✓' : isAdding ? '...' : '+'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Кнопка Наверх */}
        <div className="mt-16 md:mt-24 pb-12 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-10 py-5 bg-[#BCEC30] hover:bg-[#a8d228] text-black font-medium rounded-full transition text-lg"
          >
            Наверх ↑
          </button>
        </div>
      </main>
    </div>
  );
}
