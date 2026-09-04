'use client';

import { useEffect, useState } from 'react';
import TruncatedText from '@/components/TruncatedText';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase/client';
import { generateBudgetPDF } from '@/utils/pdfGenerator';
import { Download } from 'lucide-react';

interface Program {
  id: string;
  image_url: string;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  budget?: { item: string; cost: number }[];
}

interface Sponsor {
  id: string;
  program_id: string;
  full_name: string;
  logo_url: string;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const [programsRes, sponsorsRes] = await Promise.all([
        (supabase.from('programs') as any)
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        (supabase.from('program_sponsors') as any)
          .select('*')
          .eq('is_active', true)
      ]);

      if (programsRes.error) throw programsRes.error;
      if (sponsorsRes.error) throw sponsorsRes.error;
      
      setPrograms(programsRes.data || []);
      setSponsors(sponsorsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (start: string | null, end: string | null) => {
    if (!start || !end) return null;
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (now < startDate) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    if (now > endDate) return { label: 'Done', color: 'bg-gray-100 text-gray-800' };
    return { label: 'Active', color: 'bg-green-100 text-green-800' };
  };

  const getDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Calculate difference in months
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.round(diffDays / 30);
    
    if (diffMonths === 0) return `${diffDays} days`;
    if (diffMonths === 1) return `1 month`;
    if (diffMonths >= 12) {
      const years = (diffMonths / 12).toFixed(1);
      return `${years.replace('.0', '')} years`;
    }
    return `${diffMonths} months`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full py-16 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Our Programs</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Explore our diverse programs designed to make a positive impact in the community.
        </p>
        
        <div className="flex flex-col gap-12 max-w-6xl mx-auto">
          {programs.map((program) => {
            const status = getStatus(program.start_date, program.end_date);
            const duration = getDuration(program.start_date, program.end_date);
            const programSponsors = sponsors.filter(s => s.program_id === program.id);

            return (
              <div key={program.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col md:flex-row">
                <div className="relative w-full md:w-2/5 flex-shrink-0 bg-gray-100">
                  <img 
                    src={program.image_url} 
                    alt={program.title} 
                    className="w-full h-full object-contain md:object-cover min-h-[300px]" 
                  />
                  {status && (
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold shadow ${status.color}`}>
                      {status.label}
                    </div>
                  )}
                </div>
                
                <div className="p-6 md:p-8 flex-1 flex flex-col space-y-4">
                  <h3 className="text-3xl font-bold text-gray-900">{program.title}</h3>
                  
                  {program.start_date && program.end_date && (
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border">
                      <div><strong>Start:</strong> {program.start_date}</div>
                      <div><strong>End:</strong> {program.end_date}</div>
                      <div className="w-full md:w-auto"><strong>Duration:</strong> {duration}</div>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <TruncatedText text={program.description} />
                    
                    {program.budget && program.budget.length > 0 && (
                      <details className="mt-6 bg-gray-50 rounded-lg border border-gray-200 shadow-sm group">
                        <summary className="font-bold text-gray-800 p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-100 rounded-lg transition-colors">
                          <span>View Estimated Budget</span>
                          <span className="text-gray-500 group-open:rotate-180 transition-transform duration-200">▼</span>
                        </summary>
                        <div className="p-4 pt-0 border-t border-gray-200">
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 mt-3 text-sm custom-scrollbar">
                            {program.budget.map((bItem, idx) => (
                              <div key={idx} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                <span className="text-gray-600 pr-4">{bItem.item}</span>
                                <span className="font-semibold text-gray-800 whitespace-nowrap">
                                  UGX {Number(bItem.cost).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center font-bold text-purple-700 mt-3 pt-3 border-t border-purple-200">
                            <span>Total</span>
                            <span className="text-lg">
                              UGX {program.budget.reduce((sum, item) => sum + (Number(item.cost) || 0), 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </details>
                    )}
                  </div>
                  
                  <div className="pt-6 mt-auto border-t">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <a 
                          href={`/apply/program-sponsor?program_id=${program.id}`}
                          className="inline-block text-center bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-sm hover:shadow-md"
                        >
                          Sponsor this Program
                        </a>
                        
                        {program.budget && program.budget.length > 0 && (
                          <button
                            onClick={() => generateBudgetPDF(program.title, program.budget!)}
                            className="inline-flex items-center gap-2 text-center bg-white border-2 border-purple-600 text-purple-700 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors shadow-sm hover:shadow-md"
                          >
                            <Download size={18} /> Budget PDF
                          </button>
                        )}
                      </div>

                      {programSponsors.length > 0 && (
                        <div className="flex-1 max-w-md">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Proud Sponsors</h4>
                          <div className="flex flex-wrap gap-3">
                            {programSponsors.map(sponsor => (
                              <div key={sponsor.id} className="flex flex-col items-center gap-1 p-2 border rounded-lg bg-gray-50 w-20 shadow-sm">
                                {sponsor.logo_url ? (
                                  <img src={sponsor.logo_url} alt={sponsor.full_name} className="h-8 w-8 object-contain" />
                                ) : (
                                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">
                                    {sponsor.full_name.charAt(0)}
                                  </div>
                                )}
                                <span className="text-[10px] text-center font-medium truncate w-full" title={sponsor.full_name}>{sponsor.full_name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {programs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No programs available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
