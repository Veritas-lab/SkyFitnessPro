'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import { coursesApi, usersApi } from '@/lib/api';
import { Course } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils';
import { useModal } from '@/context/ModalContext';
import styles from './page.module.css';

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
  const { openLogin } = useModal();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingCourseId, setAddingCourseId] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const loadCourses = useCallback(async () => {
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
    if (typeof window !== 'undefined') {
      loadCourses();
    }
  }, [loadCourses]);

  const handleAddCourse = async (courseId: string) => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    try {
      setAddingCourseId(courseId);
      await usersApi.addCourse(courseId);
      const userRes = await usersApi.getMe();
      alert('Курс успешно добавлен!');
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
    <main className={styles.home}>
      {/* Заголовок и баннер */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Начните заниматься спортом
          <br />
          и улучшите качество жизни
        </h1>
        <div className={styles.heroImage}>
          <Image
            src="/img/change_body.png"
            alt="Измени своё тело"
            width={400}
            height={400}
            className="object-contain"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </div>
      </div>

      {/* Блок карточек */}
      {loading ? (
        <div className={styles.loading}>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-gray-600 mt-4">Загрузка курсов...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>
          <p>Ошибка: {error}</p>
          <button onClick={loadCourses}>
            Попробовать снова
          </button>
        </div>
      ) : (
        <div className={styles.coursesGrid}>
          {courses.map((course) => {
            const isSelected = isCourseSelected(course._id);
            const isAdding = addingCourseId === course._id;

            return (
              <div key={course._id} className={styles.courseCard}>
                {/* Фото */}
                <div className={`${styles.courseImageWrapper} ${getCourseBgColor(course)}`}>
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
                <div className={styles.courseInfo}>
                  <Link href={`/courses/${course._id}`}>
                    <h3 className={styles.courseTitle}>
                      {course.nameRU}
                    </h3>
                  </Link>

                  <div className={styles.courseMeta}>
                    <div className={styles.courseMetaItem}>
                      <Image
                        src="/img/calendar.svg"
                        alt="Календарь"
                        width={16}
                        height={16}
                      />
                      <span>{formatDuration(course.durationInDays)}</span>
                    </div>
                    <div className={styles.courseMetaItem}>
                      <Image
                        src="/img/clock.svg"
                        alt="Часы"
                        width={16}
                        height={16}
                      />
                      <span>{formatTime(course.dailyDurationInMinutes)}</span>
                    </div>
                  </div>

                  <div className={styles.courseComplexity}>
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
                  className={styles.addButton}
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
      <div className={styles.scrollTopButton}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Наверх ↑
        </button>
      </div>
    </main>
  );
}
