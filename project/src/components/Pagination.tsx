import React from 'react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  perPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
};

const defaultPerPageOptions = [10, 20, 50, 100];

export default function Pagination({
  currentPage,
  totalPages,
  perPage,
  totalItems,
  onPageChange,
  onPerPageChange,
  perPageOptions = defaultPerPageOptions,
}: PaginationProps) {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    onPerPageChange && onPerPageChange(value);
  };

  // Génère une petite pagination (1 .. n) compacte
  const getPages = () => {
    const pages: (number | string)[] = [];
    const maxButtons = 7; // taille compacte
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const left = Math.max(1, currentPage - 2);
    const right = Math.min(totalPages, currentPage + 2);
    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push('…');
    }
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < totalPages) {
      if (right < totalPages - 1) pages.push('…');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
      <div className="text-sm text-gray-600">
        Affichage {(totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1)}–{Math.min(currentPage * perPage, totalItems)} sur {totalItems}
      </div>

      <div className="flex items-center gap-3">
        {onPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Par page</span>
            <select
              value={perPage}
              onChange={handlePerPageChange}
              className="border rounded px-2 py-1 text-sm"
            >
              {perPageOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            className={`px-3 py-1 border rounded text-sm ${canPrev ? 'bg-white hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!canPrev}
            onClick={() => canPrev && onPageChange(currentPage - 1)}
          >
            Précédent
          </button>

          {getPages().map((p, idx) => (
            typeof p === 'number' ? (
              <button
                key={idx}
                className={`px-3 py-1 border rounded text-sm ${p === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-2 text-gray-500">{p}</span>
            )
          ))}

          <button
            className={`px-3 py-1 border rounded text-sm ${canNext ? 'bg-white hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!canNext}
            onClick={() => canNext && onPageChange(currentPage + 1)}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}


