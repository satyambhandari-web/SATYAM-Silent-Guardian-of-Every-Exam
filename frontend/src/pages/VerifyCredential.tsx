import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import type { CredentialData, CredentialVerificationResponse } from '../types/credential';
import { CheckCircle, XCircle, AlertTriangle, Search, ShieldAlert, Loader2, Upload, QrCode } from 'lucide-react';
import jsQR from 'jsqr';

export default function VerifyCredential() {
  const [activeTab, setActiveTab] = useState<'qr' | 'manual'>('qr');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Processing...');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CredentialVerificationResponse | null>(null);
  const [credId, setCredId] = useState('');
  
  const [formData, setFormData] = useState<CredentialData>({
    student_reference: '',
    examination_id: '',
    credential_type: '',
    institution_name: '',
    grade: '',
    issue_date: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyManual = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyWithData(credId, formData);
  };

  const verifyWithData = async (id: string, data: CredentialData) => {
    setLoading(true);
    setLoadingText('Verifying integrity...');
    setError(null);
    setResult(null);
    try {
      const res = await api.verifyCredential({
        credential_id: id,
        credential_data: data,
      });
      setResult(res);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setResult({
          credential_id: id,
          result: 'NOT_FOUND',
          hash_match: false,
          blockchain_verified: false,
          revoked: false
        });
      } else {
        setError(err.response?.data?.detail || 'Verification failed. Cannot reach server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setLoadingText('Reading QR...');
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Failed to initialize canvas');
          setLoading(false);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          try {
            const parsed = JSON.parse(code.data);
            if (parsed.credential_id) {
              setCredId(parsed.credential_id);
              try {
                setLoadingText('Fetching credential...');
                // Fetch the full data from backend to verify
                const credRes = await api.getCredential(parsed.credential_id);
                if (credRes.credential_data) {
                  setFormData(credRes.credential_data);
                  // Automatically verify it
                  await verifyWithData(parsed.credential_id, credRes.credential_data);
                } else {
                  setError('Credential found, but missing payload data for verification.');
                  setLoading(false);
                }
              } catch (fetchErr: any) {
                if (fetchErr.response?.status === 404) {
                  setResult({
                    credential_id: parsed.credential_id,
                    result: 'NOT_FOUND',
                    hash_match: false,
                    blockchain_verified: false,
                    revoked: false
                  });
                  setLoading(false);
                } else {
                  setError('Failed to fetch credential details.');
                  setLoading(false);
                }
              }
            } else {
              setError('Invalid QR code. No valid SATYAM credential reference was found.');
              setLoading(false);
            }
          } catch (err) {
            setError('Invalid QR code format. Expected JSON payload.');
            setLoading(false);
          }
        } else {
          setError('No QR code found in the image.');
          setLoading(false);
        }
      };
      img.onerror = () => {
        setError('Failed to load image.');
        setLoading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        
        <div className="flex border-b border-slate-200 mb-6">
          <button 
            className={`pb-2 px-4 font-semibold text-sm transition-colors ${activeTab === 'qr' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('qr')}
          >
            <span className="flex items-center gap-2"><QrCode className="w-4 h-4" /> Scan QR</span>
          </button>
          <button 
            className={`pb-2 px-4 font-semibold text-sm transition-colors ${activeTab === 'manual' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('manual')}
          >
            Manual Entry
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm border border-red-200 rounded">{error}</div>}

        {activeTab === 'qr' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-12 text-center w-full max-w-sm">
              <QrCode className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Upload QR Code</h3>
              <p className="text-sm text-slate-500 mb-6">Upload a picture of the Digital Certificate QR code to verify its authenticity automatically.</p>
              
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors mx-auto disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Upload className="w-5 h-5" />}
                {loading ? loadingText : 'Select Image'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'manual' && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Verification Payload</h2>
            <p className="text-sm text-slate-500 mb-6">Enter the credential data below. To demonstrate tampering, modify any field and verify again.</p>
            
            <form onSubmit={handleVerifyManual} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Credential ID</label>
                <input required type="text" value={credId} onChange={e => setCredId(e.target.value)} placeholder="CERT-..." className="w-full p-2 border border-slate-300 rounded outline-none font-mono text-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Student Ref</label>
                  <input type="text" name="student_reference" value={formData.student_reference} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Exam ID</label>
                  <input type="text" name="examination_id" value={formData.examination_id} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded outline-none text-sm" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Institution</label>
                  <input type="text" name="institution_name" value={formData.institution_name} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Type</label>
                  <input type="text" name="credential_type" value={formData.credential_type} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded outline-none text-sm" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Grade</label>
                  <input type="text" name="grade" value={formData.grade} onChange={handleChange} className="w-full p-2 border-amber-300 bg-amber-50 rounded outline-none text-sm transition-colors" title="Try changing this to simulate tampering!" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Issue Date</label>
                  <input type="text" name="issue_date" value={formData.issue_date} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded outline-none text-sm" />
                </div>
              </div>
              
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white p-3 rounded font-bold transition-colors mt-4 disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin" /> : <Search className="w-5 h-5" />}
                Verify Integrity
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="bg-slate-900 rounded-xl shadow-lg p-6 text-white flex flex-col justify-center min-h-[400px]">
        {!result && !loading && (
          <div className="text-center text-slate-400">
            <ShieldAlert className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Awaiting Verification</p>
            <p className="text-sm mt-2 max-w-xs mx-auto">Calculates SHA-256 hash of provided data and compares it with the blockchain registry.</p>
          </div>
        )}
        
        {loading && (
          <div className="text-center text-slate-400">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
            <p>{loadingText}</p>
          </div>
        )}

        {result && (
          <div className="animate-in fade-in zoom-in duration-300">
            {result.result === 'VALID' && (
              <div className="text-center">
                <CheckCircle className="h-20 w-20 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-emerald-400 mb-2">VALID</h2>
                <p className="text-emerald-200 text-lg mb-6 font-semibold">CREDENTIAL VERIFIED</p>
                <div className="bg-slate-800 p-4 rounded text-left space-y-2 text-sm border border-emerald-900">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> Credential Found
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> SHA-256 Hash Matched
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> Blockchain Verification Passed
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> Credential Not Revoked
                  </div>
                </div>
              </div>
            )}
            
            {result.result === 'TAMPERED' && (
              <div className="text-center">
                <AlertTriangle className="h-20 w-20 text-red-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-red-500 mb-2">TAMPERED</h2>
                <p className="text-red-300 text-lg mb-6 font-semibold">INTEGRITY VIOLATION DETECTED</p>
                <div className="bg-red-950 p-4 rounded text-left space-y-4 text-sm border border-red-900 text-red-200">
                  <p className="text-red-300 font-medium">
                    SATYAM hashes the submitted credential data and compares it with the cryptographically registered credential hash. The hashes differ, meaning the data has been modified.
                  </p>
                  <div className="space-y-2 pt-2 border-t border-red-900/50">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-4 h-4" /> Credential Record Found
                    </div>
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="w-4 h-4" /> SHA-256 Hash Mismatch
                    </div>
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="w-4 h-4" /> Submitted Data Does Not Match Registered Record
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result.result === 'REVOKED' && (
              <div className="text-center">
                <XCircle className="h-20 w-20 text-amber-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-amber-500 mb-2">REVOKED</h2>
                <p className="text-amber-200 text-lg mb-6 font-semibold">CREDENTIAL REVOKED</p>
                <div className="bg-amber-950 p-4 rounded text-left space-y-2 text-sm border border-amber-900 text-amber-200">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> Credential Found
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> Credential Record Matched
                  </div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <XCircle className="w-4 h-4" /> Credential Has Been Revoked
                  </div>
                </div>
              </div>
            )}

            {result.result === 'NOT_FOUND' && (
              <div className="text-center">
                <Search className="h-20 w-20 text-slate-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-slate-400 mb-2">NOT FOUND</h2>
                <p className="text-slate-300 text-lg mb-6 font-semibold">CREDENTIAL NOT FOUND</p>
                <p className="text-sm text-slate-400">No matching credential record was found in the system.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
