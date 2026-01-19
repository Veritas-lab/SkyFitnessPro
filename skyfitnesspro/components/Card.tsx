import Image from 'next/image';  // ← это самое важное, без него ничего не работает

interface CardProps {
  title: string;
  duration: string;
  time: string;
  complexity: string;
  image: string;
  bgColor: string;
}

export default function Card({
  title,
  duration,
  time,
  complexity,
  image,
  bgColor,
}: CardProps) {
  return (
    <div className={`relative rounded-lg overflow-hidden shadow-md ${bgColor}`}>
      <Image
        src={image}
        alt={title}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 bg-white">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center text-sm text-gray-600 gap-2">
          <span>{duration}</span>
          <span>•</span>
          <span>{time}</span>
        </div>
        <p className="text-sm text-blue-500 mt-1">{complexity}</p>
      </div>
      <button className="absolute top-2 right-2 bg-white rounded-full p-1 text-xl font-bold hover:bg-gray-100 transition">
        +
      </button>
    </div>
  );
}