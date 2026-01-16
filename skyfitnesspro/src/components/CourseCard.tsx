import { Link } from 'react-router-dom';
import { Course } from '../types';
import { addCourse } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface Props {
  course: Course;
}

const CourseCard: React.FC<Props> = ({ course }) => {
  const { user, token, login } = useAuth(); // Пока заглушка

  const handleAddCourse = async () => {
    if (!token) {
      toast.error('⚠️ Нужно авторизоваться для добавления курса');
      return;
    }

    try {
      await addCourse(course._id);
      toast.success('✅ Курс добавлен в профиль!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка добавления');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
        <img
          src={course.poster || '/default-course.jpg'}
          alt={course.nameRU}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {course.nameRU}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
        
        <div className="flex gap-3">
          <Link
            to={`/course/${course._id}`}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl text-center font-medium transition-colors"
          >
            Подробнее
          </Link>
          <button
            onClick={handleAddCourse}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;