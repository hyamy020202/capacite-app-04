import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [nomStructure, setNomStructure] = useState('');
  const [numEnregistrement, setNumEnregistrement] = useState('');

  useEffect(() => {
    const nom = localStorage.getItem('nomStructure') || '';
    const num = localStorage.getItem('numEnregistrement') || '';
    setNomStructure(nom);
    setNumEnregistrement(num);
  }, []);

  const handleNomChange = (e) => {
    setNomStructure(e.target.value);
    localStorage.setItem('nomStructure', e.target.value);
  };

  const handleNumChange = (e) => {
    setNumEnregistrement(e.target.value);
    localStorage.setItem('numEnregistrement', e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl w-full text-center">
        {/* شعار بمقاس 360x60 */}
        <Image
          src="/logo.png"
          alt="Logo Ministère"
          width={360}
          height={60}
          className="mx-auto mb-4"
          style={{ width: 360, height: 60, objectFit: 'contain' }}
        />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Diagnostic de la Capacité d&apos;Accueil
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la structure
            </label>
            <input
              type="text"
              value={nomStructure}
              onChange={handleNomChange}
              className="w-full border p-2 rounded-md"
              placeholder="Centre de Formation XYZ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° d&apos;enregistrement
            </label>
            <input
              type="text"
              value={numEnregistrement}
              onChange={handleNumChange}
              className="w-full border p-2 rounded-md"
              placeholder="12345/2025"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-6 mb-6">
          <button
            onClick={() => router.push('/tda')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow"
          >
            Diagnostic de de l&apos;état actuel
          </button>
          <button
            onClick={() => router.push('/tdp')}
            className="bg-[#FFA500] hover:bg-[#e69500] text-white font-semibold py-3 px-6 rounded-xl shadow"
          >
            Diagnostic de de l&apos;état prévu
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Version : <strong>V1.0</strong>
        </p>
      </div>
    </div>
  );
}