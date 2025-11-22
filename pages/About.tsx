import React, { useEffect, useState } from 'react';
import { mockDb } from '../services/mockSupabase';
import { AboutContent } from '../types';

const About: React.FC = () => {
  const [content, setContent] = useState<AboutContent[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await mockDb.about.getAll();
      setContent(data.sort((a, b) => a.order - b.order));
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">About Us</h1>
          <p className="text-xl text-blue-100">Building a better future through youth empowerment and collaboration.</p>
        </div>
      </div>

      {/* Dynamic Content Sections */}
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        {content.map((section) => (
          <div key={section.id} className="flex flex-col md:flex-row gap-8 items-start">
            <div className="md:w-1/4">
              <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-500 pl-4">{section.sectionTitle}</h2>
            </div>
            <div className="md:w-3/4">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
