
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  credentialId: string;
  size?: number;
}

export function QRCodeDisplay({ credentialId, size = 128 }: QRCodeDisplayProps) {
  // We encode a simple JSON object containing just the credential reference
  const payload = JSON.stringify({ credential_id: credentialId });

  return (
    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm inline-block">
      <QRCodeSVG 
        value={payload} 
        size={size} 
        level="H"
        includeMargin={false}
        className="w-full h-full"
      />
    </div>
  );
}
