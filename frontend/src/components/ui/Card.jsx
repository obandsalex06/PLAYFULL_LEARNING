export default function Card({ title, children, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
      <div className="flex items-center gap-3">
        {icon && <div className="text-2xl">{icon}</div>}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="mt-3 text-gray-600">{children}</div>
    </div>
  );
}
