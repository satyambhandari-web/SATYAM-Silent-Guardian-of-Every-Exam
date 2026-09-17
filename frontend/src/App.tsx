import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import IssueCredential from './pages/IssueCredential';
import VerifyCredential from './pages/VerifyCredential';
import CredentialDetails from './pages/CredentialDetails';
import DigitalCertificate from './pages/DigitalCertificate';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/issue" element={<IssueCredential />} />
            <Route path="/verify" element={<VerifyCredential />} />
            <Route path="/credential/:id" element={<CredentialDetails />} />
            <Route path="/certificate/:id" element={<DigitalCertificate />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
