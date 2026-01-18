// app/page.tsx
import Image from 'next/image';
/*import Link from 'next/link';*/
import Header from '@/components/Header';  // предполагается, что Header уже готов

const courses = [
  {
    title: 'Йога',
    duration: '25 дней',
    time: '20-50 мин/день',
    complexity: 'Сложность',
    image: '/img/yoga.png',
    bgColor: 'bg-yellow-300',
  },
  {
    title: 'Стретчинг',
    duration: '25 дней',
    time: '20-50 мин/день',
    complexity: 'Сложность',
    image: '/img/stretching.png',
    bgColor: 'bg-blue-300',
  },
  {
    title: 'Фитнес',
    duration: '25 дней',
    time: '20-50 мин/день',
    complexity: 'Сложность',
    image: '/img/fitness.png',
    bgColor: 'bg-orange-300',
  },
  {
    title: 'Степ-аэробика',
    duration: '25 дней',
    time: '20-50 мин/день',
    complexity: 'Сложность',
    image: '/img/step-aerobics.png',
    bgColor: 'bg-pink-300',
  },
  {
    title: 'Бодифлекс',
    duration: '25 дней',
    time: '20-50 мин/день',
    complexity: 'Сложность',
    image: '/img/bodyflex.png',
    bgColor: 'bg-purple-300',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-['Roboto']">
      <Header />

      <main className="relative max-w-[1440px] mx-auto px-6 md:px-10 lg:px-[140px] pt-8 md:pt-0">
        {/* Заголовок и баннер */}
        <div className="mt-12 md:mt-32 mb-10 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-center md:text-left">
            Начните заниматься спортом
            <br className="hidden sm:inline" />
            и улучшите качество жизни
          </h1>

          <div className="inline-block mt-6 md:mt-8 bg-green-100 text-green-800 px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-medium">
            Измените своё тело за полгода!
          </div>
        </div>

        {/* Блок карточек */}
        <div
          className="
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
            gap-6 md:gap-8 lg:gap-[24px]
            mt-[350px] lg:mt-[350px]
            -ml-6 md:ml-0 lg:ml-0
          "
        >
          {courses.map((course) => (
            <div
              key={course.title}
              className={`
                relative rounded-[30px] overflow-hidden
                w-full max-w-[360px] h-[501px]
                shadow-[0_4px_67px_-12px_rgba(0,0,0,0.13)]
                flex flex-col
                ${course.bgColor}
                mx-auto lg:mx-0
              `}
            >
              {/* Фото */}
              <div className="relative h-[60%] bg-gray-200">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                  priority={course.title === 'Йога'} // можно первую загрузить быстрее
                />
              </div>

              {/* Информация */}
              <div className="flex flex-col flex-1 p-6 pb-[15px] bg-white gap-4">
                <h3 className="text-xl md:text-2xl font-semibold">{course.title}</h3>

                <div className="flex items-center text-sm md:text-base text-gray-600 gap-3">
                  <span>{course.duration}</span>
                  <span className="text-gray-400">•</span>
                  <span>{course.time}</span>
                </div>

                <div className="mt-auto text-sm md:text-base text-blue-600 font-medium">
                  {course.complexity}
                </div>
              </div>

              {/* Кнопка + */}
              <button
                className="
                  absolute top-5 right-5
                  bg-white rounded-full
                  w-10 h-10 md:w-12 md:h-12
                  flex items-center justify-center
                  shadow-md hover:bg-gray-100
                  transition text-2xl md:text-3xl font-bold
                "
              >
                +
              </button>
            </div>
          ))}
        </div>

        {/* Кнопка Наверх */}
        <div className="mt-16 md:mt-24 pb-12 text-center">
          <button className="px-10 py-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition text-lg">
            Наверх ↑
          </button>
        </div>
      </main>
    </div>
  );
}