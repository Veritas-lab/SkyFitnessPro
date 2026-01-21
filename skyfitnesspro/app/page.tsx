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
import PromoBanner from '@/components/PromoBanner/PromoBanner';
import Logo from '@/components/Logo/Logo';
import HeaderText from '@/components/HeaderText/HeaderText';

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
  const { isAuthenticated, user, refreshUser } = useAuth();
  const { openLogin } = useModal();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingCourseId, setAddingCourseId] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const coursesGridRef = useRef<HTMLDivElement>(null);
  const [buttonTop, setButtonTop] = useState<number>(0);

  const loadCourses = useCallback(async () => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      const res = await coursesApi.getAll();
      if (res && res.data && Array.isArray(res.data)) {
        setCourses(res.data);
      } else {
        setError('Неверный формат данных от сервера');
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      // Если ошибка 401, не показываем её как критическую для главной страницы
      // (курсы должны загружаться даже для неавторизованных пользователей)
      if (!errorMessage.includes('401') && !errorMessage.includes('Unauthorized') && !errorMessage.includes('Сессия истекла')) {
        setError(errorMessage);
      } else {
        // Для 401 просто не показываем ошибку, курсы должны загружаться
        setError(null);
      }
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

  useEffect(() => {
    if (coursesGridRef.current && courses.length > 0) {
      const gridHeight = coursesGridRef.current.offsetHeight;
      const buttonPosition = 350 + gridHeight + 34; // top карточек + высота сетки + отступ
      setButtonTop(buttonPosition);
    }
  }, [courses]);

  const handleAddCourse = async (courseId: string) => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    try {
      setAddingCourseId(courseId);
      await usersApi.addCourse(courseId);
      // Обновляем данные пользователя без перезагрузки страницы
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      // Если ошибка 401 (неавторизован), очищаем токен
      if (errorMessage.includes('401') || errorMessage.includes('неавторизован') || errorMessage.includes('Unauthorized')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      }
      alert(errorMessage);
    } finally {
      setAddingCourseId(null);
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setAddingCourseId(courseId);
      await usersApi.removeCourse(courseId);
      // Обновляем данные пользователя без перезагрузки страницы
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      alert(errorMessage);
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

  // Порядок курсов для отображения
  const courseOrder = ['йога', 'стретчинг', 'фитнес', 'степ-аэробика', 'бодифлекс'];
  
  const sortedCourses = [...courses].sort((a, b) => {
    const indexA = courseOrder.findIndex(order => 
      a.nameRU.toLowerCase().includes(order.toLowerCase())
    );
    const indexB = courseOrder.findIndex(order => 
      b.nameRU.toLowerCase().includes(order.toLowerCase())
    );
    
    // Если курс не найден в порядке, помещаем его в конец
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });

  return (
    <main className={styles.home}>
      {/* Header */}
      <div className={styles.header}>
        <Logo />
        <HeaderText />
        <button 
          className={styles.loginButton}
          onClick={openLogin}
        >
          Войти
        </button>
      </div>

      {/* Заголовок и баннер */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Начните заниматься спортом
            <br />
            и улучшите качество жизни
          </h1>
          <PromoBanner />
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
        <div ref={coursesGridRef} className={styles.coursesGrid}>
          {sortedCourses.map((course, index) => {
            const isSelected = isCourseSelected(course._id);
            const isAdding = addingCourseId === course._id;

            return (
              <div key={course._id} className={styles.courseCard}>
                {/* Фото */}
                <div className={`${styles.courseImageWrapper} ${getCourseBgColor(course)}`}>
                  <Link href={`/courses/${course._id}`} className={styles.courseImageLink}>
                    <Image
                      src={getCourseImage(course)}
                      alt={course.nameRU}
                      fill
                      className="object-cover cursor-pointer"
                      sizes="(max-width: 768px) 100vw, 360px"
                      loading={index === 0 ? "eager" : "lazy"}
                      priority={index === 0}
                    />
                  </Link>
                  
                  {/* Иконка добавления/удаления */}
                  <div
                    className={styles.addIcon}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isAdding) {
                        if (isSelected) {
                          handleRemoveCourse(course._id);
                        } else {
                          handleAddCourse(course._id);
                        }
                      }
                    }}
                    style={{ cursor: isAdding ? 'not-allowed' : 'pointer' }}
                  >
                    {isAdding ? (
                      <span>...</span>
                    ) : (
                      <Image
                        src={isSelected ? "/img/minus.svg" : "/img/plus.svg"}
                        alt={isSelected ? "Удалить курс" : "Добавить курс"}
                        width={26.66666603088379}
                        height={26.66666603088379}
                      />
                    )}
                  </div>
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
              </div>
            );
          })}
        </div>
      )}

      {/* Кнопка Наверх */}
      {buttonTop > 0 && (
        <div 
          className={styles.scrollTopButton}
          style={{ top: `${buttonTop}px` }}
        >
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Наверх ↑
          </button>
        </div>
      )}
    </main>
  );
}