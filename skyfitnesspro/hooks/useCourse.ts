'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/lib/types';
import { usersApi } from '@/lib/api';
import { useAppSelector } from '@/store/store';
import { getErrorMessage } from '@/lib/utils';

export function useCourse(course: Course | null) {
  const user = useAppSelector((state) => state.auth.user);
  const [isAdd, setIsAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Проверяем, добавлен ли курс
  useEffect(() => {
    if (!course || !user) {
      setIsAdd(false);
      return;
    }

    // TODO: Получить selectedCourses из Redux или API
    // Пока используем заглушку
    const checkIfAdded = async () => {
      try {
        // Здесь нужно получить данные пользователя с selectedCourses
        // Пока используем заглушку
        setIsAdd(false);
      } catch (err) {
        // Ошибка при проверке курса
      }
    };

    checkIfAdded();
  }, [course, user]);

  const toggleAddRemove = async () => {
    if (!course || !user) return;

    try {
      setIsLoading(true);
      if (isAdd) {
        await usersApi.removeCourse(course._id);
        setIsAdd(false);
      } else {
        await usersApi.addCourse(course._id);
        setIsAdd(true);
      }
      // Обновляем страницу для обновления UI
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { isAdd, toggleAddRemove, isLoading };
}
