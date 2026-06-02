import { Check } from "lucide-react";
import { Link } from "react-router-dom";

interface SurveyCardProps {
  imageSrc?: string;
  title: string;
  date?: string;
  category?: string;
  to?: string;
  variant?: "default" | "finished";
}

const SurveyCard: React.FC<SurveyCardProps> = ({
  imageSrc, title, date, category, to, variant = "default",
}) => {
  const normalizedCategory = (category || "").toUpperCase();

  if (variant === "finished") {
    const finishedCard = (
      <div className="group relative flex flex-col items-center p-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden aspect-[3/4]">
        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10"></div>
        <div className="absolute inset-[1px] bg-white/90 dark:bg-slate-800/90 rounded-2xl -z-5"></div>
        
        {/* Status bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-rose-600" />

        {/* Date */}
        {date && (
          <div className="flex justify-between items-center w-full mb-6">
            <span className="text-slate-500 text-[10px] font-extrabold bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-600">
              {date}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/95 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-sm">
              <Check size={13} />
            </div>
          </div>
        )}

        {/* Check circle icon */}
        <div className="flex flex-col items-center justify-center flex-grow text-center w-full">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/40 dark:to-rose-800/40 text-rose-600">
            <div className="w-12 h-12 rounded-full border-4 border-rose-500 flex items-center justify-center">
              <Check size={20} className="text-rose-500 stroke-[3]" />
            </div>
          </div>
          
          <h3 className="text-slate-800 dark:text-white font-bold text-base leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 mb-2">
            {title}
          </h3>
        </div>

        {/* Category badge */}
        {category && (
          <div className="mt-4 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md">
            {normalizedCategory}
          </div>
        )}
      </div>
    );

    if (to) return <Link to={to} className="block no-underline">{finishedCard}</Link>;
    return finishedCard;
  }

  // Default variant - for template cards (different style, but same shape concept)
  const CardContent = (
    <div className="flex pb-3 flex-col items-start gap-3 w-44 h-full">
      {imageSrc ? (
        <img
          src={imageSrc}
          className="rounded-lg w-full h-44 overflow-hidden max-w-none bg-gray-200 object-cover hover:shadow-lg transition-shadow cursor-pointer"
          alt={title}
        />
      ) : (
        <div className="flex items-center justify-center rounded-lg w-full h-44 bg-[#E8EDF5] dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer group">
          <Plus size={40} className="text-[#4A739C] dark:text-slate-400 group-hover:scale-110 transition-transform" />
        </div>
      )}
      <div className="flex flex-col items-start w-full">
        <p className="text-[#0D141C] dark:text-white font-inter text-base font-medium leading-6 w-full line-clamp-1">{title}</p>
        {date && <p className="text-[#4A739C] dark:text-slate-400 font-inter text-sm leading-5.25 w-full">{date}</p>}
        {category && <p className="text-[#4A739C] dark:text-slate-400 font-inter text-sm leading-5.25 w-full line-clamp-1">{category}</p>}
      </div>
    </div>
  );

  if (to) return <Link to={to} className="block no-underline">{CardContent}</Link>;
  return CardContent;
};

export default SurveyCard;