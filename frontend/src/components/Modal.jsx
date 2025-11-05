export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="bg-white rounded-xl p-6 z-10 max-w-lg w-full shadow-lg">
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        <div className="text-sm text-gray-700">{children}</div>
        <div className="mt-4 text-right">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
