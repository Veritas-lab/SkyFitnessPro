'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { AxiosError } from 'axios';
import {
  setAllCourses,
  setFetchError,
  setFetchIsLoading,
} from '@/store/features/courseSlise';
import { getCourses } from '@/servises/course/courseApi';

export default function FetchingCourses() {
  const dispatch = useAppDispatch();
  const { allCourses } = useAppSelector((state) => state.course);

  useEffect(() => {
    if (allCourses.length > 0) {
      return;
    }
    
    dispatch(setFetchIsLoading(true));
    getCourses()
      .then((res) => {
        dispatch(setAllCourses(res));
      })
      .catch((err) => {
        if (err instanceof AxiosError) {
          if (err.response) {
            dispatch(setFetchError(err.response.data.message));
          } else if (err.request) {
            dispatch(setFetchError('Что-то с интернетом'));
          } else {
            dispatch(setFetchError('Неизвестная ошибка'));
          }
        }
      })
      .finally(() => {
        dispatch(setFetchIsLoading(false));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return <></>;
}