// Тесты для API методов проверяют структуру и наличие методов
// Для полного тестирования нужны интеграционные тесты с реальным API или более сложные моки

describe('API методы', () => {
  it('authApi должен иметь методы register и login', () => {
    const { authApi } = require('../api');
    expect(authApi).toHaveProperty('register');
    expect(authApi).toHaveProperty('login');
    expect(typeof authApi.register).toBe('function');
    expect(typeof authApi.login).toBe('function');
  });

  it('usersApi должен иметь методы getMe, addCourse, removeCourse', () => {
    const { usersApi } = require('../api');
    expect(usersApi).toHaveProperty('getMe');
    expect(usersApi).toHaveProperty('addCourse');
    expect(usersApi).toHaveProperty('removeCourse');
    expect(typeof usersApi.getMe).toBe('function');
    expect(typeof usersApi.addCourse).toBe('function');
    expect(typeof usersApi.removeCourse).toBe('function');
  });

  it('coursesApi должен иметь методы getAll, getById, getWorkouts, resetProgress', () => {
    const { coursesApi } = require('../api');
    expect(coursesApi).toHaveProperty('getAll');
    expect(coursesApi).toHaveProperty('getById');
    expect(coursesApi).toHaveProperty('getWorkouts');
    expect(coursesApi).toHaveProperty('resetProgress');
  });

  it('workoutsApi должен иметь методы getById, saveProgress, resetProgress', () => {
    const { workoutsApi } = require('../api');
    expect(workoutsApi).toHaveProperty('getById');
    expect(workoutsApi).toHaveProperty('saveProgress');
    expect(workoutsApi).toHaveProperty('resetProgress');
  });

  it('progressApi должен иметь методы getCourseProgress, getWorkoutProgress', () => {
    const { progressApi } = require('../api');
    expect(progressApi).toHaveProperty('getCourseProgress');
    expect(progressApi).toHaveProperty('getWorkoutProgress');
    expect(typeof progressApi.getCourseProgress).toBe('function');
    expect(typeof progressApi.getWorkoutProgress).toBe('function');
  });
});
