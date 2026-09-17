import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { CredentialResponse } from '../types/credential';
import { QRCodeDisplay } from '../components/credentials/QRCodeDisplay';
import { Loader2, ShieldCheck, Printer, ArrowLeft } from 'lucide-react';

export default function DigitalCertificate() {
  const { id } = useParams();
  const [cred, setCred] = useState<CredentialResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      api.getCredential(id)
        .then(setCred)
        .catch(() => setError('Failed to load credential details. It may not exist.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500 w-12 h-12" /></div>;
  if (error) return <div className="text-center text-red-500 mt-12">{error}</div>;
  if (!cred || !cred.credential_data) return <div className="text-center text-red-500 mt-12">Credential data is incomplete.</div>;

  const data = cred.credential_data;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Controls - Hidden when printing */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Link to={`/credential/${cred.credential_id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Details
        </Link>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Certificate Container */}
      <div className="bg-white p-12 sm:p-16 rounded-xl shadow-2xl border border-slate-200 relative overflow-hidden print:shadow-none print:border-none print:p-0">
        
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-4 bg-slate-900"></div>
        <div className="absolute top-4 left-0 w-full h-1 bg-blue-600"></div>
        
        {/* Watermark / Logo Area */}
        <div className="absolute opacity-5 pointer-events-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <ShieldCheck className="w-96 h-96 text-slate-900" />
        </div>

        {/* Certificate Content */}
        <div className="relative z-10 text-center">
          
          <div className="mb-12">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="w-16 h-16 text-slate-900" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight uppercase">
              {data.institution_name}
            </h1>
            <p className="text-sm font-semibold tracking-[0.3em] text-slate-500 mt-4 uppercase">
              SATYAM — Silent Guardian of Every Exam
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-serif text-slate-700 uppercase tracking-widest mb-8">
              Certificate of Achievement
            </h2>
            <p className="text-slate-500 italic mb-4 text-lg">This certifies that</p>
            <p className="text-3xl font-bold text-slate-900 border-b border-slate-300 inline-block px-12 pb-2 mb-8">
              {data.student_reference}
            </p>
            <p className="text-slate-500 italic mb-4 text-lg">has successfully completed</p>
            <p className="text-2xl font-bold text-slate-800 mb-2">
              {data.examination_id}
            </p>
            <p className="text-lg text-slate-600">
              {data.credential_type}
            </p>
          </div>

          {/* Details & Signatures Grid */}
          <div className="grid grid-cols-3 gap-8 items-end mt-16 text-left">
            
            {/* Meta Data */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Date</p>
                <p className="text-sm font-semibold text-slate-800">{new Date(data.issue_date).toLocaleDateString()}</p>
              </div>
              {data.grade && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Grade</p>
                  <p className="text-lg font-bold text-blue-700">{data.grade}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Credential ID</p>
                <p className="text-xs font-mono text-slate-600">{cred.credential_id}</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-end">
              <QRCodeDisplay credentialId={cred.credential_id} size={100} />
              <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">Scan to Verify</p>
            </div>

            {/* Integrity Stamp */}
            <div className="text-right">
              <div className="inline-block border-2 border-emerald-600 text-emerald-700 px-4 py-2 rounded-lg transform -rotate-2">
                <p className="text-sm font-black uppercase tracking-widest">Blockchain</p>
                <p className="text-xs font-bold uppercase">Secured</p>
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Integrity Hash</p>
                <p className="text-[8px] font-mono text-slate-500 break-all leading-tight mt-1 max-w-[200px] ml-auto">
                  {cred.document_hash}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
      
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; margin: 0; padding: 0; }
          main { margin: 0; padding: 0; max-width: none; }
          .min-h-screen { min-height: auto; }
          nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
