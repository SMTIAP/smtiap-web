import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SurveyCardProps {
  imageSrc?: string;
  title: string;
  date?: string;
  category?: string;
  to?: string;
}

const SurveyCard: React.FC<SurveyCardProps> = ({ imageSrc, title, date, category, to }) => {
  const CardContent = (
    <div className="flex pb-3 flex-col items-start gap-3 w-44 h-full">
      {imageSrc ? (
        <img
          src={imageSrc}
          className="rounded-lg w-full h-44 overflow-hidden max-w-none bg-gray-200 object-cover hover:shadow-lg transition-shadow cursor-pointer"
          alt={title}
        />
      ) : (
        <div className="flex items-center justify-center rounded-lg w-full h-44 bg-[#E8EDF5] hover:bg-gray-200 transition-colors cursor-pointer group">
          <Plus size={40} className="text-[#4A739C] group-hover:scale-110 transition-transform" />
        </div>
      )}
      <div className="flex flex-col items-start w-full">
        <div className="flex flex-col items-start w-full">
          <p className="text-[#0D141C] font-inter text-base font-medium leading-6 w-full line-clamp-1">
            {title}
          </p>
        </div>
        {date && (
          <div className="flex flex-col items-start w-full">
            <p className="text-[#4A739C] font-inter text-sm leading-[21px] w-full">
              {date}
            </p>
          </div>
        )}
        {category && (
          <div className="flex flex-col items-start w-full">
            <p className="text-[#4A739C] font-inter text-sm leading-[21px] w-full line-clamp-1">
              {category}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block no-underline">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
};

export default SurveyCard;
