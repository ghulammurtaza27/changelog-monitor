import { ChangeDetails } from './ChangeDetails'

interface Change {
  id: string;
  description: string;
  type: string;
  impact: string;
  whatsNew: string;
  details: string;
  author: string;
  date: string;
  sha: string;
}

interface ChangeModalProps {
  change: Change;
  onClose: () => void;
  repoUrl: string;
}

export function ChangeModal({ change, onClose, repoUrl }: ChangeModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Change Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ChangeDetails change={change} repoUrl={repoUrl} />
      </div>
    </div>
  );
} 