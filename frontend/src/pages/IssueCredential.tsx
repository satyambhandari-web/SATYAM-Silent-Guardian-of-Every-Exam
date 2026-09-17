import React, { useState } from 'react';
import { api } from '../services/api';
import type { CredentialData, CredentialResponse } from '../types/credential';
import { CheckCircle, Copy, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function IssueCredential() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CredentialResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Bulk Issue State
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<any | null>(null);
  
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };
  
  const [formData, setFormData] = useState<CredentialData>({
    student_reference: 'STUDENT-' + Math.floor(Math.random() * 10000),
    examination_id: 'EXAM-2026',
    credential_type: 'Degree Certificate',
    institution_name: 'Demo University',
    grade: 'A',
    issue_date: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const credId = `CERT-${Date.now()}`;
      const res = await api.createCredential({
        credential_id: credId,
        credential_data: formData,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to issue credential.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) {
      setBulkError('Please select a CSV file first.');
      return;
    }
    setBulkLoading(true);
    setBulkError(null);
    setBulkResult(null);
    try {
      const res = await api.bulkIssueCredentials(bulkFile);
      setBulkResult(res);
      setBulkFile(null); // Clear file input
    } catch (err: any) {
      setBulkError(err.response?.data?.detail || 'Failed to process bulk upload.');
    } finally {
      setBulkLoading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col items-center text-center mb-8">
          <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">Credential Issued Successfully</h2>
          <p className="text-slate-500">The integrity hash has been permanently registered on the blockchain.</p>
        </div>
        
        <div className="space-y-4 text-left">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group">
            <span className="text-xs font-semibold text-slate-500 uppercase">Credential ID</span>
            <p className="font-mono text-slate-900 break-all pr-8 mt-1">{result.credential_id}</p>
            <button 
              onClick={() => handleCopy(result.credential_id, 'id')}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              title="Copy ID"
            >
              {copiedField === 'id' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group">
            <span className="text-xs font-semibold text-slate-500 uppercase">Document Hash (SHA-256)</span>
            <p className="font-mono text-sm text-slate-900 break-all pr-8 mt-1">{result.document_hash}</p>
            <button 
              onClick={() => handleCopy(result.document_hash, 'hash')}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              title="Copy Hash"
            >
              {copiedField === 'hash' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 relative group">
            <span className="text-xs font-semibold text-blue-700 uppercase flex items-center gap-1">
              Blockchain Transaction <FileText className="h-3 w-3"/>
            </span>
            <p className="font-mono text-sm text-blue-900 break-all pr-8 mt-1">{result.blockchain_tx_hash}</p>
            <button 
              onClick={() => handleCopy(result.blockchain_tx_hash || '', 'tx')}
              className="absolute top-4 right-4 text-blue-500 hover:text-blue-700 transition-colors"
              title="Copy TX Hash"
            >
              {copiedField === 'tx' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <button onClick={() => setResult(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium transition-colors">Issue Another</button>
          <Link to={`/certificate/${result.credential_id}`} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium transition-colors">View Digital Certificate</Link>
          <Link to={`/credential/${result.credential_id}`} className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-medium transition-colors">Internal Details</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Issue New Credential</h2>
      
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Student Reference</label>
            <input required type="text" name="student_reference" value={formData.student_reference} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Examination ID</label>
            <input required type="text" name="examination_id" value={formData.examination_id} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Institution Name</label>
            <input required type="text" name="institution_name" value={formData.institution_name} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Credential Type</label>
            <input required type="text" name="credential_type" value={formData.credential_type} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Grade</label>
            <input type="text" name="grade" value={formData.grade} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
            <input required type="date" name="issue_date" value={formData.issue_date} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-lg font-bold transition-colors disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" /> : null}
          {loading ? 'Registering on Blockchain...' : 'Issue Credential'}
        </button>
      </form>
      
      {/* Bulk Issue Section */}
      <div className="mt-12 pt-10 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Bulk Issue Credentials</h2>
        <p className="text-slate-500 mb-6 text-sm">Upload a CSV file containing multiple student records to issue credentials in bulk.</p>
        
        {bulkError && <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{bulkError}</div>}
        
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
            <input 
              type="file" 
              accept=".csv"
              onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
              className="mx-auto block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 transition-colors"
            />
          </div>
          <button 
            type="submit" 
            disabled={bulkLoading || !bulkFile}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition-colors disabled:opacity-70"
          >
            {bulkLoading ? <Loader2 className="animate-spin" /> : null}
            {bulkLoading ? 'Processing Bulk Upload...' : 'Upload & Issue Bulk CSV'}
          </button>
        </form>

        {bulkResult && (
          <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Bulk Process Summary</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                <span className="block text-2xl font-bold text-slate-900">{bulkResult.total_processed}</span>
                <span className="text-xs uppercase font-semibold text-slate-500">Processed</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-emerald-200 text-center">
                <span className="block text-2xl font-bold text-emerald-600">{bulkResult.successful?.length || 0}</span>
                <span className="text-xs uppercase font-semibold text-emerald-600">Successful</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-200 text-center">
                <span className="block text-2xl font-bold text-red-600">{bulkResult.failed?.length || 0}</span>
                <span className="text-xs uppercase font-semibold text-red-600">Failed</span>
              </div>
            </div>
            
            {bulkResult.successful?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-emerald-700 mb-2">Successfully Issued</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {bulkResult.successful.map((item: any, idx: number) => (
                    <div key={idx} className="text-xs flex items-center gap-2 bg-white p-2 rounded border border-emerald-100">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="font-mono">{item.credential_id}</span>
                      <span className="text-slate-500">({item.student_reference})</span>
                      <Link to={`/certificate/${item.credential_id}`} className="ml-auto text-blue-600 hover:underline">View</Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {bulkResult.failed?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-red-700 mb-2">Failed Records</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {bulkResult.failed.map((item: any, idx: number) => (
                    <div key={idx} className="text-xs flex gap-2 bg-white p-2 rounded border border-red-100 text-red-600">
                      <span className="font-bold">Row {item.row}:</span>
                      <span>{item.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
