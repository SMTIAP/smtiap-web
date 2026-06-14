import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to?: string;
  className?: string;
}

// Navigates back in history or to a specific route.
export default function BackButton({ to, className = "" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md bg-[#1E293B] text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90 ${className}`}
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}
