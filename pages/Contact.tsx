
import React, { useState } from 'react';
import { mockDb } from '../services/mockSupabase';
import { Button, TextField, Card } from '../components/UI';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Send, CheckCircle, AlertCircle } from 'lucide-react';

const Contact: React.FC = () => {
  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await mockDb.messages.add(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-16 text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-blue-100 text-lg">Have questions? We'd love to hear from you.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Card */}
          <Card className="p-8 h-fit lg:col-span-1 border-t-4 border-blue-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600"><MapPin size={20} /></div>
                <div>
                  <h4 className="font-bold text-gray-900">Our Location</h4>
                  <p className="text-gray-600">123 Community Drive<br/>Metro City, ST 12345</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Mail size={20} /></div>
                <div>
                  <h4 className="font-bold text-gray-900">Email Us</h4>
                  <p className="text-gray-600">info@orgconnect.com</p>
                  <p className="text-gray-600">support@orgconnect.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Phone size={20} /></div>
                <div>
                  <h4 className="font-bold text-gray-900">Call Us</h4>
                  <p className="text-gray-600">(555) 123-4567</p>
                  <p className="text-sm text-gray-400">Mon-Fri, 9am - 5pm</p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t">
              <h4 className="font-bold text-gray-900 mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-colors"><Facebook size={18}/></a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-400 hover:text-white transition-colors"><Twitter size={18}/></a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-pink-600 hover:text-white transition-colors"><Instagram size={18}/></a>
              </div>
            </div>
          </Card>

          {/* Contact Form */}
          <Card className="p-8 lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send a Message</h2>
            
            {submitStatus === 'success' ? (
              <div className="bg-green-50 p-8 rounded-lg text-center">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">Message Sent!</h3>
                <p className="text-gray-600">Thanks for reaching out. We'll get back to you as soon as possible.</p>
                <Button onClick={() => setSubmitStatus('idle')} className="mt-6">Send Another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                   <TextField 
                      label="Your Name" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required 
                   />
                   <TextField 
                      label="Email Address" 
                      type="email"
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      required 
                   />
                </div>
                <TextField 
                   label="Subject" 
                   value={formData.subject} 
                   onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                   required 
                />
                <TextField 
                   label="Message" 
                   multiline
                   value={formData.message} 
                   onChange={(e) => setFormData({...formData, message: e.target.value})} 
                   required 
                   className="min-h-[150px]"
                />
                
                {submitStatus === 'error' && (
                   <div className="bg-red-50 text-red-600 p-3 rounded flex items-center text-sm">
                      <AlertCircle size={16} className="mr-2"/> Failed to send message. Please try again.
                   </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" size="lg" isLoading={isSubmitting}>
                    <Send size={18} className="mr-2" /> Send Message
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
