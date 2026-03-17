import { Link } from "react-router-dom";
import SurveyCard from "../components/SurveyCard";
import SearchBar from "../components/SearchBar";

const surveyData = [
  {
    title: "Create New Survey",
  },
  {
    imageSrc: "/src/assets/survey_1.webp",
    title: "Food Satisfaction",
    date: "25/08/21",
    category: "Restaurant",
    to: "/response",
  },
  {
    imageSrc: "/src/assets/survey_2.webp",
    title: "Customer Satisfaction",
    date: "25/08/21",
    category: "Cafe",
  },
  {
    imageSrc: "/src/assets/survey_3.webp",
    title: "Call center Satisfaction",
    date: "25/08/21",
    category: "Restaurant",
  },
];

export default function AllSurveys() {
  return (
    <div className="flex flex-col items-start bg-[#FFF] min-w-screen min-h-screen">
      <div className="flex min-h-[800px] flex-col items-start bg-[#FFF] w-full overflow-hidden">
        <div className="flex flex-col items-start w-full">
          {/* Header/Back Button */}
          <div className="flex py-3 px-10 justify-between items-center border-b border-b-[#E5E8EB] w-full">
            <div className="flex min-w-[84px] max-w-[480px] py-0 px-4 justify-center items-center rounded-lg bg-[#E8EDF5] w-[84px] h-10 overflow-hidden hover:bg-gray-200 transition-colors">
              <div className="flex flex-col items-center w-fit overflow-hidden">
                <Link
                  to="/"
                  className="line-clamp-1 overflow-hidden text-[#0D141C] text-ellipsis font-inter text-sm font-bold leading-[21px] w-full text-center"
                >
                  Back
                </Link>
              </div>
            </div>
          </div>

          <div className="flex py-5 px-6 md:px-40 justify-center items-start w-full">
            <div className="flex max-w-[960px] flex-col items-start w-full overflow-hidden">
              {/* Title Section */}
              <div className="flex p-4 justify-between items-start flex-wrap w-full">
                <div className="flex min-w-[288px] flex-col items-start w-72">
                  <p className="text-[#0D141C] font-inter text-[32px] font-bold leading-10 w-full">
                    Search Template
                  </p>
                </div>
              </div>

              {/* Search Bar Component */}
              <SearchBar />

              {/* Surveys Grid */}
              <div className="flex p-4 flex-col items-start gap-3 w-full">
                <div className="flex flex-wrap items-start gap-6 w-full h-full">
                  {surveyData.map((survey, index) => (
                    <SurveyCard
                      key={index}
                      imageSrc={survey.imageSrc}
                      title={survey.title}
                      date={survey.date}
                      category={survey.category}
                      to={survey.to}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
