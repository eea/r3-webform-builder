import { FaKey } from 'react-icons/fa';

interface NavbarProps {
  onConnectionClick: () => void;
}

export default function Navbar({
  onConnectionClick
}: NavbarProps) {
  return (
    <nav className="flex justify-between items-center px-8 py-4 w-full box-border fixed top-0 left-0 right-0 z-[1000]" style={{ backgroundColor: '#dee2e6', borderBottom: '1px solid #dee2e6', height: '60px' }}>
      <h1 className="m-0 text-xl" style={{ fontSize: '2.5rem', color: '#333' }}>
        R3 webform Builder
      </h1>

      <div className="flex items-center">
        <button
          className="flex items-center gap-2 px-4 py-2 text-white border-none rounded cursor-pointer text-sm font-semibold transition-colors"
          style={{ backgroundColor: '#47B3FF' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0083E0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#47B3FF'}
          onClick={onConnectionClick}
        >
          <FaKey /> Connection
        </button>
      </div>
    </nav>
  );
}
