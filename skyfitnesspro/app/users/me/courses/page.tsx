'use client';

import styles from './me.module.css';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../../store/store';
import { logout } from '../../../../store/features/authSlice';
import Header from '../../../../components/Header/Header';
import Image from 'next/image';
import CoursesBlock from '../../../../components/CoursesBlock/CoursesBlock';
import { useRouter } from 'next/navigation';
import { getCoursesMe } from '../../../../servises/course/courseApi';
import { useEffect } from 'react';
import {
  setFetchError,
  setFetchIsLoading,
  setMyCourseIds,
  setMyCourses,
} from '../../../../store/features/courseSlise';
import { AxiosError } from 'axios';

export default function MeCourses() {
  const user = useAppSelector((state) => state.auth.user);
  const { token } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const { allCourses, myCourseIds, fetchError, fetchIsLoading, myCourses } =
    useAppSelector((state) => state.course);

  const onLogout = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    dispatch(logout());
    router.push('/');
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    if (!myCourses.length && !fetchIsLoading) {
      dispatch(setFetchIsLoading(true));
      getCoursesMe(token)
        .then((res) => {
          const userObject = res.user;
          const meApiCourses = userObject.selectedCourses;
          dispatch(setMyCourseIds(meApiCourses));
        })
        .catch((err) => {
          if (err instanceof AxiosError) {
            if (err.response) {
              setFetchError(err.response.data.message);
            } else if (err.request) {
              setFetchError('Что-то с интернетом');
            } else {
              console.log('error:', err);
              setFetchError('Неизвестная ошибка');
            }
          }
        })
        .finally(() => {
          dispatch(setFetchIsLoading(false));
        });
    }
  }, [dispatch, token, myCourses.length, fetchIsLoading]);
  
  useEffect(() => {
    if (myCourseIds.length > 0 && allCourses.length > 0) {
      const filteredCourses = allCourses.filter((course) =>
        myCourseIds.includes(course._id),
      );

      dispatch(setMyCourses(filteredCourses));
    }
  }, [myCourseIds, allCourses, dispatch]);

  return (
    <>
      <Header />
      <div className={styles.center__container}>
        <h1 className={styles.course__descTitle}>Профиль</h1>
        <div className={styles.userContainer}>
          <div className={styles.userImg}>
            <Image
              src="/img/big_profil.png"
              alt="profile"
              loading="eager"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div>
            <div className={styles.header__user}>
              <div className={styles.userNameContainer}>
                <p className={styles.userNameMain}>{user}</p>
                <p className={styles.userName}>Логин: {user}</p>
              </div>
            </div>
            <button className={styles.modal__btnLogOut} onClick={onLogout}>
              Выйти
            </button>
          </div>
        </div>
        <h1 className={styles.course__descTitle}>Мои курсы</h1>
        <div className={styles.center__courses}></div>
        (
        <CoursesBlock
          courses={myCourses}
          errorRes={fetchError}
          isLoading={fetchIsLoading}
        />
        )
      </div>
    </>
  );
}