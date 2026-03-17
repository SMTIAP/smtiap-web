import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-inter flex flex-col text-[#121417]">
      {/* Header */}
      <header className="flex py-4 px-10 items-center justify-between border-b border-[#E5E8EB] w-full">
        <h1 className="text-[#121417] text-lg font-bold leading-[23px]">
          Survey
        </h1>
        <button 
          onClick={() => navigate('/login')}
          className="h-[40px] px-6 rounded-lg bg-[#1280ED] text-white text-sm font-bold flex justify-center items-center hover:bg-[#0f6bca] transition-colors cursor-pointer">
          Sign In
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-12 md:pt-20 px-4 sm:px-10 items-center">
        <div className="w-full max-w-[480px] flex flex-col items-start lg:-ml-[200px]">
          
          {/* Back Button */}
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-[#F0F2F5] hover:bg-[#e4e6e9] transition-colors cursor-pointer mb-10">
            <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[15px] h-[13px]">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.0005 6.25037C15.0005 6.59554 14.7207 6.87537 14.3755 6.87537H2.13408L6.69268 11.4332C6.93689 11.6774 6.93689 12.0733 6.69268 12.3176C6.44846 12.5618 6.05251 12.5618 5.8083 12.3176L0.183301 6.69255C0.0659401 6.57532 -3.33786e-06 6.41625 -3.33786e-06 6.25037C-3.33786e-06 6.08449 0.0659401 5.92541 0.183301 5.80818L5.8083 0.183179C6.05251 -0.0610347 6.44846 -0.0610347 6.69268 0.183179C6.93689 0.427392 6.93689 0.82334 6.69268 1.06755L2.13408 5.62537H14.3755C14.7207 5.62537 15.0005 5.90519 15.0005 6.25037Z" fill="#121417"/>
            </svg>
            <span className="text-[#121417] text-sm font-bold">Back</span>
          </button>

          {/* Title & Description */}
          <h2 className="text-[#121417] text-[28px] md:text-3xl font-bold leading-tight mb-2">
            Forgot password?
          </h2>
          <p className="text-[#61758A] text-base mb-8 font-medium">
            Enter your email, we'll send you a password reset link.
          </p>

          {/* Form */}
          <div className="flex flex-col w-full gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-base font-medium leading-6 text-[#121417]">
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                className="h-14 px-[15px] rounded-lg border border-[#DBE0E5] bg-white text-[#121417] placeholder-[#61758A] text-base focus:outline-none focus:ring-2 focus:ring-[#1280ED] transition-all"
              />
            </div>

            <button className="h-[44px] w-full rounded-lg bg-[#1280ED] text-white text-sm font-bold leading-[21px] hover:bg-[#0f6bca] transition-colors flex justify-center items-center cursor-pointer mt-2">
              Send Email
            </button>
          </div>
          
        </div>
      </main>
    </div>
  );
}
