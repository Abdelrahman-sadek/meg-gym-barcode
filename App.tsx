
import React, { useState, useRef, useCallback } from 'react';
import Barcode from 'react-barcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const printRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(() => {
    setError(null);
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);

    if (isNaN(startNum) || isNaN(endNum)) {
      setError('الرجاء إدخال أرقام صحيحة في كلا الحقلين.');
      return;
    }

    if (startNum > endNum) {
      setError('يجب أن يكون رقم البداية أصغر من أو يساوي رقم النهاية.');
      return;
    }
    
    const range = endNum - startNum;
    if (range > 199) {
        setError('لا يمكن إنشاء أكثر من 200 باركود في المرة الواحدة لتحسين الأداء.');
        return;
    }

    const newBarcodes = Array.from({ length: endNum - startNum + 1 }, (_, i) => (startNum + i).toString());
    setBarcodes(newBarcodes);
  }, [start, end]);

  const handleExportPDF = async () => {
    if (!printRef.current || barcodes.length === 0) {
        setError('لا يوجد باركود لتصديره. الرجاء إنشاء الباركود أولاً.');
        return;
    };
    
    setIsGenerating(true);
    setError(null);

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: '#111827', // Match the background color
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MEG_GYM_Barcodes_${start}_to_${end}.pdf`);

    } catch (e) {
        setError('حدث خطأ أثناء إنشاء ملف PDF. الرجاء المحاولة مرة أخرى.');
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 sm:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-yellow-400 tracking-wider">MEG GYM</h1>
          <p className="text-lg sm:text-xl text-gray-300 mt-2">مولد الباركود للأعضاء</p>
        </header>

        <main className="bg-gray-800 shadow-2xl rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col">
              <label htmlFor="start" className="mb-2 text-sm font-bold text-gray-400">من رقم:</label>
              <input
                id="start"
                type="number"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="مثال: 1001"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="end" className="mb-2 text-sm font-bold text-gray-400">إلى رقم:</label>
              <input
                id="end"
                type="number"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                placeholder="مثال: 1050"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
              />
            </div>
            <div className="md:mt-7">
                <button
                onClick={handleGenerate}
                className="w-full bg-yellow-400 text-gray-900 font-bold text-lg py-3 px-6 rounded-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                إنشاء
                </button>
            </div>
          </div>
          
          {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

          <div className="mt-10 border-t-2 border-gray-700 pt-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-300">الباركود التي تم إنشاؤها</h2>
            
            {barcodes.length > 0 ? (
                <div ref={printRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4 bg-gray-900 rounded-lg">
                {barcodes.map(code => (
                    <div key={code} className="bg-white p-3 rounded-md flex flex-col items-center justify-center shadow-md">
                    <Barcode 
                        value={code} 
                        format="CODE128B"
                        width={1.5}
                        height={60}
                        displayValue={false}
                        background="#FFFFFF"
                        lineColor="#000000"
                    />
                    <p className="text-black font-semibold mt-2 tracking-widest">{code}</p>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center py-10 px-4 border-2 border-dashed border-gray-700 rounded-lg">
                    <p className="text-gray-500">سيتم عرض الباركود هنا بعد إنشائها.</p>
                </div>
            )}
          </div>

          {barcodes.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={handleExportPDF}
                disabled={isGenerating}
                className="bg-green-500 text-white font-bold text-lg py-3 px-8 rounded-lg hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center mx-auto"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ms-1 me-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري التصدير...
                  </>
                ) : (
                  'تصدير كملف PDF'
                )}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
