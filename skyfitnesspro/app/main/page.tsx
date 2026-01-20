'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { usersApi, coursesApi, progressApi } from '@/lib/api';
import { User, Course, CourseProgress } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils';
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
        router.push('/auth/signin');
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
    const completed = progress.workoutsProgress.filter(
      (w) => w.workoutCompleted
    ).length;
    const total = progress.workoutsProgress.length;
    return { completed, total, isCompleted: progress.courseCompleted };
  };

  if (authLoading || loading) {
    return (
      <div className={styles.profile}>
        <div className={styles.loading}>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.profile}>
        <div className={styles.error}>
          <p>Ошибка: {error}</p>
          <button onClick={loadUserCourses}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      <h1 className={styles.title}>Мои курсы</h1>
      
      {courses.length === 0 ? (
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
            const progressPercentage = courseProgress
              ? Math.round((courseProgress.completed / courseProgress.total) * 100)
              : 0;

            return (
              <div
                key={course._id}
                className={`${styles.courseCard} ${getCourseBgColor(course)}`}
              >
                {/* Фото */}
                <div className={styles.courseImageWrapper}>
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
                      <span>
                        {formatDuration(course.durationInDays)}
                      </span>
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

                  {courseProgress && (
                    <div>
                      <p className={styles.progressText}>
                        Прогресс: {courseProgress.completed} из {courseProgress.total} тренировок ({progressPercentage}%)
                      </p>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      {courseProgress.isCompleted && (
                        <p style={{ color: '#4caf50', fontSize: '14px', marginTop: '8px' }}>
                          ✓ Курс завершён
                        </p>
                      )}
                    </div>
                  )}

                  <div className={styles.courseComplexity}>
                    <Image
                      src="/img/complexity.svg"
                      alt="Сложность"
                      width={16}
                      height={16}
                    />
                    <span>Сложность</span>
                  </div>

                  <div className={styles.courseActions}>
                    <Link
                      href={`/courses/${course._id}`}
                      className={styles.startWorkoutButton}
                    >
                      Начать тренировку
                    </Link>
                    <button
                      onClick={() => handleRemoveCourse(course._id)}
                      className={`${styles.actionButton} ${styles.removeButton}`}
                    >
                      Удалить
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Вы уверены, что хотите сбросить прогресс?')) return;
                        try {
                          await coursesApi.resetProgress(course._id);
                          window.location.reload();
                        } catch (err) {
                          alert(getErrorMessage(err));
                        }
                      }}
                      className={`${styles.actionButton} ${styles.resetButton}`}
                    >
                      Сбросить прогресс
                    </button>
                  </div>
                </div>
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
    </div>
  );
}
