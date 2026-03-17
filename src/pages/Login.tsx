import FacebookIcon from '../assets/Facebookstreamlineios141.png';
import GoogleIcon from '../assets/Googleiconstreamlinesvglogos1.png';
import MicrosoftIcon from '../assets/Microsofticonstreamlinesvglogos1.png';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter flex flex-col text-[#121417] items-center pt-8 md:pt-16 px-4 sm:px-10">
      <div className="w-full max-w-[960px] flex flex-col">
        {/* Banner */}
        <div 
          className="w-full h-[222px] rounded-[16px] mb-12 flex flex-col justify-end p-6 sm:p-10 relative overflow-hidden shadow-sm"
          style={{
            background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.00) 100%), linear-gradient(90deg, #181717 0%, rgba(255, 255, 255, 0.00) 100%), #d1d5db'
          }}
        >
          <div className="flex justify-between items-end w-full relative z-10 flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight">Welcome back</h2>
              <p className="text-white text-sm md:text-base font-medium opacity-90">Please enter your credentials to access your account.</p>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="h-[40px] px-6 rounded-lg bg-[#1280ED] text-white text-sm font-bold flex justify-center items-center hover:bg-[#0f6bca] transition-colors cursor-pointer">
              Back
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between w-full gap-12 lg:gap-20">
          
          {/* Form Column */}
          <div className="flex flex-col w-full max-w-[480px] gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-base font-medium leading-6 text-[#121417]">
                Email
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                className="h-14 px-[15px] rounded-lg border border-[#DBE0E5] bg-white text-[#121417] placeholder-[#61758A] text-base focus:outline-none focus:ring-2 focus:ring-[#1280ED] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-base font-medium leading-6 text-[#121417]">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="h-14 px-[15px] rounded-lg border border-[#DBE0E5] bg-white text-[#121417] placeholder-[#61758A] text-base focus:outline-none focus:ring-2 focus:ring-[#1280ED] transition-all"
              />
            </div>

            <button className="mt-2 h-[44px] w-full rounded-lg bg-[#1280ED] text-white text-sm font-bold leading-[21px] hover:bg-[#0f6bca] transition-colors flex justify-center items-center cursor-pointer">
              Login
            </button>
          </div>

          {/* Social Connect Column */}
          <div className="flex flex-col gap-4 w-full md:max-w-[345px]">
            <button className="flex items-center gap-4 h-[56px] px-6 rounded-[20px] bg-[rgba(0,149,255,0.15)] hover:bg-[rgba(0,149,255,0.25)] transition-colors w-full cursor-pointer">
              <img src={FacebookIcon} alt="Facebook" className="w-[30px] h-[30px] object-contain" />
              <span className="text-[#000] text-sm sm:text-base font-medium">
                Login with Facebook
              </span>
            </button>

            <button className="flex items-center gap-4 h-[56px] px-6 rounded-[20px] bg-[rgba(255,0,0,0.15)] hover:bg-[rgba(255,0,0,0.25)] transition-colors w-full cursor-pointer">
              <img src={GoogleIcon} alt="Google" className="w-[30px] h-[30px] object-contain" />
              <span className="text-[#000] text-sm sm:text-base font-medium">
                Login with Google
              </span>
            </button>

            <button className="flex items-center gap-4 h-[56px] px-6 rounded-[20px] bg-[rgba(254,195,0,0.2)] hover:bg-[rgba(254,195,0,0.3)] transition-colors w-full cursor-pointer">
              <img src={MicrosoftIcon} alt="Microsoft" className="w-[30px] h-[30px] object-contain" />
              <span className="text-[#000] text-sm sm:text-base font-medium">
                Login with Microsoft
              </span>
            </button>
          </div>

        </div>

        {/* Footer Links */}
        <div className="flex flex-col items-center mt-12 mb-10 gap-3">
          <p 
            onClick={() => navigate('/forgot-password')}
            className="text-[#61758A] font-inter text-sm cursor-pointer hover:underline hover:text-[#1280ED] transition-colors text-center">
            Forgot password?
          </p>
          <p 
            onClick={() => navigate('/')}
            className="text-[#61758A] font-inter text-sm cursor-pointer hover:underline hover:text-[#1280ED] transition-colors text-center">
            Don't have an account? Sign Up
          </p>
        </div>
      </div>
    </div>
  );
}
