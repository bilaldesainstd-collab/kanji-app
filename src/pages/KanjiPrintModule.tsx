import { kanjiN5 } from '../data/kanjiN5';
import { useNavigate } from 'react-router-dom';

const COLS = 2;
const ROWS = 5; // 4 baris aman untuk kartu tinggi 7cm di A4 Portrait
const CARDS_PER_PAGE = COLS * ROWS;

export default function KanjiPrintModule() {
  const handlePrint = () => window.print();
  const navigate = useNavigate();

  // 📄 Bagi data jadi batch per halaman (8 kartu/batch)
  const batches = [];
  for (let i = 0; i < kanjiN5.length; i += CARDS_PER_PAGE) {
    batches.push(kanjiN5.slice(i, i + CARDS_PER_PAGE));
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* 🎛️ Control Panel (Otomatis hidden saat print) */}
      <div className="print:hidden max-w-3xl mx-auto mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">️ Kanji N5 Print Module</h2>
        <p className="text-gray-600 mb-4">
          Total: <span className="font-semibold">{kanjiN5.length}</span> kartu • {batches.length} lembar A4
        </p>
        
        {/* ✅ Tombol Sejajar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
             Save as PDF / Print
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-200">
          💡 <strong>Tips PDF:</strong> Saat dialog print muncul, pilih Destination: <em>"Save as PDF"</em>. Pastikan Margin diset <em>"None"</em> atau <em>"Minimum"</em> agar presisi.
        </div>
      </div>

      {/* 📄 Print Area */}
      <div id="print-container" className="print-container flex flex-col items-center justify-center">
        {batches.map((batch, batchIdx) => {
          // 🟦 Front Rows: Urutan normal
          const frontRows = [];
          for (let r = 0; r < ROWS; r++) frontRows.push(batch.slice(r * COLS, r * COLS + COLS));

          // 🟥 Back Rows: Mirroring per baris (biar presisi saat duplex)
          const backRows = frontRows.map(row => [...row].reverse());

          return (
            <div key={batchIdx} className="print-sheet">
              {/*  FRONT SIDE */}
              <section className="print-page front-page">
                <div className="card-grid">
                  {frontRows.map((row) =>
                    row.map((card) => (
                      <div key={`f-${card.id}`} className="card front-card">
                        <div className="front-kanji">{card.kanji}</div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* 🔲 BACK SIDE */}
              <section className={`print-page back-page ${batchIdx === batches.length - 1 ? 'last-back-page' : ''}`}>
                <div className="card-grid">
                  {backRows.map((row) =>
                    row.map((card) => (
                      <div key={`b-${card.id}`} className="card back-card">
                        <div className="back-furigana">{card.reading}</div>
                        <div className="back-kanji">{card.kanji}</div>
                        <div className="back-meaning">{card.meaning}</div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          );
        })}
      </div>

      {/* 🎨 Print-Optimized CSS */}
      <style>{`
        @page {
            size: A4 portrait;
            margin: 0; /* Kita atur margin lewat padding container agar lebih kontrol */
        }
        
        /* Reset dasar untuk print */
        @media print {
            body { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            }
            .print\:hidden { display: none !important; }

            /* Hapus margin dan shadow saat print */
            .print-sheet {
                margin-bottom: 0 !important;
                box-shadow: none !important;
            }

            /* Terapkan page break setelah setiap halaman belakang, kecuali yang terakhir */
            .print-page.back-page:not(.last-back-page) {
                page-break-after: always;
                break-after: page;
            }

            /* Pastikan halaman belakang terakhir tidak memicu page break */
            .print-page.last-back-page {
                page-break-after: auto;
                break-after: auto;
            }
        }

        /* Biar di mobile gak kepotong (Scale down jika layar sempit) */
        @media screen and (max-width: 210mm) {
            #print-container {
                padding: 10px;
                transform: scale(0.45); /* Sesuaikan scale ini biar pas di layar HP */
                transform-origin: top center;
            }
            
            /* Mencegah whitespace raksasa akibat scaling */
            .min-h-screen {
                overflow-x: hidden;
            }
        }

        /* 📱 TAMPILAN LAYAR (Mobile Friendly) */
        .print-sheet {
            width: 210mm;
            margin-left: auto;  /* Tambahkan ini */
            margin-right: auto; /* Tambahkan ini */
            margin-bottom: 40px;
            background: white;
            /* Mencegah halaman kosong di akhir */
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .print-sheet:last-child {
            margin-bottom: 0; /* Hapus margin bawah untuk sheet terakhir di layar */
        }

        .print-page {
            width: 210mm;
            min-height: 297mm; /* Tinggi presisi A4 */
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden; /* Mencegah overflow pemicu halaman kosong */
            box-sizing: border-box;
            position: relative;
            margin: 0 auto;
        }

        .card-grid {
            display: grid;
            /* Di layar mobile, kita biarin dia fleksibel atau scale down */
            grid-template-columns: repeat(${COLS}, 7cm);
            gap: 15px; /* Gap lebih kecil di layar */
            justify-content: center;
            align-content: center;
            padding: 10px;
        }

        .card {
            width: 7cm;
            height: 4cm;
            border: 1.5pt solid #000; /* Gunakan pt untuk print agar lebih tajam */
            border-radius: 12px; 
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #fff;
            box-sizing: border-box;
            padding: 2mm;
        }

        /* Styling konten agar tidak meluap */
        .front-kanji {
            font-size: 2.2cm; /* Sedikit dikecilkan agar tidak menabrak border */
            font-weight: 700;
            line-height: 1;
            color: #000;
        }

        .back-furigana {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 2mm;
        }

        .back-kanji {
            font-size: 2.5rem;
            font-weight: 600;
            line-height: 1;
            margin-bottom: 2mm;
        }

        /* Update bagian ini supaya warna hitamnya solid */
        .front-kanji, 
        .back-furigana, 
        .back-kanji, 
        .back-meaning {
        color: #000 !important; /* Paksa hitam pekat */
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        }        

        .back-meaning {
            font-size: 1.1rem;
            font-weight: 600;
            text-transform: capitalize;
        }
        `}</style>
    </div>
  );
}