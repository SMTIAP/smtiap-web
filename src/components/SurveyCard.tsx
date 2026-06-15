import { CheckCircle2, Plus, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface SurveyCardProps {
  imageSrc?: string;
  title: string;
  date?: string;
  category?: string;
  to?: string;
  variant?: "default" | "finished";
}

// Displays a survey as a clickable card with image, title, date, category, and variant styling.
const SurveyCard: React.FC<SurveyCardProps> = ({
  imageSrc,
  title,
  date,
  category,
  to,
  variant = "default",
}) => {
  if (variant === "finished") {
    const finishedCard = (
      <div className="group relative flex flex-col bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-1.5 cursor-pointer overflow-hidden">
        {/* Glass shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-white/0 pointer-events-none" />

        {/* Top status bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500 opacity-90" />

        <div className="relative z-10 p-7 flex flex-col h-full">
          {/* Icon + Badge */}
          <div className="flex justify-between items-start mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <CheckCircle2 size={24} />
            </div>
            {category && (
              <div className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30">
                {category}
              </div>
            )}
          </div>

          {/* Title + date */}
          <div className="flex-grow">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-snug line-clamp-3 mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {title}
            </h3>
            {date && (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Clock size={14} />
                <span>{date}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-semibold">
              Finished
            </span>
          </div>
        </div>
      </div>
    );

    if (to)
      return (
        <Link to={to} className="block no-underline h-full">
          {finishedCard}
        </Link>
      );
    return finishedCard;
  }

  // Default variant
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
          <Plus
            size={40}
            className="text-[#4A739C] dark:text-slate-400 group-hover:scale-110 transition-transform"
          />
        </div>
      )}
      <div className="flex flex-col items-start w-full">
        <p className="text-[#0D141C] dark:text-white font-inter text-base font-medium leading-6 w-full line-clamp-1">
          {title}
        </p>
        {date && (
          <p className="text-[#4A739C] dark:text-slate-400 font-inter text-sm leading-5.25 w-full">
            {date}
          </p>
        )}
        {category && (
          <p className="text-[#4A739C] dark:text-slate-400 font-inter text-sm leading-5.25 w-full line-clamp-1">
            {category}
          </p>
        )}
      </div>
    </div>
  );

  if (to)
    return (
      <Link to={to} className="block no-underline">
        {CardContent}
      </Link>
    );
  return CardContent;
};

export default SurveyCard;
