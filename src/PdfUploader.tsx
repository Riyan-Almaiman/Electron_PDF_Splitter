import React, { useRef } from 'react';

interface FileSelectButtonProps {
    onFileSelect: (path: string) => void;
}
const PdfUploader = ({ onFileSelect } :FileSelectButtonProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file && file.path) {
            onFileSelect(file.path);
        }
    };

    return (
        <div>
            <button 
                className="bg-[#b0445e] hover:bg-[#80263c] text-2xl text-white font-bold py-4 px-8 rounded"
                onClick={handleButtonClick}
            >
                 اختار PDF للتقسيم
            </button>
            <input 
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </div>
    );

};

export default PdfUploader;
