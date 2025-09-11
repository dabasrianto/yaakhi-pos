import React from 'react';

const AppLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col justify-center items-center z-[100] backdrop-blur-sm">
      <div className="w-14 h-14 border-4 border-indigo-100 border-b-indigo-500 rounded-full inline-block box-border animate-spin"></div>
      <p className="mt-4 text-slate-600 font-semibold">Menunggu Autentikasi...</p>
    </div>
  );
};

export default AppLoader;