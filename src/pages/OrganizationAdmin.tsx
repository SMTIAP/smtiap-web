import { Link } from 'react-router-dom';
import { BarChart3, Users, CreditCard, UserCheck, BookOpen, ShieldCheck, ArrowLeft, type LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  to?: string;
  icon: LucideIcon;
  title: string;
}

const FeatureCard = ({ to, icon: Icon, title }: FeatureCardProps) => {
  const content = (
    <div className="flex py-10 px-6 flex-col justify-center items-center gap-4 rounded-xl border border-[#E2E8F0] bg-[#FFF] shadow-sm w-full transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer h-full">
      <div className="flex justify-center items-center shrink-0 rounded-md bg-[#F1F5F9] w-12 h-12">
        <Icon size={24} className="text-[#64748B]" />
      </div>
      <p className="text-[#1E293B] font-inter text-lg font-semibold leading-7">
        {title}
      </p>
    </div>
  );

  return to ? (
    <Link to={to} className="w-full h-full no-underline">
      {content}
    </Link>
  ) : (
    <div className="w-full h-full">
      {content}
    </div>
  );
};

interface StatRowProps {
  label: string;
  value: string | number;
  isLast?: boolean;
}

const StatRow = ({ label, value, isLast }: StatRowProps) => (
  <div className={`flex py-3 justify-between items-center ${!isLast ? 'border-b border-b-[#F8FAFC]' : ''} w-full`}>
    <p className="text-[#64748B] font-inter text-sm md:text-base">{label}</p>
    <p className="text-[#1E293B] font-inter text-md md:text-lg font-bold">{value}</p>
  </div>
);

export default function OrganizationAdmin() {
  const features = [
    { title: 'Surveys', icon: BarChart3, to: '/created-surveys' },
    { title: 'Employees', icon: Users, to: '/role-management' },
    { title: 'Billing', icon: CreditCard, to: '/subscription' },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
      <div className="flex max-w-[1152px] py-10 px-6 flex-col items-start gap-10 w-full">
        
        {/* Header Section */} 
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center w-fit">
            <h1 className="text-[#1E293B] font-inter text-3xl font-bold leading-9">
              Welcome back, Saliya...
            </h1>
          </div>
          <Link to="/" className="cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md bg-[#1E293B] text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90">
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        {/* Top Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>

        {/* Status Section */}
        <div className="flex flex-col items-start gap-6 w-full mt-4">
          <h2 className="text-[#1E293B] font-inter text-2xl font-bold leading-8 w-full">
            Organization Status:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            
            {/* Roles Status */}
            <div className="flex p-8 flex-col items-center gap-6 rounded-2xl border border-[#F1F5F9] bg-[#FFF] shadow-sm w-full">
              <div className="flex justify-center items-center rounded-full bg-[#EFF6FF] w-14 h-14 mb-2">
                <UserCheck size={28} className="text-[#3B82F6]" />
              </div>
              <div className="flex flex-col items-start w-full">
                <StatRow label="Admins" value="3" />
                <StatRow label="Creators" value="2" />
                <StatRow label="Billing" value="1" />
                <StatRow label="Viewers" value="5" isLast />
              </div>
            </div>

            {/* Content Status */}
            <div className="flex p-8 flex-col items-center gap-6 rounded-2xl border border-[#F1F5F9] bg-[#FFF] shadow-sm w-full">
              <div className="flex justify-center items-center rounded-full bg-[#EEF2FF] w-14 h-14 mb-2">
                <BookOpen size={28} className="text-[#6366F1]" />
              </div>
              <div className="flex flex-col items-start w-full">
                <StatRow label="Created" value="3" />
                <StatRow label="Draft" value="2" />
                <StatRow label="Published" value="7" />
                <StatRow label="Ended" value="8" isLast />
              </div>
            </div>

            {/* Premium Status */}
            <div className="flex p-8 flex-col items-center gap-6 rounded-2xl border border-[#F1F5F9] bg-[#FFF] shadow-sm w-full">
              <div className="flex justify-center items-center rounded-full bg-[#FFF7ED] w-14 h-14 mb-2">
                <ShieldCheck size={28} className="text-[#F97316]" />
              </div>
              <div className="flex py-2 px-0 flex-col items-center rounded-lg bg-[#EFF6FF] w-full">
                <p className="text-[#2563EB] font-inter text-sm font-bold">Type: Premium</p>
              </div>
              <div className="flex flex-col items-start gap-4 w-full mt-2">
                <div className="flex justify-between items-center w-full">
                  <p className="text-[#94A3B8] font-inter text-sm">Start Date</p>
                  <p className="text-[#334155] font-inter text-sm font-bold">25/02/12</p>
                </div>
                <div className="flex justify-between items-center w-full">
                  <p className="text-[#94A3B8] font-inter text-sm">End Date</p>
                  <p className="text-[#334155] font-inter text-sm font-bold">26/05/27</p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 w-full mt-4">
                <div className="flex justify-between items-end w-full">
                  <p className="text-[#94A3B8] font-inter text-[10px] font-bold tracking-[0.05em] uppercase">Remaining</p>
                  <p className="text-[#3B82F6] font-inter text-xl md:text-2xl font-bold">100 days</p>
                </div>
                <div className="w-full h-2 rounded-full border border-[#F1F5F9] bg-[#F1F5F9] relative overflow-hidden">
                  <div className="absolute top-0 left-0 bg-[#3B82F6] h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
