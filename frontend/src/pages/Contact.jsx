import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const GithubIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill out all fields.');
      return;
    }
    
    setSending(true);
    toast.loading('Sending message...', { id: 'contact_toast' });

    // Simulate API delay
    setTimeout(() => {
      setSending(false);
      setFormData({ name: '', email: '', message: '' });
      toast.success('Message sent successfully! We will get back to you soon.', { id: 'contact_toast' });
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12 animate-fade-up">
      {/* Title */}
      <div className="text-center space-y-4">
        <div className="inline-flex p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-650 shadow-sm shadow-emerald-500/5">
          <Phone className="h-8 w-8" />
        </div>
        <h1 className="text-3xl sm:text-section font-heading font-extrabold text-gray-900 tracking-tight">Contact & Inquiries</h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed font-semibold">
          Get in touch for questions, project reviews, or architectural discussions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        {/* Contact Form */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm shadow-gray-100/40 flex flex-col justify-between text-left">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-emerald-600 animate-pulse" />
            <span>Send a Message</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 block">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={sending}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={sending}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 block">Message</label>
              <textarea
                rows="4"
                name="message"
                value={formData.message}
                onChange={handleChange}
                disabled={sending}
                placeholder="Type your inquiry here..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/20 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-500/15 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center space-x-2 disabled:bg-emerald-300 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              <span>Send Message</span>
            </button>
          </form>
        </div>

        {/* Contact Info Details */}
        <div className="md:col-span-5 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col justify-between text-left relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 h-40 w-40 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_50%)]" />
          
          <div className="space-y-6">
            <h2 className="text-lg font-heading font-bold text-white border-b border-slate-800 pb-3">Contact Information</h2>
            
            <div className="space-y-5">
              <div className="flex items-center space-x-4 text-sm text-gray-200 group hover:text-white transition-colors duration-250">
                <div className="p-2.5 bg-slate-950/40 rounded-xl text-emerald-400 border border-slate-800 shadow-sm shadow-emerald-500/5">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Email</span>
                  <a href="mailto:contact@agriintellect.com" className="hover:text-emerald-400 transition-colors font-medium">contact@agriintellect.com</a>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-200 group hover:text-white transition-colors duration-250">
                <div className="p-2.5 bg-slate-950/40 rounded-xl text-emerald-400 border border-slate-800 shadow-sm shadow-emerald-500/5">
                  <GithubIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">GitHub Project</span>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors font-medium">github.com/crop-recommendation-ai</a>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-200 group hover:text-white transition-colors duration-250">
                <div className="p-2.5 bg-slate-950/40 rounded-xl text-emerald-400 border border-slate-800 shadow-sm shadow-emerald-500/5">
                  <LinkedinIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">LinkedIn Profile</span>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors font-medium">linkedin.com/in/agricultural-ai</a>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-200 group hover:text-white transition-colors duration-250">
                <div className="p-2.5 bg-slate-950/40 rounded-xl text-emerald-400 border border-slate-800 shadow-sm shadow-emerald-500/5">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Location</span>
                  <span className="font-medium">Engineering College Campus, India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300 mt-6 md:mt-0 font-medium shadow-inner">
            <strong>Project Support Hours:</strong> Mon-Fri, 9:00 AM - 5:00 PM IST. Response window is typically under 24 hours.
          </div>
        </div>
      </div>
    </div>
  );
}
