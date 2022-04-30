import { Link } from 'react-router-dom';
import './sidebar.scss';

function Sidebar () {
  return (
    <nav className="sidebar">
      <Link to="/">
        Homepage
      </Link>
      <span>Protocols:</span>
      <br />
      <Link to="/prism">
        <span>Prism Protocol</span>
      </Link>
      <Link to="/spectrum">
        <span>Spectrum Protocol</span>
      </Link>
    </nav>
  );
};

export default Sidebar;
