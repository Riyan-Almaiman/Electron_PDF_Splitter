import React from 'react';
import PdfUploader from './PdfUploader';

const BottomButtons: React.FC<{
    onCreatePdf: () => void;
    onPdfPathSelected: (path: string) => void; // Function to handle path selection
}> = ({ onCreatePdf, onPdfPathSelected }) => {

  return (
    <div className="fixed bottom-0 left-0 w-full p-4 mb-2  flex justify-center items-center">
      <button
        onClick={onCreatePdf}
        className="bg-[#e08b31] hover:bg-[#a35d14] text-2xl text-white font-bold py-4 px-8 rounded ml-4"
      >
            انشاء PDF جديد من الصفحات المحدده
      </button>
      <PdfUploader onFileSelect={onPdfPathSelected} />
    </div>
  );
};

export default BottomButtons;
