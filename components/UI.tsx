import React from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X, Upload, Image as ImageIcon } from 'lucide-react';

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'contained', color = 'primary', size = 'md', fullWidth = false, isLoading, className = '', ...props 
}) => {
  const baseStyles = "uppercase font-medium tracking-wide rounded transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-1";
  
  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3"
  };

  const variants = {
    contained: {
      primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:shadow-none disabled:bg-blue-300",
      secondary: "bg-pink-600 text-white hover:bg-pink-700 shadow-md hover:shadow-lg disabled:bg-pink-300",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg disabled:bg-red-300",
    },
    outlined: {
      primary: "border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-blue-300 disabled:text-blue-300",
      secondary: "border border-pink-600 text-pink-600 hover:bg-pink-50",
      danger: "border border-red-600 text-red-600 hover:bg-red-50",
    },
    text: {
      primary: "text-blue-600 hover:bg-blue-50 disabled:text-gray-400",
      secondary: "text-pink-600 hover:bg-pink-50",
      danger: "text-red-600 hover:bg-red-50",
    }
  };

  const widthClass = fullWidth ? "w-full" : "";
  const sizeClass = sizes[size];
  
  // @ts-ignore - variant/color indexing safety ignored for brevity
  const styleClass = variants[variant][color];

  return (
    <button className={`${baseStyles} ${sizeClass} ${styleClass} ${widthClass} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

// --- TEXT FIELD ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  multiline?: boolean;
}

export const TextField: React.FC<InputProps> = ({ label, multiline, className = '', ...props }) => {
  // Explicitly set text-gray-900 and placeholder-gray-400 to ensure text is visible against the white background
  const inputStyles = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400";
  
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider">
        {label}
      </label>
      {multiline ? (
        // @ts-ignore
        <textarea className={`${inputStyles} min-h-[100px]`} {...props} />
      ) : (
        <input className={inputStyles} {...props} />
      )}
    </div>
  );
};

// --- IMAGE UPLOAD ---
interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, value, onChange, className = '' }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert file to base64 string for "mock database" storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors bg-white"
        >
          <Upload size={24} className="mb-2 text-blue-500" />
          <span className="text-sm font-medium text-center">Click to upload image</span>
          <span className="text-xs text-gray-400 mt-1">Supports JPG, PNG (Max 5MB)</span>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>

        {value && (
          <div className="relative w-full sm:w-32 h-32 border rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm group">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => onChange('')}
              className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full shadow hover:bg-red-600 transition-opacity opacity-0 group-hover:opacity-100"
              type="button"
              title="Remove Image"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </div>
  );
};

// --- MODAL ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  // Use createPortal to ensure modal sits on top of everything (including sticky headers)
  // Using document.body as the container
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Increased max-w-lg to max-w-3xl for wider modal */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};