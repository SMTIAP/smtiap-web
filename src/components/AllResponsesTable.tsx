import React, { useState, useMemo } from "react";
import { Search, Calendar, X, ChevronUp, ChevronDown } from "lucide-react";

interface Question {
  _id: string;
  type: string;
  label: string;
  options?: string[];
}

interface AllResponsesTableProps {
  questions: Question[];
  responses: any[];
  primaryColor: string;
}

const normalizeAnswer = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value).trim();
};

export default function AllResponsesTable({
  questions,
  responses,
  primaryColor,
}: AllResponsesTableProps) {
  const [completionFilter, setCompletionFilter] = useState<
    "all" | "completed" | "incomplete"
  >("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [questionFilterId, setQuestionFilterId] = useState("");
  const [questionFilterValue, setQuestionFilterValue] = useState("");

  const isResponseComplete = (response: any) =>
    questions.every((q) => {
      const value = response?.responses?.[q._id];
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    });

  const filteredResponses = useMemo(() => {
    return responses.filter((response) => {
      if (completionFilter === "completed" && !isResponseComplete(response))
        return false;
      if (completionFilter === "incomplete" && isResponseComplete(response))
        return false;

      const submittedRaw = response?.submittedAt ?? response?.createdAt;
      const submittedDate = submittedRaw ? new Date(submittedRaw) : null;

      if (fromDate) {
        const start = new Date(`${fromDate}T00:00:00`);
        if (
          !submittedDate ||
          Number.isNaN(submittedDate.getTime()) ||
          submittedDate < start
        )
          return false;
      }
      if (toDate) {
        const end = new Date(`${toDate}T23:59:59.999`);
        if (
          !submittedDate ||
          Number.isNaN(submittedDate.getTime()) ||
          submittedDate > end
        )
          return false;
      }
      if (questionFilterId && questionFilterValue.trim()) {
        const rawAnswer = response?.responses?.[questionFilterId];
        const normalizedAnswer = Array.isArray(rawAnswer)
          ? rawAnswer.join(", ").toLowerCase()
          : String(rawAnswer ?? "").toLowerCase();
        if (
          !normalizedAnswer.includes(questionFilterValue.trim().toLowerCase())
        )
          return false;
      }
      return true;
    });
  }, [
    responses,
    completionFilter,
    fromDate,
    toDate,
    questionFilterId,
    questionFilterValue,
  ]);

  const clearFilters = () => {
    setCompletionFilter("all");
    setFromDate("");
    setToDate("");
    setQuestionFilterId("");
    setQuestionFilterValue("");
  };

  const hasActiveFilters = completionFilter !== "all" || fromDate || toDate || questionFilterId || questionFilterValue;

  return (
    <div className="space-y-4">
      {/* Filter Panel - WITH DARK MODE */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 transition-colors duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              Completion
            </label>
            <select
              value={completionFilter}
              onChange={(e) =>
                setCompletionFilter(
                  e.target.value as "all" | "completed" | "incomplete",
                )
              }
              className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="all">All responses</option>
              <option value="completed">Completed only</option>
              <option value="incomplete">Incomplete only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              Question-wise filter
            </label>
            <select
              value={questionFilterId}
              onChange={(e) => setQuestionFilterId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="">All questions</option>
              {questions.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              From date
            </label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              To date
            </label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
            Answer contains
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Type text/option/value to match"
              value={questionFilterValue}
              onChange={(e) => setQuestionFilterValue(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
            {questionFilterValue && (
              <button
                onClick={() => setQuestionFilterValue("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={12} className="text-slate-400 dark:text-slate-500" />
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredResponses.length} of {responses.length} responses
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Table - WITH DARK MODE */}
      {filteredResponses.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center transition-colors duration-300">
          <Search size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-700 dark:text-slate-300 font-bold">
            No responses match your filters
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Adjust completion, date range, or question-wise text.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    #
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Submitted At
                  </th>
                  {questions.map((q) => (
                    <th
                      key={q._id}
                      className="px-5 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap max-w-50"
                      title={q.label}
                    >
                      <span className="block truncate max-w-45">{q.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredResponses.map((response, index) => {
                  const submittedRaw =
                    response?.submittedAt ?? response?.createdAt;
                  const submittedDate = submittedRaw
                    ? new Date(submittedRaw)
                    : null;
                  const formattedDate =
                    submittedDate && !Number.isNaN(submittedDate.getTime())
                      ? submittedDate.toLocaleString()
                      : "N/A";

                  return (
                    <tr
                      key={response._id ?? index}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formattedDate}
                        </span>
                      </td>
                      {questions.map((q) => {
                        const answer = normalizeAnswer(
                          response?.responses?.[q._id],
                        );
                        return (
                          <td key={q._id} className="px-5 py-4 max-w-50">
                            {answer ? (
                              <span
                                className="text-sm text-slate-700 dark:text-slate-300 block truncate max-w-45"
                                title={answer}
                              >
                                {answer}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 text-sm">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}