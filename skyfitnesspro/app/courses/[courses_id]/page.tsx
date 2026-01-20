'use client';

import Image from 'next/image';
import styles from './courses.module.css';
import Header from '@/components/Header/Header';
import BaseButton from '@/components/Button/Button';
import { useAppSelector } from '@/store/store';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CourseTypes } from '@/sharedTyres/shared.Types';
import { getCoursesId } from '@/servises/course/courseApi';
import { AxiosError } from 'axios';
import { useModal } from '@/context/ModalContext';
import { useCourse } from '@/hooks/useCourse';

export default function Course() {
  const user = useAppSelector((state) => state.auth.user);
  const params = useParams<{ courses_id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [course, setCourses] = useState<CourseTypes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { openLogin } = useModal();
  const courseID = params.courses_id;
  const { toggleAddRemove, isAdd } = useCourse(course);

  useEffect(() => {
    if (!courseID) return;

    if (course && course._id === courseID) {
      return;
    }

    let isMounted = true;

    const loadCourse = async () => {
      try {
        setIsLoading(true);
        const res = await getCoursesId(courseID);
        if (isMounted) {
          setCourses(res);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          if (err instanceof AxiosError) {
            if (err.response) {
              setError(err.response.data.message);
            } else if (err.request) {
              setError('Что-то с интернетом');
            } else {
              setError('Неизвестная ошибка');
            }
          } else {
            setError('Неизвестная ошибка');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCourse();

    return () => {
      isMounted = false;
    };
  }, [courseID, course]);

  if (!course) {
    return (
      <div>{error ? `Ошибка: ${error}` : 'Загрузка деталей курса...'}</div>
    );
  }

  const imageName = course.nameEN.toLowerCase().replace(' ', '');
  const imagePath = `/img/skill${imageName}.png`;
  const imagePathMob = `/img/${imageName}.png`;

  return (
    <div>
      <Header />
      <div className={styles.course__conteiner}>
        <div className={styles.course__ImagedescTop}>
          <Image
            src={imagePath}
            alt={course.nameEN}
            loading="eager"
            width={1160}
            height={310}
          />
        </div>
        <div className={styles.course__ImageMob}>
          <Image src={imagePathMob} alt="yoga" width={343} height={389} />
        </div>
        <h2 className={styles.course__descTitle}>Подойдет для вас, если:</h2>
        <div className={styles.course__desc}>
          {course.fitting.map((fittingText: string, index: number) => (
            <div key={index} className={styles.course__descBlock}>
              <p className={styles.course__descNumb}>{index + 1}</p>
              <p className={styles.course__descText}>{fittingText}</p>
            </div>
          ))}
        </div>
        <h2 className={styles.course__descTitle}>Направления</h2>
        <div className={styles.course__category}>
          {course.directions.map((directionsText: string, index: number) => (
            <div key={index} className={styles.course__categoryName}>
              <div className={styles.course__categoryImage}>
                <Image
                  src="/img/complexity.svg"
                  alt="Star"
                  width={20}
                  height={20}
                  className={styles.course__categorySvg}
                />
              </div>
              <p className={styles.course__categoryText}>{directionsText}</p>
            </div>
          ))}
        </div>
        <div className={styles.course__groupImage}>
          <div>
            <Image
              src="/img/Boy.svg"
              alt="Boy"
              width={100}
              height={100}
              className={styles.course__svgMan}
            />
          </div>
          <div>
            <Image
              src="/img/Vector.png"
              alt="Vector"
              width={100}
              height={100}
              className={styles.course__svgBlack}
            />
          </div>
          <div>
            <Image
              src="/img/Vector_69.png"
              alt="Vector"
              width={100}
              height={100}
              className={styles.course__svgGreen}
            />
          </div>
        </div>
        <div className={styles.course__groupImageMob}>
          <Image
            src="/img/Boy.svg"
            alt="Boy"
            width={343}
            height={389}
            className={styles.course__manMob}
          />
        </div>
        <div className={styles.course__way}>
          <div className={styles.course__wayBlock}>
            <h1 className={styles.course__wayTitle}>
              Начните путь к новому телу
            </h1>
            <ul className={styles.course__wayList}>
              <li className={styles.course__wayText}>
                проработка всех групп мышц
              </li>
              <li className={styles.course__wayText}>тренировка суставов</li>
              <li className={styles.course__wayText}>
                улучшение циркуляции крови
              </li>
              <li className={styles.course__wayText}>
                упражнения заряжают бодростью
              </li>
              <li className={styles.course__wayText}>
                помогают противостоять стрессам
              </li>
            </ul>
            {user &&
              (isAdd ? (
                <BaseButton
                  disabled={isLoading}
                  onClick={toggleAddRemove}
                  fullWidth={true}
                  text={'Удалить курс'}
                />
              ) : (
                <BaseButton
                  disabled={isLoading}
                  onClick={toggleAddRemove}
                  fullWidth={true}
                  text={'Добавить курс'}
                />
              ))}
            {!user && (
              <BaseButton
                disabled={isLoading}
                onClick={openLogin}
                fullWidth={true}
                text={'Войдите, чтобы добавить курс'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
