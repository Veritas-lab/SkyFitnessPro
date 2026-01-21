'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { usersApi, coursesApi, progressApi } from '@/lib/api';
import { Course, CourseProgress } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils';
import styles from './im.module.css';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null);
  const loadingRef = useRef(false);

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
      
      // Загружаем данные курсов
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
      loadUserCourses();
    }
  }, [isAuthenticated, authLoading, router, loadUserCourses]);

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
    if (!progress) return null;
    const completed = progress.workoutsProgress.filter((w) => w.workoutCompleted).length;
    const total = progress.workoutsProgress.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage, isCompleted: progress.courseCompleted };
  };

  const handleLogout = () => {
    logout();
  };

  if (authLoading || loading) {
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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userNameContainer}>
            <p className={styles.userNameMain}>{user?.email || 'Пользователь'}</p>
            <p className={styles.userName}>Логин: {user?.email || ''}</p>
          </div>
          <button className={styles.modal__btnLogOut} onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>

      {/* Мои курсы */}
      <h1 className={styles.course__descTitle}>Мои курсы</h1>
      
      {error ? (
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
                    onClick={() => handleRemoveCourse(course._id)}
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
                  {courseProgress && (
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
                  )}

                  {/* Кнопка действия */}
                  <div className={styles.courseAction}>
                    {courseProgress?.isCompleted ? (
                      <button
                        className={styles.actionButton}
                        onClick={() => handleResetProgress(course._id)}
                      >
                        Начать заново
                      </button>
                    ) : courseProgress && courseProgress.completed > 0 ? (
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
  );
}
