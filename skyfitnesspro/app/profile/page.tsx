'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { usersApi, coursesApi, progressApi } from '@/lib/api';
import { Course, CourseProgress } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils';
import Logo from '@/components/Logo/Logo';
import styles from './profile.module.css';

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
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgress>>({});
  const [loading, setLoading] = useState(false); // Начинаем с false, чтобы профиль показывался сразу
  const [error, setError] = useState<string | null>(null);
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null);
  const loadingRef = useRef(false);

  // Получаем имя пользователя из email
  const getUserName = () => {
    if (!user?.email) return 'Пользователь';
    const emailParts = user.email.split('@');
    const namePart = emailParts[0];
    // Преобразуем первую букву в заглавную
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  // Получаем логин (email)
  const getUserLogin = () => {
    return user?.email || '';
  };

  const loadUserCourses = useCallback(async () => {
    if (loadingRef.current) return;
    
    if (!user?.selectedCourses || user.selectedCourses.length === 0) {
      setLoading(false);
      setCourses([]);
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      // Загружаем данные курсов и прогресс параллельно
      const coursePromises = user.selectedCourses.map((courseId) =>
        coursesApi.getById(courseId)
      );
      
      const progressPromises = user.selectedCourses.map((courseId) =>
        progressApi
          .getCourseProgress(courseId)
          .then((res) => ({ courseId, progress: res.data }))
          .catch(() => null)
      );

      // Загружаем курсы и прогресс параллельно
      const [coursesRes, progressResults] = await Promise.all([
        Promise.all(coursePromises),
        Promise.all(progressPromises)
      ]);

      // Сразу показываем курсы
      const coursesData = coursesRes.map((res) => res.data);
      setCourses(coursesData);

      // Обновляем прогресс
      const progressMapData: Record<string, CourseProgress> = {};
      progressResults.forEach((result) => {
        if (result) {
          progressMapData[result.courseId] = result.progress;
        }
      });
      setProgressMap(progressMapData);
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
        router.push('/');
        return;
      }
      // Загружаем курсы только если есть выбранные курсы
      if (user?.selectedCourses && user.selectedCourses.length > 0) {
        loadUserCourses();
      } else {
        setLoading(false);
        setCourses([]);
      }
    }
  }, [isAuthenticated, authLoading, router, loadUserCourses, user?.selectedCourses]);

  const handleRemoveCourse = async (courseId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот курс?')) return;

    try {
      setRemovingCourseId(courseId);
      await usersApi.removeCourse(courseId);
      // Обновляем данные пользователя
      if (refreshUser) {
        await refreshUser();
      }
      // Перезагружаем курсы
      await loadUserCourses();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setRemovingCourseId(null);
    }
  };

  const handleResetProgress = async (courseId: string) => {
    if (!confirm('Вы уверены, что хотите сбросить прогресс?')) return;

    try {
      await coursesApi.resetProgress(courseId);
      // Перезагружаем прогресс
      const progressRes = await progressApi.getCourseProgress(courseId).catch(() => null);
      if (progressRes) {
        setProgressMap((prev) => ({
          ...prev,
          [courseId]: progressRes.data,
        }));
      }
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

  const formatDuration = (days?: number): string => {
    if (!days) return '25 дней';
    return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`;
  };

  const formatTime = (dailyDuration?: { from: number; to: number }): string => {
    if (!dailyDuration) return '20-50 мин/день';
    return `${dailyDuration.from}-${dailyDuration.to} мин/день`;
  };

  const getCourseProgress = (courseId: string) => {
    const progress = progressMap[courseId];
    // Если прогресс не загружен, возвращаем начальные значения
    if (!progress) {
      return { completed: 0, total: 0, percentage: 0, isCompleted: false };
    }
    const completed = progress.workoutsProgress.filter((w) => w.workoutCompleted).length;
    const total = progress.workoutsProgress.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage, isCompleted: progress.courseCompleted };
  };

  const handleLogout = () => {
    logout();
  };

  if (authLoading) {
    return (
      <div className={styles.center__container}>
        <div className={styles.loading}>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.profilePage}>
      {/* Header */}
      <header className={styles.header}>
        <Logo />
        <div className={styles.userHeader}>
          <Image
            src="/img/Profile.svg"
            alt="profile"
            width={50}
            height={50}
          />
          <span className={styles.userHeaderName}>{getUserName()}</span>
        </div>
      </header>

      <div className={styles.center__container}>
        {/* Профиль пользователя */}
        <h1 className={styles.course__descTitle}>Профиль</h1>
        <div className={styles.userContainer}>
          <div className={styles.userImg}>
            <Image
              src="/img/Big_Profile.svg"
              alt="profile"
              loading="eager"
              fill
              sizes="197px"
            />
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userNameContainer}>
              <p className={styles.userNameMain}>{getUserName()}</p>
              <p className={styles.userName}>Логин: {getUserLogin()}</p>
            </div>
            <button className={styles.modal__btnLogOut} onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>

        {/* Мои курсы */}
        <h1 className={styles.course__descTitle}>Мои курсы</h1>
        
        {loading && courses.length === 0 ? (
          <div className={styles.loading}>
            <p>Загрузка курсов...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>Ошибка: {error}</p>
            <button onClick={loadUserCourses}>Попробовать снова</button>
          </div>
        ) : courses.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>
              У вас пока нет выбранных курсов.
            </p>
            <Link href="/" className={styles.emptyStateLink}>
              Выбрать курсы
            </Link>
          </div>
        ) : (
          <div className={styles.coursesGrid}>
            {courses.map((course) => {
              const courseProgress = getCourseProgress(course._id);
              const isRemoving = removingCourseId === course._id;

              return (
                <div key={course._id} className={styles.courseCard}>
                  {/* Фото с кнопкой удаления */}
                  <div className={`${styles.courseImageWrapper} ${getCourseBgColor(course)}`}>
                    <Link href={`/courses/${course._id}`} className={styles.courseImageLink}>
                      <Image
                        src={getCourseImage(course)}
                        alt={course.nameRU}
                        fill
                        className={styles.courseImage}
                        sizes="(max-width: 768px) 100vw, 360px"
                      />
                    </Link>
                    <button
                      className={styles.removeCourseButton}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveCourse(course._id);
                      }}
                      disabled={isRemoving}
                      title="Удалить курс"
                    >
                      {isRemoving ? '...' : '−'}
                    </button>
                  </div>

                  {/* Информация */}
                  <div className={styles.courseInfo}>
                    <Link href={`/courses/${course._id}`}>
                      <h3 className={styles.courseTitle}>{course.nameRU}</h3>
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

                    {/* Прогресс */}
                    <div className={styles.progressSection}>
                      <p className={styles.progressText}>
                        Прогресс {courseProgress.percentage}%
                      </p>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${courseProgress.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Кнопка действия */}
                    <div className={styles.courseAction}>
                      {courseProgress.isCompleted ? (
                        <button
                          className={styles.actionButton}
                          onClick={() => handleResetProgress(course._id)}
                        >
                          Начать заново
                        </button>
                      ) : courseProgress.completed > 0 ? (
                        <Link
                          href={`/courses/${course._id}`}
                          className={styles.actionButton}
                        >
                          Продолжить
                        </Link>
                      ) : (
                        <Link
                          href={`/courses/${course._id}`}
                          className={styles.actionButton}
                        >
                          Начать тренировки
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
