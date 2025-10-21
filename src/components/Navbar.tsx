import './Navbar.css';
import { FaKey } from 'react-icons/fa';

interface NavbarProps {
  onConnectionClick: () => void;
}

export default function Navbar({
  onConnectionClick
}: NavbarProps) {
  return (
    <nav className="navbar">
      <h1 className="navbar-title">
        R3 WebFormBuilder
      </h1>

      <div className="navbar-actions">
        <button
          className="getSchemaButton navbar-connection-button"
          onClick={onConnectionClick}
        >
          <FaKey /> Connection
        </button>
      </div>
    </nav>
  );
}