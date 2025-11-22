
import React, { useEffect, useState } from 'react';
import { mockDb } from '../services/mockSupabase';
import { Program, Organization } from '../types';
import { Card, Button, Modal, TextField } from '../components/UI';
import { MapPin, Calendar, Share2, Download, Building2, Search, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  
  // Registration State
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regError, setRegError] = useState('');

  // New Registration Fields
  const [regPhone, setRegPhone] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regAffiliation, setRegAffiliation] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      const [programsData, orgsData] = await Promise.all([
        mockDb.programs.getAll(),
        mockDb.organizations.getAll()
      ]);
      // Only show approved programs on the public page
      setPrograms(programsData.filter(p => p.isApproved === true));
      setOrgs(orgsData);
    };
    loadData();
  }, []);

  // Reset registration state when modal opens/closes
  useEffect(() => {
    if (!selectedProgram) {
      setIsRegistering(false);
      setRegSuccess(false);
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegAge('');
      setRegAffiliation('');
      setRegError('');
    }
  }, [selectedProgram]);

  const handlePrintPDF = () => {
    window.print();
  };

  const handleShare = async (program: Program, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const urlToShare = window.location.href;
    const shareData = {
        title: program.title,
        text: `Check out ${program.title} by ${getOrgName(program.organizerId)}! \nDate: ${new Date(program.date).toLocaleDateString()}`,
        url: urlToShare
    };

    try {
        // navigator.share requires a valid HTTP/HTTPS URL. 
        // In some preview environments, window.location.href might be 'about:blank' or 'blob:', causing "Invalid URL" error.
        const isValidUrl = urlToShare.startsWith('http');

        if (navigator.share && isValidUrl) {
            await navigator.share(shareData);
        } else {
            throw new Error("Web Share API not supported or invalid URL context.");
        }
    } catch (err) {
        // Fallback to clipboard if sharing fails or isn't supported
        try {
            const clipboardText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
            await navigator.clipboard.writeText(clipboardText);
            alert('Program details copied to clipboard!');
        } catch (clipboardErr) {
            console.error('Failed to copy to clipboard:', clipboardErr);
            alert('Could not share program. Please manually copy the URL.');
        }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    
    setIsSubmittingReg(true);
    setRegError('');
    try {
      await mockDb.registrations.add({
        programId: selectedProgram.id,
        participantName: regName,
        participantEmail: regEmail,
        phone: regPhone,
        age: regAge ? parseInt(regAge) : undefined,
        affiliation: regAffiliation
      });
      setRegSuccess(true);
    } catch (error: any) {
      setRegError(error.message || "Failed to register. Please try again.");
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Completed': return 'bg-green-100 text-green-800';
          case 'Ongoing': return 'bg-blue-100 text-blue-800';
          case 'Disapproved': return 'bg-red-100 text-red-800';
          default: return 'bg-purple-100 text-purple-800';
      }
  };

  const getOrgName = (id?: string) => {
    if (!id) return '';
    const org = orgs.find(o => o.id === id);
    return org ? org.name : '';
  };

  const filteredPrograms = programs.filter(program => 
    program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Programs & Accomplishments</h1>
          <p className="text-gray-600 mt-2">Our ongoing initiatives and success stories.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search programs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 placeholder-gray-500"
            />
          </div>

          <Button variant="outlined" onClick={handlePrintPDF} className="no-print whitespace-nowrap w-full sm:w-auto">
            <Download size={18} className="mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((program) => (
            <Card 
              key={program.id} 
              className={`flex flex-col md:flex-row ${program.imageUrl ? 'h-auto md:h-64' : 'h-auto'}`}
              onClick={() => setSelectedProgram(program)}
            >
              {program.imageUrl && (
                <div className="md:w-1/3 h-48 md:h-full relative overflow-hidden">
                  <img src={program.imageUrl} alt={program.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
              <div className={`p-6 flex flex-col justify-between ${program.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{program.title}</h3>
                      {program.organizerId && (
                        <div className="flex items-center text-blue-600 text-sm font-semibold mt-1">
                          <Building2 size={16} className="mr-1" />
                          {getOrgName(program.organizerId)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        {program.status && (
                            <span className={`text-xs px-2 py-1 rounded uppercase font-bold tracking-wide ${getStatusColor(program.status)}`}>
                                {program.status}
                            </span>
                        )}
                        {user && user.organizationId === program.organizerId && (
                          <span className="text-xs text-gray-500 font-medium no-print italic">Managed by You</span>
                        )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-500 mb-4 text-sm mt-2">
                    <Calendar size={16} className="mr-1" /> {new Date(program.date).toLocaleDateString()}
                    <span className="mx-2">•</span>
                    <MapPin size={16} className="mr-1" /> {program.location || 'TBD'}
                  </div>
                  <p className="text-gray-700 line-clamp-2">{program.description}</p>
                </div>
                <div className="mt-4 flex gap-2 no-print">
                  <Button variant="text" className="pl-0" onClick={(e) => handleShare(program, e)}>
                    <Share2 size={18} className="mr-2" /> Share
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium">No programs found</h3>
            <p>Try adjusting your search terms.</p>
          </div>
        )}
      </div>

      {/* PROGRAM DETAILS MODAL */}
      <Modal
        isOpen={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
        title={isRegistering ? "Event Registration" : "Program Details"}
      >
        {selectedProgram && (
            <div className="space-y-6">
                {isRegistering ? (
                   // REGISTRATION FORM
                   regSuccess ? (
                     <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in">
                       <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                         <CheckCircle size={32} />
                       </div>
                       <h3 className="text-2xl font-bold text-gray-800 mb-2">Registration Submitted!</h3>
                       <p className="text-gray-600 mb-6">
                          You have successfully requested to join <strong>{selectedProgram.title}</strong>. <br/>
                          <span className="text-sm text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded mt-2 inline-block">Status: Pending Approval</span>
                       </p>
                       <Button onClick={() => setSelectedProgram(null)}>Close</Button>
                     </div>
                   ) : (
                     <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                          <h4 className="font-bold text-blue-800">{selectedProgram.title}</h4>
                          <p className="text-sm text-blue-600">{new Date(selectedProgram.date).toLocaleDateString()} • {selectedProgram.location}</p>
                        </div>
                        
                        {regError && (
                          <div className="bg-red-50 border border-red-200 p-3 rounded text-red-600 text-sm flex items-center">
                            <AlertCircle size={16} className="mr-2" />
                            {regError}
                          </div>
                        )}

                        <TextField 
                          label="Full Name" 
                          value={regName} 
                          onChange={(e) => setRegName(e.target.value)} 
                          placeholder="Enter your full name"
                          required 
                        />
                        <TextField 
                          label="Email Address" 
                          type="email"
                          value={regEmail} 
                          onChange={(e) => setRegEmail(e.target.value)} 
                          placeholder="Enter your email"
                          required 
                        />
                        <div className="grid grid-cols-2 gap-4">
                           <TextField 
                            label="Phone Number" 
                            value={regPhone} 
                            onChange={(e) => setRegPhone(e.target.value)} 
                            placeholder="(555) 000-0000"
                          />
                          <TextField 
                            label="Age" 
                            type="number"
                            value={regAge} 
                            onChange={(e) => setRegAge(e.target.value)} 
                            placeholder="e.g. 18"
                          />
                        </div>
                        <TextField 
                          label="School / Organization Affiliation" 
                          value={regAffiliation} 
                          onChange={(e) => setRegAffiliation(e.target.value)} 
                          placeholder="e.g. Lincoln High School"
                        />

                        <div className="flex gap-3 pt-4">
                          <Button type="button" variant="outlined" fullWidth onClick={() => setIsRegistering(false)}>Back</Button>
                          <Button type="submit" fullWidth isLoading={isSubmittingReg}>Confirm Registration</Button>
                        </div>
                     </form>
                   )
                ) : (
                   // DETAILS VIEW
                   <>
                    {selectedProgram.imageUrl && (
                        <div className="w-full h-64 md:h-96 overflow-hidden rounded-lg border border-gray-100 shadow-sm">
                            <img src={selectedProgram.imageUrl} alt={selectedProgram.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{selectedProgram.title}</h2>
                            {selectedProgram.status && (
                                <span className={`text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide ${getStatusColor(selectedProgram.status)}`}>
                                    {selectedProgram.status}
                                </span>
                            )}
                        </div>
                        
                        {selectedProgram.organizerId && (
                            <div className="flex items-center text-blue-600 font-bold text-lg mt-2">
                              <Building2 size={20} className="mr-2" />
                              {getOrgName(selectedProgram.organizerId)}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center text-gray-700">
                            <Calendar size={20} className="mr-3 text-blue-500" />
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Date</p>
                                <p className="font-medium">{new Date(selectedProgram.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <MapPin size={20} className="mr-3 text-red-500" />
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Location</p>
                                <p className="font-medium">{selectedProgram.location || 'TBD'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">About this Program</h3>
                        <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                            {selectedProgram.description}
                        </p>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-2">
                        {/* Removed Close Button */}
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button variant="text" onClick={(e) => handleShare(selectedProgram, e)} className="flex-1 sm:flex-none justify-center">
                              <Share2 size={18} className="mr-2" /> Share
                          </Button>
                          {/* Show Register button only for Upcoming events and if registration is enabled */}
                          {selectedProgram.status === 'Upcoming' && selectedProgram.allowRegistration !== false && (
                            <Button variant="contained" color="primary" onClick={() => setIsRegistering(true)} className="flex-1 sm:flex-none justify-center">
                              <UserPlus size={18} className="mr-2" /> Register
                            </Button>
                          )}
                        </div>
                    </div>
                   </>
                )}
            </div>
        )}
      </Modal>
    </div>
  );
};

export default Programs;
