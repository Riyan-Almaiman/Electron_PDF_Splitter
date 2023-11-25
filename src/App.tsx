import { useState } from 'react';

import PdfUploader from './PdfUploader';
import PdfRenderer from './PdfRenderer';

function App() {
  const [pdfPath, setPdfPath] = useState<string | null>(null);

  return (
    <div className='bg-purple-gradient w-full h-screen overflow-scroll'>
      <div className='flex flex-col h-full justify-between'>
        {/* Logo container */}
        <div className='p-4'>
          <img src='etsLogoWhite.png' alt='ETS Logo' className='h-24 m-8' />
        </div>

        {/* Content container */}
        <div className='flex-grow flex flex-col justify-center items-center'>
          {
            pdfPath ? 
            <PdfRenderer pdfPath={pdfPath} onPdfPathSelected={setPdfPath} /> :
            <>
              {/* Title */}
              <h1 className='text-white text-5xl font-bold mb-24'>PDF Splitter</h1>
              <PdfUploader onFileSelect={(path) => setPdfPath(path)} />
            </>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
