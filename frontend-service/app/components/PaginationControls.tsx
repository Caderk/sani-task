// app/components/PaginationControls.tsx

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
}: PaginationControlsProps) {
  return (
    <div className="d-flex align-items-center mt-3">
      <button
        className="btn btn-primary btn-sm me-2"
        disabled={page <= 1}
        onClick={onPrev}
      >
        Prev
      </button>
      <span>
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </span>
      <button
        className="btn btn-primary btn-sm ms-2"
        disabled={page >= totalPages}
        onClick={onNext}
      >
        Next
      </button>
    </div>
  );
}
