interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  stationName: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, stationName }: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="p-4 bg-white">
          <h3 className="text-lg font-semibold mb-2">{stationName}</h3>
          <img
            src={imageUrl}
            alt={stationName}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </div>
      </div>
    </div>
  );
} 