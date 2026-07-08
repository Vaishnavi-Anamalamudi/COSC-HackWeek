import { FiDownload, FiFileText } from 'react-icons/fi';
import { REPORT_FORMATS } from '../constants/commands.js';

function DataTable({ rows = [] }) {
  if (!rows.length) return null;
  const headers = Object.keys(rows[0]).slice(0, 5);
  return (
    <div className="overflow-x-auto rounded-lg border border-pilot-line">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-white/6 text-pilot-muted">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 font-medium capitalize">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((row, index) => (
            <tr key={index} className="border-t border-pilot-line">
              {headers.map((header) => (
                <td key={header} className="max-w-56 truncate px-3 py-2 text-pilot-text">
                  {String(row[header] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ResultPanel({ task }) {
  const result = task.result;
  const canExport = task.id && ['completed', 'failed', 'needs_user'].includes(task.status);

  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FiFileText className="text-pilot-green" />
          <h2 className="text-lg font-semibold text-pilot-text">Extracted Data</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {REPORT_FORMATS.map((format) => (
            <a
              key={format}
              href={canExport ? `/api/agent/reports/${task.id}/${format}` : undefined}
              className={`inline-flex items-center gap-2 rounded-md border border-pilot-line px-3 py-2 text-xs uppercase ${
                canExport ? 'bg-white/5 text-pilot-mint hover:border-pilot-green' : 'pointer-events-none opacity-40'
              }`}
            >
              <FiDownload />
              {format}
            </a>
          ))}
        </div>
      </div>

      {!result && (
        <p className="rounded-lg border border-dashed border-pilot-line p-4 text-sm text-pilot-muted">
          Results, screenshots, and summaries appear after execution.
        </p>
      )}

      {result && (
        <div className="space-y-4">
          <div className="rounded-lg border border-pilot-line bg-black/20 p-4">
            <p className="text-sm leading-6 text-pilot-text">{result.summary}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-pilot-line bg-white/5 p-3">
              <p className="text-xs text-pilot-muted">Execution Time</p>
              <p className="mt-1 text-xl font-semibold text-pilot-text">{result.executionTimeMs || 0}ms</p>
            </div>
            <div className="rounded-lg border border-pilot-line bg-white/5 p-3">
              <p className="text-xs text-pilot-muted">Success Rate</p>
              <p className="mt-1 text-xl font-semibold text-pilot-text">{result.successRate || 0}%</p>
            </div>
            <div className="rounded-lg border border-pilot-line bg-white/5 p-3">
              <p className="text-xs text-pilot-muted">Items Found</p>
              <p className="mt-1 text-xl font-semibold text-pilot-text">{result.items?.length || 0}</p>
            </div>
          </div>

          <DataTable rows={result.items || []} />
        </div>
      )}
    </section>
  );
}
