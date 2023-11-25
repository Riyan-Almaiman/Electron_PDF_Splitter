import React from 'react';

interface CreatePdfButtonProps {
  onClick: () => void;
}

const CreatePdfButton: React.FC<CreatePdfButtonProps> = ({ onClick }) => {
  return (
    <button
      className="bg-[#e08b31] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-4"
      onClick={onClick}
    >
      Create PDF
    </button>
  );
};

export default CreatePdfButton;
