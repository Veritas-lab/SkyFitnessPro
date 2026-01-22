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
      await workoutsApi.saveProgress(courseId, workoutId, progress);
      onSaveProgress(progress);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
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
        <h2 className={styles.title}>Заполните свой прогресс</h2>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.progressList}>
          {progress.map((value, index) => {
            const exercise = exercises[index];
            const exerciseName = exercise?.name || `Упражнение ${index + 1}`;
            const targetQuantity = exercise?.quantity || 0;
            
            return (
              <div key={index} className={styles.progressItem}>
                <label>
                  {exerciseName}
                  {targetQuantity > 0 && (
                    <span className={styles.targetQuantity}>
                      {' '}(цель: {targetQuantity})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  max={targetQuantity > 0 ? targetQuantity : undefined}
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
          <button onClick={onClose} className={styles.cancelButton}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
