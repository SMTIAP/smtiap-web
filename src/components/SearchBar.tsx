import React from 'react';

const SearchBar: React.FC = () => {
  return (
    <div className="flex py-3 px-4 flex-col items-start w-full">
      <div className="flex min-w-[160px] flex-col items-start w-full h-12">
        <div className="flex items-start rounded-lg w-full h-full">
          <div className="flex pl-4 justify-center items-center rounded-lg bg-[#E8EDF5] w-fit h-full">
            <div className="w-full h-6 overflow-hidden relative">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 absolute left-0 top-0 "
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M19.3014 18.2401L14.6073 13.547C17.4337 10.1538 17.0912 5.13769 13.8299 2.1601C10.5686 -0.817485 5.54209 -0.703249 2.41942 2.41942C-0.703249 5.54209 -0.817485 10.5686 2.1601 13.8299C5.13769 17.0912 10.1538 17.4337 13.547 14.6073L18.2401 19.3014C18.5332 19.5944 19.0083 19.5944 19.3014 19.3014C19.5944 19.0083 19.5944 18.5332 19.3014 18.2401ZM1.52075 8.27075C1.52075 4.54283 4.54283 1.52075 8.27075 1.52075C11.9987 1.52075 15.0208 4.54283 15.0208 8.27075C15.0208 11.9987 11.9987 15.0208 8.27075 15.0208C4.54454 15.0166 1.52489 11.997 1.52075 8.27075Z"
                  fill="#4A739C"
                />
              </svg>
              <div className="flex flex-col items-start w-5 h-5 absolute left-0 top-0"></div>
            </div>
          </div>
          <div className="flex pt-2 pr-4 pb-2 pl-2 items-center rounded-lg bg-[#E8EDF5] w-full h-full overflow-hidden">
            <input
              type="text"
              placeholder="Search templates..."
              className="bg-transparent border-none outline-none text-[#4A739C] font-inter text-base leading-6 w-full placeholder:text-[#4A739C]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
