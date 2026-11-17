import { Link } from 'react-router-dom';

export default function CategoryGrid({ categories }) {
  return (
    <div className="bg-white shadow-card p-4">
      <div className="flex items-center justify-between overflow-x-auto hide-scrollbar gap-6 pb-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.id}`}
            className="flex flex-col items-center gap-2 min-w-[80px] group"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F1F3F6] border-2 border-transparent
                           group-hover:border-[#2874F0] transition-colors">
              <img
                src={category.image || `https://via.placeholder.com/100?text=${category.name?.[0]}`}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-[#212121] text-center group-hover:text-[#2874F0] transition-colors whitespace-nowrap">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
