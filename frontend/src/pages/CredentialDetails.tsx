import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { CredentialResponse } from '../types/credential';
import { Loader2, XCircle, ArrowLeft, Copy, CheckCircle } from 'lucide-react';

export default function CredentialDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cred, setCred] = useState<CredentialResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    if (id) {
      api.getCredential(id)
        .then(setCred)
        .catch(() => setError('Failed to load credential details. It may not exist.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleRevoke = async () => {
    if (!window.confirm("Are you sure you want to permanently revoke this credential on the blockchain?")) return;
    setRevoking(true);
    try {
      await api.revokeCredential(id!, "Issuer triggered revocation demo");
      const updated = await api.getCredential(id!);
      setCred(updated);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Revocation failed");
    } finally {
      setRevoking(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500 w-12 h-12" /></div>;
  if (error) return <div className="text-center text-red-500 mt-12">{error}</div>;
  if (!cred) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Credential Metadata</h2>
            <p className="text-slate-500">Internal system view</p>
          </div>
          <div className={`px-3 py-1 rounded font-bold text-sm ${cred.status === 'VALID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {cred.status}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-4 border-b border-slate-100 pb-2 items-center group">
            <span className="text-slate-500 text-sm font-semibold">ID</span>
            <span className="col-span-2 font-mono text-slate-900 break-all">{cred.credential_id}</span>
            <div className="text-right">
              <button onClick={() => handleCopy(cred.credential_id, 'id')} className="text-slate-400 hover:text-slate-600 transition-colors">
                {copiedField === 'id' ? <CheckCircle className="h-4 w-4 text-emerald-500 inline" /> : <Copy className="h-4 w-4 inline" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 border-b border-slate-100 pb-2 items-center">
            <span className="text-slate-500 text-sm font-semibold">Issued At</span>
            <span className="col-span-3 text-slate-900">{new Date(cred.issued_at).toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-4 border-b border-slate-100 pb-2 items-center group">
            <span className="text-slate-500 text-sm font-semibold">Document Hash</span>
            <span className="col-span-2 font-mono text-xs text-slate-900 break-all">{cred.document_hash}</span>
            <div className="text-right">
              <button onClick={() => handleCopy(cred.document_hash, 'hash')} className="text-slate-400 hover:text-slate-600 transition-colors">
                {copiedField === 'hash' ? <CheckCircle className="h-4 w-4 text-emerald-500 inline" /> : <Copy className="h-4 w-4 inline" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 pb-2 items-center group">
            <span className="text-slate-500 text-sm font-semibold">TX Hash</span>
            <span className="col-span-2 font-mono text-xs text-blue-600 break-all">{cred.blockchain_tx_hash}</span>
            <div className="text-right">
              <button onClick={() => handleCopy(cred.blockchain_tx_hash || '', 'tx')} className="text-slate-400 hover:text-slate-600 transition-colors">
                {copiedField === 'tx' ? <CheckCircle className="h-4 w-4 text-emerald-500 inline" /> : <Copy className="h-4 w-4 inline" />}
              </button>
            </div>
          </div>
        </div>

        {cred.status === 'VALID' && (
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-4">Revoking this credential writes an irreversible revocation record to the blockchain.</p>
            <button 
              onClick={handleRevoke}
              disabled={revoking}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded font-bold transition-colors disabled:opacity-50 border border-red-200"
            >
              {revoking ? <Loader2 className="animate-spin w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {revoking ? 'Revoking on Chain...' : 'Revoke Credential'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
