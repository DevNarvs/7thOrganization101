
import React, { useEffect, useState } from 'react';
import { mockDb } from '../services/mockSupabase';
import { Officer } from '../types';
import { User } from 'lucide-react';

const Officers: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await mockDb.officers.getAll();
      setOfficers(data.sort((a, b) => a.order - b.order));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800">Our Leadership</h1>
        <p className="mt-4 text-xl text-gray-600">Meet the dedicated individuals guiding our organization.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
         {officers.map((officer) => (
           <div key={officer.id} className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                 <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {officer.imageUrl ? (
                       <img src={officer.imageUrl} alt={officer.name} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400"><User size={64}/></div>
                    )}
                 </div>
                 <div className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 rounded-full border-4 border-white"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{officer.name}</h3>
              <p className="text-blue-600 font-medium uppercase tracking-wide text-sm mb-4">{officer.position}</p>
              <p className="text-gray-600 leading-relaxed max-w-sm">{officer.bio}</p>
           </div>
         ))}
      </div>
      
      {officers.length === 0 && (
         <div className="text-center text-gray-500 py-10">No officers listed yet.</div>
      )}
    </div>
  );
};

export default Officers;
