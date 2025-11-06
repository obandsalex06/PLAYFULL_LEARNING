import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useState } from "react";

export default function UIShowcase() {
  const [count, setCount] = useState(0);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold text-gray-800">UI Showcase</h1>
        <p className="mt-2 text-gray-600">Pequeña página para visualizar componentes reutilizables y estilos.</p>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <Card title="Card simple" icon={<span>🎯</span>}>
            Esta es una tarjeta de ejemplo. Puedes usar el componente <code>Card</code> para mostrar información.
          </Card>
          <Card title="Card con llamada" icon={<span>📣</span>}>
            Incluye un botón de acción dentro de la tarjeta para demostración.
            <div className="mt-4">
              <Button onClick={() => alert('Acción desde Card')}>
                Acción
              </Button>
            </div>
          </Card>
          <Card title="Contador" icon={<span>🔢</span>}>
            <div className="flex items-center gap-3">
              <Button onClick={() => setCount((c) => c - 1)} variant="outline">-</Button>
              <div className="px-4 py-2 bg-gray-100 rounded-md">{count}</div>
              <Button onClick={() => setCount((c) => c + 1)}>+</Button>
            </div>
          </Card>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Colores y tipografía</h2>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow">Primary color: <span className="text-blue-700 font-bold">#1D4ED8 → #3B82F6</span></div>
            <div className="p-4 bg-white rounded-lg shadow">Accent color: <span className="text-teal-500 font-bold">#14B8A6</span></div>
            <div className="p-4 bg-white rounded-lg shadow">Neutral: <span className="text-gray-600 font-bold">#4B5563</span></div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Botones</h2>
          <div className="mt-4 flex gap-4">
            <Button onClick={() => alert('Primary clicked')}>Primary</Button>
            <Button variant="outline" onClick={() => alert('Outline clicked')}>Outline</Button>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
