

import { PDFDocument } from 'pdf-lib';

import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { ipcRenderer } from 'electron';
import Spinner from './Spinner';
import BottomButtons from './BottomButtons';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.mjs';

const PdfRenderer: React.FC<{ pdfPath: string, onPdfPathSelected: (path: string) => void }> = ({ pdfPath, onPdfPathSelected }) => {
    const [pages, setPages] = useState<string[]>([]);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedOrder, setSelectedOrder] = useState<number[]>([]); // Array to track the order of selection

 
    useEffect(() => {
        const fetchPdf = async () => {
            setIsLoading(true);

            setSelectedPages(new Set());
            setSelectedOrder([]);

            try {
                // Invoke IPC to read the PDF file in the main process
                const arrayBuffer = await ipcRenderer.invoke('load-pdf', pdfPath);
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                const numPages = pdf.numPages;
                const newPages = [];

                for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement("canvas");
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    const canvasContext = canvas.getContext('2d');

                    if (canvasContext) {
                        await page.render({ canvasContext, viewport }).promise;
                        newPages.push(canvas.toDataURL());
                    } else {
                        console.error('Could not get canvas context');
                    }
                }
                setPages(newPages);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading PDF', error);
                setIsLoading(false);
            }
        };

        if (pdfPath) {
            fetchPdf();
        }
    }, [pdfPath]);


    const togglePageSelection = (pageIndex: number) => {
        setSelectedPages((prevSelectedPages) => {
            const newSelectedPages = new Set(prevSelectedPages);
            const order = [...selectedOrder]; // Clone the current order

            if (newSelectedPages.has(pageIndex)) {
                newSelectedPages.delete(pageIndex);
                // Remove the page index from the order array
                const orderIndex = order.indexOf(pageIndex);
                if (orderIndex > -1) {
                    order.splice(orderIndex, 1);
                }
            } else {
                newSelectedPages.add(pageIndex);
                // Add the page index to the order array
                order.push(pageIndex);
            }

            setSelectedOrder(order); // Update the order state
            return newSelectedPages;
        });
    };
    const createPdf = async () => {
        if (selectedPages.size === 0) {
            // Request main process to show the dialog
            await ipcRenderer.invoke('show-no-pages-selected-dialog');
            return; // Exit the function
        }

        try {
            const newPdfDoc = await PDFDocument.create();
            const selectedPagesArray = Array.from(selectedPages);

            for (const pageIndex of selectedPagesArray) {
                const base64Image = pages[pageIndex];
                const imageBytes = Uint8Array.from(Buffer.from(base64Image.split(',')[1], 'base64'));

                const image = await newPdfDoc.embedPng(imageBytes);
                const page = newPdfDoc.addPage([image.width, image.height]);
                const { width, height } = page.getSize();

                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                });
            }

            const pdfBytes = await newPdfDoc.save();

            // Replace 'output.pdf' with your desired output file name

            // Invoke IPC to save the generated PDF file in the main process
            await ipcRenderer.send('save-merged-pdf', pdfBytes);

            // You can add code to notify the user or perform any other actions after PDF creation.
        } catch (error) {
            console.error('Error creating PDF', error);
        }
    };


    return (
        <div className='w-[80%] mt-12' >
            {
                isLoading
                    ? <div className='flex justify-center '><Spinner /></div>
                    : <div>
                        {/* ... Instructional text ... */}
                        <div className="text-center mb-8">
                      <p className="text-lg md:text-xl lg:text-3xl font-bold text-white">
                        حدد الصفحات لانشاء ملف جديد 
                      </p>
                    </div>
                        <div className="grid grid-cols-5 gap-4 mb-32">
                            {pages.map((src, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={src}
                                        alt={`Page ${index + 1}`}
                                        className={`cursor-pointer rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 object-cover h-full
                                        ${selectedPages.has(index) ? 'ring-8 ring-red-800' : ''}`}
                                        onClick={() => togglePageSelection(index)}
                                    />
                                    {selectedPages.has(index) && (
                                        // Display the order number from the selectedOrder array
                                        <div className="absolute top-0 left-0 bg-red-800 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                                            {selectedOrder.indexOf(index) + 1}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <BottomButtons onCreatePdf={createPdf} onPdfPathSelected={onPdfPathSelected} />
                      </div>
            }
        </div>
    );
};

export default PdfRenderer;
