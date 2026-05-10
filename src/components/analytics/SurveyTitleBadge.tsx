interface SurveyTitleBadgeProps {
  // The title of the currently selected survey.
  surveyTitle: string;
}

// Renders a blue rounded badge containing the survey title.
export default function SurveyTitleBadge({
  surveyTitle,
}: SurveyTitleBadgeProps) {
  return (
    <div className="flex py-2 px-6 justify-center items-center rounded-lg bg-[#2B8CED]">
      <p className="text-[#F7FAFC] text-sm font-bold">{surveyTitle}</p>
    </div>
  );
}
