'use client';

import { useState, useEffect } from 'react';
import { workoutsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import styles from './ModalProgress.module.css';

interface ModalProgressProps {
  courseId: string;
  workoutId: string;
  initialProgress: number[];
  exercises?: Array<{ name: string; quantity: number; _id?: string }>;
  onSaveProgress: (progress: number[]) => void;
  onClose: () => void;
}

export default function ModalProgress({
  courseId,
  workoutId,
  initialProgress,
  exercises = [],
  onSaveProgress,
  onClose,
}: ModalProgressProps) {
  const [progress, setProgress] = useState<number[]>(initialProgress);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  const handleChange = (index: number, value: number) => {
    const newProgress = [...progress];
    newProgress[index] = Math.max(0, value);
    setProgress(newProgress);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Валидация: проверяем, что progressData - это массив чисел
      if (!Array.isArray(progress) || progress.length === 0) {
        throw new Error('Прогресс должен быть массивом чисел');
      }

      // Проверяем, что все значения - числа
      const validProgress = progress.map((value) => {
        const num = Number(value);
        return isNaN(num) || num < 0 ? 0 : Math.round(num);
      });

      // Логируем для отладки
      if (process.env.NODE_ENV === 'development') {
        console.log('💾 Сохранение прогресса:', {
          courseId,
          workoutId,
          progressData: validProgress,
          exercisesCount: exercises.length
        });
      }

      const response = await workoutsApi.saveProgress(courseId, workoutId, validProgress);
      
      // Логируем успешный ответ
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Прогресс успешно сохранен:', response.data);
      }

      // Вызываем callback с обновленным прогрессом
      onSaveProgress(validProgress);
      
      // Закрываем модальное окно
      onClose();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      console.error('❌ Ошибка при сохранении прогресса:', err);
      setError(errorMessage || 'Не удалось сохранить прогресс. Попробуйте еще раз.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.title}>Мой прогресс</h2>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.progressList}>
          {progress.map((value, index) => {
            const exercise = exercises[index];
            const exerciseName = exercise?.name || `Упражнение ${index + 1}`;
            
            return (
              <div key={index} className={styles.progressItem}>
                <label className={styles.question}>
                  Сколько раз вы сделали {exerciseName.toLowerCase()}?
                </label>
                <input
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => handleChange(index, parseInt(e.target.value) || 0)}
                  className={styles.input}
                  placeholder="0"
                />
              </div>
            );
          })}
        </div>
        <div className={styles.buttons}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={styles.saveButton}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
