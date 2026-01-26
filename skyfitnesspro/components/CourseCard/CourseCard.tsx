'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './CourseCard.module.css';
import type { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const duration = course.durationInDays
    ? `${course.durationInDays} дней`
    : '';
  const timePerDay = course.dailyDurationInMinutes
    ? `${course.dailyDurationInMinutes.from}-${course.dailyDurationInMinutes.to} мин/день`
    : '';
  const difficulty = course.difficulty || '';

  const getCourseImage = (nameRU: string, nameEN: string) => {
    const images: Record<string, string> = {
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
    return images[nameRU.toLowerCase()] || images[nameEN.toLowerCase()] || '/img/yoga.png';
  };

  const imageSrc = getCourseImage(course.nameRU, course.nameEN);

  return (
    <Link href={`/courses/${course._id}`} className={styles.courseCardLink}>
      <div className={styles.courseCard}>
        <div className={styles.courseImage}>
          <Image
            src={imageSrc}
            alt={course.nameRU}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, 360px"
            priority
          />
          <button
            type="button"
            className={styles.addIcon}
            aria-label="Добавить"
          >
            +
          </button>
        </div>

        <div className={styles.courseContent}>
          <div className={styles.courseInfo}>
            <div className={styles.infoLeft}>
              <h4 className={styles.courseTitleText}>{course.nameRU}</h4>
              <div className={styles.inlineInfo}>
                <Image
                  src="/img/calendar.svg"
                  alt="Календарь"
                  width={20}
                  height={20}
                />
                <span className={styles.courseParam}>{duration}</span>
                <Image
                  src="/img/clock.svg"
                  alt="Время"
                  width={20}
                  height={20}
                />
                <span className={styles.courseParam}>{timePerDay}</span>
              </div>
            </div>
          </div>
          {difficulty && (
          <div className={styles.difficultyTag}>
            <Image
              src="/img/complexity.svg"
              alt="Сложность"
              width={20}
              height={20}
              style={{ marginRight: '8px' }}
            />
            <span className={styles.courseParam}>{difficulty}</span>
          </div>
          )}
        </div>
      </div>
    </Link>
  );
}