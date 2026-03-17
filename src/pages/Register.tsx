import FacebookIcon from '../assets/Facebookstreamlineios141.png';
import GoogleIcon from '../assets/Googleiconstreamlinesvglogos1.png';
import MicrosoftIcon from '../assets/Microsofticonstreamlinesvglogos1.png';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-inter flex flex-col text-[#121417]">
      {/* Header */}
      <header className="flex py-4 px-10 items-center border-b border-[#E5E8EB] w-full">
        <h1 className="text-[#121417] text-lg font-bold leading-[23px]">
          Survey
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col py-10 px-10 md:px-20 lg:px-40 items-center">
        <div className="w-full max-w-[960px] flex flex-col">

          <h2 className="text-[22px] font-bold leading-7 mb-10 w-full text-left">
            Create your account
          </h2>

          <div className="flex flex-col md:flex-row justify-between w-full gap-16 lg:gap-20">

            {/* Form Column */}
            <div className="flex flex-col w-full max-w-[480px] gap-6">

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col flex-1 gap-2">
                  <label className="text-base font-medium leading-6 text-[#121417]">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    className="h-14 px-[15px] rounded-lg border border-[#DBE0E5] bg-white text-[#121417] placeholder-[#61758A] text-base focus:outline-none focus:ring-2 focus:ring-[#1280ED]"
                  />
                </div>

                <div className="flex flex-col flex-1 gap-2">
                  <label className="text-base font-medium leading-6 text-[#121417]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    className="h-14 px-[15px] rounded-lg border border-[#DBE0E5] bg-white text-[#121417] placeholder-[#61758A] text-base focus:outline-none focus:ring-2 focus:ring-[#1280ED]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-base font-medium leading-6 text-[#121417]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-14 px-[15px] rounded-lg border border-[#DBE0E5] bg-white text-[#121417] placeholder-[#61758A] text-base focus:outline-none focus:ring-2 focus:ring-[#1280ED]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-base font-medium leading-6 text-[#121417]">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="h-14 px-[15px] rounded-lg border border-[#DBE0E5] bg-white text-[#121417] placeholder-[#61758A] text-base focus:outline-none focus:ring-2 focus:ring-[#1280ED]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-base font-medium leading-6 text-[#121417]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="h-14 px-[15px] rounded-lg border border-[#DBE0E5] bg-white text-[#121417] placeholder-[#61758A] text-base focus:outline-none focus:ring-2 focus:ring-[#1280ED]"
                />
              </div>

              <button 
                onClick={() => navigate('/login')}
                className="mt-4 h-[44px] w-full rounded-lg bg-[#1280ED] text-white text-sm font-bold leading-[21px] hover:bg-[#0f6bca] transition-colors flex justify-center items-center">
                Register
              </button>

            </div>

            {/* Social Connect Column */}
            <div className="flex flex-col gap-4 w-full md:max-w-[345px]">

              <button className="flex items-center gap-4 h-[56px] px-6 rounded-[20px] bg-[rgba(0,149,255,0.15)] hover:bg-[rgba(0,149,255,0.25)] transition-colors w-full cursor-pointer">
                <img src={FacebookIcon} alt="Facebook" className="w-[30px] h-[30px] object-contain" />
                <span className="text-[#000] text-sm sm:text-base font-medium">
                  Sign up with Facebook
                </span>
              </button>

              <button className="flex items-center gap-4 h-[56px] px-6 rounded-[20px] bg-[rgba(255,0,0,0.15)] hover:bg-[rgba(255,0,0,0.25)] transition-colors w-full cursor-pointer">
                <img src={GoogleIcon} alt="Google" className="w-[30px] h-[30px] object-contain" />
                <span className="text-[#000] text-sm sm:text-base font-medium">
                  Sign up with Google
                </span>
              </button>

              <button className="flex items-center gap-4 h-[56px] px-6 rounded-[20px] bg-[rgba(254,195,0,0.2)] hover:bg-[rgba(254,195,0,0.3)] transition-colors w-full cursor-pointer">
                <img src={MicrosoftIcon} alt="Microsoft" className="w-[30px] h-[30px] object-contain" />
                <span className="text-[#000] text-sm sm:text-base font-medium">
                  Sign up with Microsoft
                </span>
              </button>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
