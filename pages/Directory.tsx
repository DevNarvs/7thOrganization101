import React, { useEffect, useState } from "react";
// import { mockDb } from '../services/mockSupabase';
import { Organization } from "../types";
import { Card, Modal, Button } from "../components/UI";
import { supabaseDb } from "@/services/supabaseDb";

const Directory: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await supabaseDb.organizations.getAll();
      setOrgs(data);
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">
          Organization Directory
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Discover the amazing youth groups in our network.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {orgs.map((org) => (
          <Card
            key={org.id}
            onClick={() => setSelectedOrg(org)}
            className="h-full flex flex-col items-center text-center p-6 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-gray-100 group-hover:border-blue-200 shadow-sm">
              <img
                src={org.logoUrl}
                alt={org.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
              {org.name}
            </h3>
            <p className="text-gray-600 text-sm mb-6 line-clamp-2">
              {org.shortDescription}
            </p>
            <Button variant="outlined" size="sm" className="mt-auto">
              View Details
            </Button>
          </Card>
        ))}
      </div>

      {/* DETAILS MODAL */}
      <Modal
        isOpen={!!selectedOrg}
        onClose={() => setSelectedOrg(null)}
        title={selectedOrg?.name || "View Details"}
      >
        {selectedOrg && (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
              <img
                src={selectedOrg.logoUrl || "https://picsum.photos/100/100"}
                alt={selectedOrg.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedOrg.name}
              </h2>
              <p className="text-gray-500 max-w-md">
                {selectedOrg.shortDescription}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800 border-l-4 border-blue-500 pl-3">
                About Organization
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedOrg.fullDescription}
              </p>
            </div>

            {(selectedOrg.mission || selectedOrg.vision) && (
              <div className="grid gap-4">
                {selectedOrg.mission && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-700 uppercase mb-2">
                      Mission
                    </h4>
                    <p className="text-gray-700 italic text-sm">
                      "{selectedOrg.mission}"
                    </p>
                  </div>
                )}
                {selectedOrg.vision && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h4 className="text-xs font-bold text-purple-700 uppercase mb-2">
                      Vision
                    </h4>
                    <p className="text-gray-700 italic text-sm">
                      "{selectedOrg.vision}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Contact Info at the bottom as requested */}
            <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-500 uppercase">
                  President
                </h4>
                <p className="font-medium text-gray-900">
                  {selectedOrg.presidentName}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-500 uppercase">
                  Email
                </h4>
                <p className="text-blue-600 break-all">
                  {selectedOrg.contactEmail}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-500 uppercase">
                  Phone
                </h4>
                <p className="text-gray-900">{selectedOrg.contactPhone}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-500 uppercase">
                  Website
                </h4>
                {selectedOrg.website ? (
                  <a
                    href={selectedOrg.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline block truncate"
                  >
                    {selectedOrg.website}
                  </a>
                ) : (
                  <p className="text-gray-400 italic">N/A</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="outlined" onClick={() => setSelectedOrg(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Directory;
