

export default function OrganizationAdmin() {
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
          <button className="cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center rounded-md bg-[#1E293B] text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90">
            Back
          </button>
        </div>

        {/* Top Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Surveys */}
          <div className="flex py-10 px-6 flex-col justify-center items-center gap-4 rounded-xl border border-[#E2E8F0] bg-[#FFF] shadow-sm w-full">
            <div className="flex justify-center items-center shrink-0 rounded-md bg-[#F1F5F9] w-12 h-12">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.2031 7.96875H13.9688V13.9688H11.2031V7.96875V7.96875M5.57812 0H8.39062V13.9688H5.57812V0V0M0 4.17188H3V13.9688H0V4.17188V4.17188" fill="#64748B" />
              </svg>
            </div>
            <p className="text-[#1E293B] font-inter text-lg font-semibold leading-7">
              Surveys
            </p>
          </div>

          {/* Employees */}
          <div className="flex py-10 px-6 flex-col justify-center items-center gap-4 rounded-xl border border-[#E2E8F0] bg-[#FFF] shadow-sm w-full">
            <div className="flex justify-center items-center shrink-0 rounded-md bg-[#F1F5F9] w-12 h-12">
              <svg width="23" height="14" viewBox="0 0 23 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 7.96875C15.875 7.96875 16.8281 8.09375 17.8594 8.34375C18.8906 8.59375 19.8438 9 20.7188 9.5625C21.5938 10.125 22.0312 10.7656 22.0312 11.4844V13.9688H16.0312V11.4844C16.0312 10.1094 15.375 8.95312 14.0625 8.01562C14.2812 7.98438 14.5938 7.96875 15 7.96875V7.96875M4.17188 8.34375C5.20312 8.09375 6.15625 7.96875 7.03125 7.96875C7.90625 7.96875 8.85938 8.09375 9.89062 8.34375C10.9219 8.59375 11.8672 9 12.7266 9.5625C13.5859 10.125 14.0156 10.7656 14.0156 11.4844V13.9688H0V11.4844C0 10.7656 0.4375 10.125 1.3125 9.5625C2.1875 9 3.14062 8.59375 4.17188 8.34375V8.34375M9.11719 5.10938C8.53906 5.70312 7.84375 6 7.03125 6C6.21875 6 5.51562 5.70312 4.92188 5.10938C4.32812 4.51562 4.03125 3.8125 4.03125 3C4.03125 2.1875 4.32812 1.48438 4.92188 0.890625C5.51562 0.296875 6.21875 0 7.03125 0C7.84375 0 8.53906 0.296875 9.11719 0.890625C9.69531 1.48438 9.98438 2.1875 9.98438 3C9.98438 3.8125 9.69531 4.51562 9.11719 5.10938V5.10938M17.1094 5.10938C16.5156 5.70312 15.8125 6 15 6C14.1875 6 13.4844 5.70312 12.8906 5.10938C12.2969 4.51562 12 3.8125 12 3C12 2.1875 12.2969 1.48438 12.8906 0.890625C13.4844 0.296875 14.1875 0 15 0C15.8125 0 16.5156 0.296875 17.1094 0.890625C17.7031 1.48438 18 2.1875 18 3C18 3.8125 17.7031 4.51562 17.1094 5.10938V5.10938" fill="#64748B" />
              </svg>
            </div>
            <p className="text-[#1E293B] font-inter text-lg font-semibold leading-7">
              Employees
            </p>
          </div>

          {/* Billing */}
          <div className="flex py-10 px-6 flex-col justify-center items-center gap-4 rounded-xl border border-[#E2E8F0] bg-[#FFF] shadow-sm w-full">
            <div className="flex justify-center items-center shrink-0 rounded-md bg-[#F1F5F9] w-12 h-12">
              <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.9297 10.0781C12.2266 10.3594 12.5781 10.5 12.9844 10.5C13.3906 10.5 13.7422 10.3594 14.0391 10.0781C14.3359 9.79688 14.4844 9.4375 14.4844 9C14.4844 8.5625 14.3359 8.20312 14.0391 7.92188C13.7422 7.64062 13.3906 7.5 12.9844 7.5C12.5781 7.5 12.2266 7.64062 11.9297 7.92188C11.6328 8.20312 11.4844 8.5625 11.4844 9C11.4844 9.4375 11.6328 9.79688 11.9297 10.0781V10.0781M9 12.9844V5.01562H18.9844V12.9844H9V12.9844M18 15V15.9844C18 16.5156 17.7969 16.9844 17.3906 17.3906C16.9844 17.7969 16.5156 18 15.9844 18H2.01562C1.45312 18 0.976562 17.8047 0.585938 17.4141C0.195312 17.0234 0 16.5469 0 15.9844V2.01562C0 1.45312 0.195312 0.976562 0.585938 0.585938C0.976562 0.195312 1.45312 0 2.01562 0H15.9844C16.5156 0 16.9844 0.203125 17.3906 0.609375C17.7969 1.01562 18 1.48438 18 2.01562V3H9C8.4375 3 7.96094 3.19531 7.57031 3.58594C7.17969 3.97656 6.98438 4.45312 6.98438 5.01562V12.9844C6.98438 13.5469 7.17969 14.0234 7.57031 14.4141C7.96094 14.8047 8.4375 15 9 15H18V15" fill="#64748B" />
              </svg>
            </div>
            <p className="text-[#1E293B] font-inter text-lg font-semibold leading-7">
              Billing
            </p>
          </div>
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
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.91797 11.7773C7.40234 11.4258 8.76953 11.25 10.0195 11.25C11.2695 11.25 12.6367 11.4258 14.1211 11.7773C15.6055 12.1289 16.9629 12.7148 18.1934 13.5352C19.4238 14.3555 20.0391 15.2734 20.0391 16.2891V20.0391H0V16.2891C0 15.2734 0.615234 14.3555 1.8457 13.5352C3.07617 12.7148 4.43359 12.1289 5.91797 11.7773V11.7773M6.50391 1.49414C7.48047 0.498047 8.65234 0 10.0195 0C11.3867 0 12.5586 0.498047 13.5352 1.49414C14.5117 2.49023 15 3.67188 15 5.03906C15 6.40625 14.5117 7.57812 13.5352 8.55469C12.5586 9.53125 11.3867 10.0195 10.0195 10.0195C8.65234 10.0195 7.48047 9.53125 6.50391 8.55469C5.52734 7.57812 5.03906 6.40625 5.03906 5.03906C5.03906 3.67188 5.52734 2.49023 6.50391 1.49414V1.49414M15.1172 14.6191C13.4375 13.9746 11.7383 13.6523 10.0195 13.6523C8.30078 13.6523 6.60156 13.9746 4.92188 14.6191C3.24219 15.2637 2.40234 15.8203 2.40234 16.2891V17.6367H17.6367V16.2891C17.6367 15.8203 16.7969 15.2637 15.1172 14.6191V14.6191M11.8945 3.16406C11.3867 2.65625 10.7617 2.40234 10.0195 2.40234C9.27734 2.40234 8.65234 2.65625 8.14453 3.16406C7.63672 3.67188 7.38281 4.29688 7.38281 5.03906C7.38281 5.78125 7.63672 6.39648 8.14453 6.88477C8.65234 7.37305 9.27734 7.61719 10.0195 7.61719C10.7617 7.61719 11.3867 7.37305 11.8945 6.88477C12.4023 6.39648 12.6562 5.78125 12.6562 5.03906C12.6562 4.29688 12.4023 3.67188 11.8945 3.16406V3.16406" fill="#3B82F6" />
                </svg>
              </div>
              <div className="flex flex-col items-start w-full">
                <div className="flex py-3 justify-between items-center border-b border-b-[#F8FAFC] w-full">
                  <p className="text-[#64748B] font-inter text-sm md:text-base">Admins</p>
                  <p className="text-[#1E293B] font-inter text-md md:text-lg font-bold">3</p>
                </div>
                <div className="flex py-3 justify-between items-center border-b border-b-[#F8FAFC] w-full">
                  <p className="text-[#64748B] font-inter text-sm md:text-base">Creators</p>
                  <p className="text-[#1E293B] font-inter text-md md:text-lg font-bold">2</p>
                </div>
                <div className="flex py-3 justify-between items-center border-b border-b-[#F8FAFC] w-full">
                  <p className="text-[#64748B] font-inter text-sm md:text-base">Billing</p>
                  <p className="text-[#1E293B] font-inter text-md md:text-lg font-bold">1</p>
                </div>
                <div className="flex pt-3 pb-1 justify-between items-center w-full">
                  <p className="text-[#64748B] font-inter text-sm md:text-base">Viewers</p>
                  <p className="text-[#1E293B] font-inter text-md md:text-lg font-bold">5</p>
                </div>
              </div>
            </div>

            {/* Content Status */}
            <div className="flex p-8 flex-col items-center gap-6 rounded-2xl border border-[#F1F5F9] bg-[#FFF] shadow-sm w-full">
              <div className="flex justify-center items-center rounded-full bg-[#EEF2FF] w-14 h-14 mb-2">
                <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.625 12.3047C21.6406 12.3047 22.6953 12.4023 23.7891 12.5977V14.4727C23.0078 14.2773 21.9531 14.1797 20.625 14.1797C18.2812 14.1797 16.4062 14.5898 15 15.4102V13.3008C16.4844 12.6367 18.3594 12.3047 20.625 12.3047V12.3047M15 9.96094C16.6406 9.29688 18.5156 8.96484 20.625 8.96484C21.6406 8.96484 22.6953 9.0625 23.7891 9.25781V11.1328C23.0078 10.9375 21.9531 10.8398 20.625 10.8398C18.2812 10.8398 16.4062 11.25 15 12.0703V9.96094V9.96094M20.625 7.5C18.2812 7.5 16.4062 7.91016 15 8.73047V6.67969C16.5625 5.97656 18.4375 5.625 20.625 5.625C21.6406 5.625 22.6953 5.72266 23.7891 5.91797V7.85156C22.8516 7.61719 21.7969 7.5 20.625 7.5V7.5M25.0195 17.5195V3.10547C23.7305 2.71484 22.2656 2.51953 20.625 2.51953C18.0859 2.51953 15.8008 3.14453 13.7695 4.39453V18.75C15.8008 17.5 18.0859 16.875 20.625 16.875C22.1484 16.875 23.6133 17.0898 25.0195 17.5195V17.5195M20.625 0C23.5938 0 25.8984 0.625 27.5391 1.875V20.0977C27.5391 20.2539 27.4707 20.4004 27.334 20.5371C27.1973 20.6738 27.0508 20.7422 26.8945 20.7422C26.7773 20.7422 26.6797 20.7227 26.6016 20.6836C25 19.8242 23.0078 19.3945 20.625 19.3945C18.0859 19.3945 15.8008 20.0195 13.7695 21.2695C12.0898 20.0195 9.80469 19.3945 6.91406 19.3945C4.80469 19.3945 2.8125 19.8438 0.9375 20.7422C0.898438 20.7422 0.849609 20.752 0.791016 20.7715C0.732422 20.791 0.683594 20.8008 0.644531 20.8008C0.488281 20.8008 0.341797 20.7422 0.205078 20.625C0.0683594 20.5078 0 20.3711 0 20.2148V1.875C1.67969 0.625 3.98438 0 6.91406 0C9.80469 0 12.0898 0.625 13.7695 1.875C15.4492 0.625 17.7344 0 20.625 0V0" fill="#6366F1" />
                </svg>
              </div>
              <div className="flex flex-col items-start w-full">
                <div className="flex py-3 justify-between items-center border-b border-b-[#F8FAFC] w-full">
                  <p className="text-[#64748B] font-inter text-sm md:text-base">Created</p>
                  <p className="text-[#1E293B] font-inter text-md md:text-lg font-bold">3</p>
                </div>
                <div className="flex py-3 justify-between items-center border-b border-b-[#F8FAFC] w-full">
                  <p className="text-[#64748B] font-inter text-sm md:text-base">Draft</p>
                  <p className="text-[#1E293B] font-inter text-md md:text-lg font-bold">2</p>
                </div>
                <div className="flex py-3 justify-between items-center border-b border-b-[#F8FAFC] w-full">
                  <p className="text-[#64748B] font-inter text-sm md:text-base">Published</p>
                  <p className="text-[#1E293B] font-inter text-md md:text-lg font-bold">7</p>
                </div>
                <div className="flex pt-3 pb-1 justify-between items-center w-full">
                  <p className="text-[#64748B] font-inter text-sm md:text-base">Ended</p>
                  <p className="text-[#1E293B] font-inter text-md md:text-lg font-bold">8</p>
                </div>
              </div>
            </div>

            {/* Premium Status */}
            <div className="flex p-8 flex-col items-center gap-6 rounded-2xl border border-[#F1F5F9] bg-[#FFF] shadow-sm w-full">
              <div className="flex justify-center items-center rounded-full bg-[#FFF7ED] w-14 h-14 mb-2">
                <svg width="23" height="28" viewBox="0 0 23 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.73047 20.0391L18.75 10.0195L16.9922 8.26172L8.73047 16.4648L5.50781 13.2422L3.75 15L8.73047 20.0391V20.0391M11.25 0L22.5 5.03906V12.5391C22.5 16.0156 21.4258 19.1895 19.2773 22.0605C17.1289 24.9316 14.4531 26.7578 11.25 27.5391C8.04688 26.7578 5.37109 24.9316 3.22266 22.0605C1.07422 19.1895 0 16.0156 0 12.5391V5.03906L11.25 0V0" fill="#F97316" />
                </svg>
              </div>
              <div className="flex py-2 px-0 flex-col items-center rounded-lg bg-[#EFF6FF] w-full">
                <p className="text-[#2563EB] font-inter text-sm font-bold">
                  Type: Premium
                </p>
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
                  <p className="text-[#94A3B8] font-inter text-[10px] font-bold tracking-[0.05em] uppercase">
                    Remaining
                  </p>
                  <p className="text-[#3B82F6] font-inter text-xl md:text-2xl font-bold">
                    100 days
                  </p>
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
