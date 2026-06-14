interface SurveyTitleBadgeProps {
  // The title of the currently selected survey.
  surveyTitle: string;
}

// Renders the survey name as a page title (not a button).
// Badge showing the selected survey title with a colored accent.
export default function SurveyTitleBadge({
  surveyTitle,
}: SurveyTitleBadgeProps) {
  return (
    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
      {surveyTitle}
    </h1>
  );
}
