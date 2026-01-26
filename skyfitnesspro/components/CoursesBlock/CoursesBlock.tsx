'use client';

import styles from './CoursesBlock.module.css';
import CourseCard from '../CourseCard/CourseCard';
import { Course } from '@/lib/types';

interface CoursesBlockProps {
  courses: Course[];
  errorRes: string | null;
  isLoading: boolean;
}

export default function CoursesBlock({
  courses,
  errorRes,
  isLoading,
}: CoursesBlockProps) {
  return (
    <div className={styles.center__courses}>
      {errorRes ? (
        <div className={styles.error}>{errorRes}</div>
      ) : isLoading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : courses.length === 0 ? (
        <div className={styles.empty}>У вас пока нет выбранных курсов</div>
      ) : (
        courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))
      )}
    </div>
  );
}
