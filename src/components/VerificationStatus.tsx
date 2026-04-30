// Server component — "Verified by Digital Promo Codes" section anchor.
// Static trust block: VerifiedChip + methodology blurb (placeholder, FIXME below)
// + per-code status badges. NO timestamps — the underlying tracking data is stale,
// and dated copy ("Scanned: …", "Confirmed …") would either be wrong or empty.

import VerifiedChip from '@/components/ui/VerifiedChip';

interface LedgerEntry {
  code: string;
  status: 'working' | 'expired' | 'unknown';
  beforeCents?: number;
  afterCents?: number;
  currency?: string;
  display?: string;
  notes?: string;
  checkedAt?: string;
  verifiedAt?: string;
  maskInLedger?: boolean;
}

interface FreshnessData {
  whopUrl: string;
  lastUpdated: string;
  ledger: LedgerEntry[];
}

interface VerificationStatusProps {
  freshnessData: FreshnessData;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'working': return 'Active';
    case 'expired': return 'Inactive';
    default: return 'Pending';
  }
}

function getStatusClasses(status: string): string {
  switch (status) {
    case 'working': return 'bg-green-100 text-green-700';
    case 'expired': return 'bg-red-100 text-red-700';
    default:        return 'bg-gray-100 text-gray-700';
  }
}

export default function VerificationStatus({ freshnessData }: VerificationStatusProps) {
  const ledger = freshnessData?.ledger ?? [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <VerifiedChip size="md" />
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>
          Verified by Digital Promo Codes
        </h3>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        Each code on this page is tested against the merchant before being listed.
      </p>

      {ledger.length > 0 && (
        <div className="space-y-2">
          {ledger.map((row, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border flex items-center justify-between gap-3"
              style={{
                backgroundColor: 'var(--background-color)',
                borderColor: 'var(--border-color)',
              }}
            >
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusClasses(row.status)}`}>
                {getStatusLabel(row.status)}
              </span>
              {row.display && (
                <span className="text-sm font-medium" style={{ color: 'var(--accent-color)' }}>
                  {row.display}
                </span>
              )}
              {row.notes && (
                <span
                  className="hidden md:inline text-xs flex-1 truncate"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {row.notes}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
