import React from 'react';

export const UserProfile = ({ isSidebarOpen, user }) => {
  const { email, name, fullName, roles } = user;

  return (
    <div
      className={`px-6 py-6 border-b border-slate-700/50 transition-all duration-300 bg-slate-800/30 backdrop-blur-sm ${
        isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'
      }`}
    >
      <div className="flex items-center">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-semibold text-xl shadow-2xl border-2 border-white/20">
            {name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800"></div>
        </div>
        {isSidebarOpen && (
          <div className="truncate flex-1 ml-4">
            <p className="font-semibold text-white truncate text-lg leading-tight">
              {fullName || name || email}
            </p>
            <p className="text-slate-300 text-sm truncate mt-1.5">{email}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {roles?.map((role, index) => (
                <span
                  key={index}
                  className="text-xs bg-slate-700/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-600/50 text-slate-200 font-medium"
                >
                  {role.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};