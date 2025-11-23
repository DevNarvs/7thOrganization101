import React, { useEffect, useState } from "react";
// import { mockDb } from '../services/mockSupabase';
import { Testimonial } from "../types";
import { Card, Button, TextField } from "../components/UI";
import { Quote, Send, CheckCircle } from "lucide-react";
import { supabaseDb } from "@/services/supabaseDb";

const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setLoading(true);
    const all = await supabaseDb.testimonials.getAll();
    // Only show Approved testimonials to the public
    setTestimonials(all.filter((t) => t.status === "Approved"));
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await supabaseDb.testimonials.add({
        authorName: name,
        role: role,
        content: content,
      });
      setSubmitted(true);
      // Reset form
      setName("");
      setRole("");
      setContent("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800">Community Voices</h1>
        <p className="mt-4 text-xl text-gray-600">
          Hear what our members, volunteers, and partners have to say.
        </p>
      </div>

      {/* List Section */}
      {loading ? (
        <div className="text-center py-12">Loading stories...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {testimonials.length > 0 ? (
            testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative"
              >
                <Quote
                  size={48}
                  className="text-blue-100 absolute top-6 left-6"
                />
                <div className="relative z-10 pl-4">
                  <p className="text-gray-700 text-lg italic mb-6 leading-relaxed">
                    "{t.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {t.authorName.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-bold text-gray-900">
                        {t.authorName}
                      </h4>
                      <span className="text-sm text-blue-600">{t.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center text-gray-500">
              No testimonials have been published yet. Be the first!
            </div>
          )}
        </div>
      )}

      {/* Submission Form */}
      <div className="max-w-2xl mx-auto bg-blue-50 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-900">Share Your Story</h2>
          <p className="text-blue-700 mt-2">
            Your experience inspires others. Submit your testimonial below.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-100 border border-green-200 rounded-lg p-6 text-center animate-in fade-in">
            <CheckCircle size={48} className="mx-auto text-green-600 mb-3" />
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Thank You!
            </h3>
            <p className="text-green-700">
              Your testimonial has been submitted successfully. It will be
              reviewed by our team before appearing on this page.
            </p>
            <Button
              variant="text"
              className="mt-4"
              onClick={() => setSubmitted(false)}
            >
              Submit Another
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <TextField
                label="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
              />
              <TextField
                label="Role / Title"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                placeholder="e.g. Volunteer, Member"
              />
            </div>
            <TextField
              label="Your Testimonial"
              multiline
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Share your experience..."
              className="min-h-[120px]"
            />
            <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
              <Send size={18} className="mr-2" /> Submit Testimonial
            </Button>
            <p className="text-xs text-center text-gray-400 mt-4">
              By submitting, you agree to allow us to publish this content on
              our website.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Testimonials;
