import { Check } from "lucide-react";
import { Plus } from "lucide-react";
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
  imageSrc,
  title,
  date,
  category,
  to,
  variant = "default",
}) => {
  const normalizedCategory = (category || "").toUpperCase();

  if (variant === "finished") {
    const finishedCard = (
      <div className="group relative w-full h-full min-h-[320px] rounded-[28px] bg-white border border-[#E5EAF2] shadow-[0_8px_22px_rgba(15,23,42,0.08)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
        <div className="h-1.5 w-full bg-[#FF5B8A]" />

        <div className="p-6 pt-7 h-[calc(100%-6px)] flex flex-col items-center">
          {date && (
            <span className="self-end inline-flex items-center px-3 py-1 rounded-full bg-[#F2F4F8] text-[#7D93B5] text-[11px] font-semibold tracking-wide">
              {date}
            </span>
          )}

          <div className="mt-12 w-16 h-16 rounded-full bg-[#FBEFF3] flex items-center justify-center">
            <span className="w-8 h-8 rounded-full border-4 border-[#FF3C6A] flex items-center justify-center">
              <Check size={14} className="text-[#FF3C6A] stroke-[3.2]" />
            </span>
          </div>

          <h3 className="mt-8 text-[22px] leading-tight text-[#112C56] font-black tracking-tight text-center line-clamp-2">
            {title}
          </h3>

          {category && (
            <div className="mt-auto w-full flex justify-center pb-1">
              <span className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-[#FFF2F5] border border-[#FFD6DF] text-[#F3124F] text-xs font-black tracking-[0.14em] uppercase">
                {normalizedCategory}
              </span>
            </div>
          )}
        </div>
      </div>
    );

    if (to) {
      return (
        <Link to={to} className="block no-underline">
          {finishedCard}
        </Link>
      );
    }

    return finishedCard;
  }

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
          <Plus
            size={40}
            className="text-[#4A739C] group-hover:scale-110 transition-transform"
          />
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
