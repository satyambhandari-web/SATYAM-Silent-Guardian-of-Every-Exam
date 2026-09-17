import { useEffect, useState } from 'react';
import { Shield, Server, Link as LinkIcon, Database, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Dashboard() {
  const [apiStatus, setApiStatus] = useState<'Checking...' | 'Connected' | 'Offline'>('Checking...');

  useEffect(() => {
    api.getHealth()
      .then(() => setApiStatus('Connected'))
      .catch(() => setApiStatus('Offline'));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">SATYAM<br/><span className="text-blue-400 text-2xl font-semibold">Silent Guardian of Every Exam</span></h1>
          <p className="text-slate-300 max-w-xl text-lg">
            Tamper-evident examination credentials with blockchain-backed verification.
          </p>
        </div>
        <Shield className="absolute -right-10 -bottom-10 h-64 w-64 text-slate-800 opacity-50" />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/issue" className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Issue Credential</h2>
              <p className="text-slate-500">Generate a new cryptographically secure credential and register it on the blockchain.</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
        </Link>
        <Link to="/verify" className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Verify Credential</h2>
              <p className="text-slate-500">Check credential integrity against the blockchain to detect tampering or revocation.</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
        </Link>
      </div>

      {/* System Status */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">SYSTEM STATUS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-4">
            <Server className={`h-8 w-8 ${apiStatus === 'Connected' ? 'text-emerald-500' : 'text-slate-400'}`} />
            <div>
              <p className="text-sm font-semibold text-slate-500">API Service</p>
              <p className="text-lg font-bold text-slate-900">{apiStatus}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-4">
            <LinkIcon className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-slate-500">Blockchain</p>
              <p className="text-lg font-bold text-slate-900">Connected</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-4">
            <Database className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-slate-500">Database</p>
              <p className="text-lg font-bold text-slate-900">Connected</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Explanation */}
      <div className="mt-8 bg-slate-50 border border-slate-200 p-6 rounded-xl text-center shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6 tracking-wide">HOW SATYAM PROTECTS CREDENTIALS</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-xs md:text-sm font-medium text-slate-700">
          <span className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto">Credential Data</span>
          <ArrowRight className="h-4 w-4 hidden md:block text-slate-400" />
          <span className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto">Canonical JSON</span>
          <ArrowRight className="h-4 w-4 hidden md:block text-slate-400" />
          <span className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto">SHA-256 Hash</span>
          <ArrowRight className="h-4 w-4 hidden md:block text-slate-400" />
          <span className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto text-blue-600 font-bold">Blockchain Registry</span>
          <ArrowRight className="h-4 w-4 hidden md:block text-slate-400" />
          <span className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto">Digital Certificate + QR</span>
          <ArrowRight className="h-4 w-4 hidden md:block text-slate-400" />
          <span className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-sm w-full md:w-auto">Verification</span>
        </div>
      </div>
    </div>
  );
}
