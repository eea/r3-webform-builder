import './Button.css';
import { FaKey } from 'react-icons/fa';

interface NavbarProps {
  onConnectionClick: () => void;
}

export default function Navbar({
  onConnectionClick
}: NavbarProps) {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6',
      width: '100%',
      boxSizing: 'border-box',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height: '60px'
    }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
        R3 WebFormBuilder
      </h1>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          className="getSchemaButton"
          onClick={onConnectionClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaKey /> Connection
        </button>
      </div>
    </nav>
  );
}