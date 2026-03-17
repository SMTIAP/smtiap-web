import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddQuestions() {
  const navigate = useNavigate();
  const [conditionalLogic, setConditionalLogic] = useState(false);
  
  // State for dynamic functionality
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [options, setOptions] = useState(['Option A', 'Option B']);

  const addOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length); // Generates C, D, E...
    setOptions([...options, `Option ${nextLetter}`]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  // Determine if the current type needs options displayed
  const showOptions = questionType === 'multiple-choice' || questionType === 'checkbox';

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
      <div className="flex max-w-[800px] py-10 px-6 flex-col gap-8 w-full">
        
        <div className="flex justify-start w-full">
           <p className="text-[#64748B] text-sm font-medium">Add questions</p>
        </div>

        <div className="flex flex-col gap-8 bg-white p-10 rounded-2xl shadow-sm border border-[#E2E8F0]">
          
          {/* Question Input Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[#1E293B] text-lg font-bold">Add Question</h2>
            
            <label className="text-[#1E293B] text-xs font-bold uppercase tracking-wider">Question Type</label>
            <select 
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="checkbox">Checkboxes</option>
              <option value="short-answer">Short Answer</option>
            </select>

            <label className="text-[#1E293B] text-xs font-bold uppercase tracking-wider mt-2">Question Text</label>
            <input 
              type="text" 
              placeholder="Enter your question?" 
              className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </section>

          {/* Conditional Answer Options Section */}
          {showOptions ? (
            <section className="flex flex-col gap-4 animate-in fade-in duration-300">
              <h3 className="text-[#1E293B] text-sm font-bold uppercase tracking-wider">Answer Options</h3>
              
              {options.map((option, idx) => (
                <div key={idx} className="flex items-center justify-between border border-[#E2E8F0] p-3 rounded-lg bg-[#F8FAFC]">
                  <div className="flex items-center gap-3">
                    <input 
                      type={questionType === 'multiple-choice' ? 'radio' : 'checkbox'} 
                      disabled 
                      className="w-4 h-4 rounded border-[#CBD5E1]" 
                    />
                    <input 
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[idx] = e.target.value;
                        setOptions(newOptions);
                      }}
                      className="bg-transparent text-sm text-[#64748B] focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => removeOption(idx)}
                    className="text-[#64748B] hover:text-red-500 transition-colors"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
              ))}

              <button 
                onClick={addOption}
                className="text-[#6366F1] text-xs font-bold self-start hover:underline"
              >
                + Add Option
              </button>
            </section>
          ) : (
            <section className="p-6 border-2 border-dashed border-[#E2E8F0] rounded-lg text-center">
              <p className="text-sm text-[#64748B]">Users will see a text box to type their answer.</p>
            </section>
          )}

          {/* Logic Section */}
          <section className="flex flex-col gap-4 border-t border-[#F1F5F9] pt-6">
            <h3 className="text-[#1E293B] text-sm font-bold uppercase tracking-wider">Logic</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#64748B]">Conditional Logic</span>
              <div 
                onClick={() => setConditionalLogic(!conditionalLogic)}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${conditionalLogic ? 'bg-[#6366F1]' : 'bg-[#E2E8F0]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${conditionalLogic ? ('right-1') : 'left-1'}`}></div>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="flex justify-between mt-6 border-t border-[#F1F5F9] pt-8">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-[#E2E8F0] rounded-lg text-sm font-bold text-[#64748B] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button className="bg-[#6366F1] text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:opacity-90 transition-opacity">
              Next: Review & Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}