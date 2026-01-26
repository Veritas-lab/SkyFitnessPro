'use client';

import Image from 'next/image';
import styles from './courses.module.css';
import Logo from '@/components/Logo/Logo';
import HeaderText from '@/components/HeaderText/HeaderText';
import BaseButton from '@/components/Button/Button';
import { useAppSelector } from '@/store/store';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Course } from '@/lib/types';
import { getCoursesId } from '@/servises/course/courseApi';
import { AxiosError } from 'axios';
import { useModal } from '@/context/ModalContext';
import { useCourse } from '@/hooks/useCourse';
import ModalWorkouts from '@/components/ModalWorkouts/ModalWorkouts';
import ModalUser from '@/components/ModalUser/ModalUser';

export default function Course() {
  const user = useAppSelector((state) => state.auth.user);
  const params = useParams<{ courses_id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [course, setCourses] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWorkoutsModalOpen, setIsWorkoutsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
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

  const imageName = course.nameEN.toLowerCase().replace(/\s+/g, '');
  const imageNameNoDash = imageName.replace(/-/g, '');
  
  // Используем готовые карточки из папки img
  const cardImageMap: Record<string, string> = {
    yoga: '/img/youga_card.png',
    stretching: '/img/stretching_card.png',
    fitness: '/img/fitness_card.png',
    'step-aerobics': '/img/step_aerobics_card.png',
    'stepaerobics': '/img/step_aerobics_card.png',
    'stepairobic': '/img/step_aerobics_card.png', // вариант без 's' в конце
    bodyflex: '/img/bodyflex_card.png',
  };
  
  // Пробуем найти карточку по разным вариантам имени
  let cardImagePath = cardImageMap[imageName] || cardImageMap[imageNameNoDash] || cardImageMap[course.nameEN.toLowerCase()];
  
  // Дополнительная проверка для step-aerobics (разные варианты написания)
  if (!cardImagePath) {
    const nameLower = course.nameEN.toLowerCase();
    if (nameLower.includes('step') || imageName.includes('step') || imageNameNoDash.includes('step') || 
        nameLower.includes('аэробик') || nameLower.includes('aerob')) {
      cardImagePath = '/img/step_aerobics_card.png';
    }
  }
  
  // Fallback
  if (!cardImagePath) {
    cardImagePath = '/img/fitness_card.png';
  }

  // Фоновые цвета для карточек курсов
  const getCourseBgColor = (course: Course) => {
    const name = course.nameRU.toLowerCase();
    if (name.includes('йога') || name.includes('yoga')) return 'bg-yellow-300';
    if (name.includes('стретчинг') || name.includes('stretching')) return 'bg-blue-300';
    if (name.includes('фитнес') || name.includes('fitness')) return 'bg-orange-300';
    if (name.includes('степ-аэробика') || name.includes('step-aerobics')) return 'bg-pink-300';
    if (name.includes('бодифлекс') || name.includes('bodyflex')) return 'bg-purple-300';
    return 'bg-gray-300';
  };

  return (
    <div className={styles.coursePage}>
      {/* Header */}
      <div className={styles.header}>
        <Logo />
        <HeaderText />
        {!user && (
          <button 
            className={styles.loginButton}
            onClick={openLogin}
          >
            Войти
          </button>
        )}
        {user && (
          <div className={styles.userInfo} onClick={() => setIsUserModalOpen(!isUserModalOpen)}>
            <Image
              src="/img/Profile.svg"
              alt="profile"
              width={50}
              height={50}
            />
            <p className={styles.userText}>{user}</p>
            <span className={styles.header__arrow}>
              <svg
                width="13"
                height="8"
                viewBox="0 0 13 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.0624 0.707154L6.38477 6.38477L0.707152 0.707154"
                  stroke="black"
                  strokeWidth="2"
                />
              </svg>
            </span>
          </div>
        )}
        {isUserModalOpen && (
          <ModalUser onClose={() => setIsUserModalOpen(false)} />
        )}
      </div>

      <div className={styles.course__conteiner}>
        {/* Готовая карточка курса */}
        <div className={styles.course__heroBanner}>
          <img
            src={cardImagePath}
            alt={course.nameRU}
            className={styles.course__heroCard}
          />
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
                  src="/img/plus.svg"
                  alt="Plus"
                  width={20}
                  height={20}
                  className={styles.course__categorySvg}
                />
              </div>
              <p className={styles.course__categoryText}>{directionsText}</p>
            </div>
          ))}
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
        {/* Изображение Boy.svg с абсолютным позиционированием */}
        <div className={styles.course__boyImage}>
          <Image
            src="/img/Boy.svg"
            alt="Boy"
            width={566}
            height={567}
            className={styles.course__boyImageImg}
          />
        </div>

        {/* Изображение Vector.png с абсолютным позиционированием */}
        <div className={styles.course__vectorImage}>
          <Image
            src="/img/Vector.png"
            alt="Vector"
            width={50}
            height={43}
            className={styles.course__vectorImageImg}
          />
        </div>

        {/* Изображение Vector_69.png с абсолютным позиционированием */}
        <div className={styles.course__vector69Image}>
          <Image
            src="/img/Vector_69.png"
            alt="Vector"
            width={670}
            height={391}
            className={styles.course__vector69ImageImg}
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
            {user && isAdd && (
              <>
                <BaseButton
                  disabled={isLoading}
                  onClick={() => setIsWorkoutsModalOpen(true)}
                  fullWidth={true}
                  text={'Начать тренировку'}
                />
                <BaseButton
                  disabled={isLoading}
                  onClick={toggleAddRemove}
                  fullWidth={true}
                  text={'Удалить курс'}
                />
              </>
            )}
            {user && !isAdd && (
              <BaseButton
                disabled={isLoading}
                onClick={toggleAddRemove}
                fullWidth={true}
                text={'Добавить курс'}
              />
            )}
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
      {isWorkoutsModalOpen && courseID && (
        <ModalWorkouts
          courseId={courseID}
          onClose={() => setIsWorkoutsModalOpen(false)}
        />
      )}
    </div>
  );
}
