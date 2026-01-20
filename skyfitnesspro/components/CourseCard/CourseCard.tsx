'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/lib/types';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { usersApi } from '@/lib/api';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/utils';
import { useModal } from '@/context/ModalContext';

interface CourseCardProps {
  course: Course;
  courseList: Course[];
}

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

export default function CourseCard({ course }: CourseCardProps) {
  const user = useAppSelector((state) => state.auth.user);
  const userData = useAppSelector((state) => state.auth.user);
  const [isAdding, setIsAdding] = useState(false);
  const { openLogin } = useModal();

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

  const handleAddCourse = async () => {
    if (!user) {
      openLogin();
      return;
    }

    try {
      setIsAdding(true);
      await usersApi.addCourse(course._id);
      // Обновляем страницу для обновления UI
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsAdding(false);
    }
  };

  // TODO: Получать selectedCourses из Redux или API
  const isSelected = false; // Временно

  return (
    <div
      className="relative rounded-[30px] overflow-hidden flex flex-col"
      style={{
        width: '360px',
        height: '501px',
      }}
    >
      {/* Фото */}
      <div
        className={`relative overflow-hidden ${getCourseBgColor(course)}`}
        style={{
          width: '360px',
          height: '325px',
        }}
      >
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
      <div
        className="flex flex-col flex-1 bg-white px-6"
        style={{
          paddingBottom: '15px',
          gap: '24px',
        }}
      >
        <Link href={`/courses/${course._id}`}>
          <h3 className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-600">
            {course.nameRU}
          </h3>
        </Link>

        <div className="flex items-center text-sm text-gray-600 gap-3">
          <div className="flex items-center gap-2">
            <Image
              src="/img/calendar.svg"
              alt="Календарь"
              width={16}
              height={16}
            />
            <span>{formatDuration(course.durationInDays)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/img/clock.svg"
              alt="Часы"
              width={16}
              height={16}
            />
            <span>{formatTime(course.dailyDurationInMinutes)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Image
            src="/img/complexity.svg"
            alt="Сложность"
            width={16}
            height={16}
          />
          <span>Сложность</span>
        </div>
      </div>

      {/* Кнопка + */}
      <button
        onClick={handleAddCourse}
        disabled={isSelected || isAdding}
        className="
          absolute top-5 right-5
          bg-white rounded-full
          w-10 h-10 md:w-12 md:h-12
          flex items-center justify-center
          shadow-md hover:bg-gray-100
          transition text-2xl md:text-3xl font-bold
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        title={
          isSelected
            ? 'Курс уже добавлен'
            : isAdding
            ? 'Добавление...'
            : 'Добавить курс'
        }
      >
        {isSelected ? '✓' : isAdding ? '...' : '+'}
      </button>
    </div>
  );
}
