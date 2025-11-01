
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = "text-lg font-semibold py-3 px-8 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

  const variantClasses = {
    primary: "bg-cyan-500 text-slate-900 hover:bg-cyan-400 focus:ring-cyan-400/50 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40",
    secondary: "bg-transparent text-cyan-400 border-2 border-cyan-500 hover:bg-cyan-500/10 focus:ring-cyan-400/50"
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
