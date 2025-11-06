import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Breadcrumbs navigation component
 * @param {Object} props
 * @param {Array} props.items - Array of breadcrumb items with label and path
 */
export default function Breadcrumbs({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
      {/* Home icon */}
      <Link 
        to="/" 
        className="hover:text-blue-600 transition"
        aria-label="Inicio"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {index === items.length - 1 ? (
            <span className="font-medium text-gray-900" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link 
              to={item.path} 
              className="hover:text-blue-600 transition"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
    })
  ).isRequired,
};
