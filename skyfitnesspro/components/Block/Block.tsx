import styles from './coursesBlock.module.css';
import CourseCard from '../CourseCard/CourseCard';
import { CourseTypes } from '../../sharedTyres/shared.Types';

interface CenterBLockProps {
  courses: CourseTypes[];
  errorRes: string | null;
  isLoading: boolean;
}

export default function CoursesBlock({
  courses,
  errorRes,
  isLoading,
}: CenterBLockProps) {
  return (
    <div className={styles.center__courses}>
      {errorRes ? (
        errorRes
      ) : isLoading ? (
        <span style={{ color: 'white' }}>Загрузка...</span>
      ) : (
        courses.map((course) => (
          <CourseCard key={course._id} course={course} courseList={courses} />
        ))
      )}
    </div>
  );
}