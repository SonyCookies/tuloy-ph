'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Clock, 
  Info,
  CheckCircle2,
  Building,
  ArrowUpRight
} from "lucide-react";
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import LoadingModal from '@/app/components/ui/LoadingModal';
import StatusModal from '@/app/components/auth/StatusModal';

interface Rule {
  id: string;
  rule_text: string;
  linked_dorms?: string[]; // Array of dorm IDs that inherit this rule
}

interface Dorm {
  id: string;
  name: string;
  rule_ids?: string[];
}

export default function HouseRulesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rules, setRules] = useState<Rule[]>([]);
  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [newRuleContent, setNewRuleContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Status Modal State
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: null,
    title: '',
    message: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Global Rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('HouseRule')
        .select('*')
        .eq('owner_id', user.id);

      // Handle table not existing error gracefully
      if (rulesError && rulesError.code === 'PGRST116') {
        // Table probably not created yet
        console.warn('HouseRule table may not exist yet.');
      } else if (rulesError) {
        throw rulesError;
      }

      // 2. Fetch Owner's Dorms
      const { data: dormsData, error: dormsError } = await supabase
        .from('Dorm')
        .select('id, name, rule_ids')
        .eq('owner_id', user.id);

      if (dormsError) throw dormsError;

      setDorms(dormsData || []);

      // 3. Map Rule IDs back to rules for easier UI handling
      // For each rule, find which dorms have this rule_id in their rule_ids array
      const mappedRules = (rulesData || []).map((rule: any) => {
        const linkedDorms = (dormsData || [])
          .filter(d => d.rule_ids?.includes(rule.id))
          .map(d => d.id);
        
        return {
          ...rule,
          linked_dorms: linkedDorms
        };
      });

      setRules(mappedRules);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createRule = async () => {
    if (!newRuleContent.trim()) return;
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('HouseRule')
        .insert([{ 
          owner_id: user.id, 
          rule_text: newRuleContent.trim() 
        }])
        .select()
        .single();

      if (error) throw error;

      setRules([...rules, { ...data, linked_dorms: [] }]);
      setNewRuleContent('');
      setIsCreating(false);
      
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: 'Rule Created',
        message: 'Your new global house rule has been saved. You can now link it to your properties.'
      });
    } catch (err: any) {
      console.error(err);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Operation Failed',
        message: 'Please ensure you have created the "HouseRule" table in Supabase. Error: ' + err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule? It will be unlinked from all properties.')) return;
    setIsLoading(true);

    try {
      // 1. Delete from HouseRule
      const { error: ruleError } = await supabase
        .from('HouseRule')
        .delete()
        .eq('id', id);

      if (ruleError) throw ruleError;

      // 2. Unlink from all dorms (remove from rule_ids array)
      // This is technically handled by inheritance in UI but we should sync DB
      const targetDorms = dorms.filter(d => d.rule_ids?.includes(id));
      for (const dorm of targetDorms) {
        const newRuleIds = (dorm.rule_ids || []).filter((rid: string) => rid !== id);
        await supabase
          .from('Dorm')
          .update({ rule_ids: newRuleIds })
          .eq('id', dorm.id);
      }

      setRules(rules.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDormLink = async (ruleId: string, dormId: string) => {
    const isLinked = rules.find(r => r.id === ruleId)?.linked_dorms?.includes(dormId);
    
    // Optimistic Update
    setRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        const newDorms = isLinked 
          ? (r.linked_dorms || []).filter(id => id !== dormId)
          : [...(r.linked_dorms || []), dormId];
        return { ...r, linked_dorms: newDorms };
      }
      return r;
    }));

    try {
      const dorm = dorms.find(d => d.id === dormId);
      if (!dorm) return;

      const currentRuleIds = dorm.rule_ids || [];
      const newRuleIds = isLinked
        ? currentRuleIds.filter((rid: string) => rid !== ruleId)
        : [...currentRuleIds, ruleId];

      const { error } = await supabase
        .from('Dorm')
        .update({ rule_ids: newRuleIds })
        .eq('id', dormId);

      if (error) throw error;
      
      // Update local dorms state
      setDorms(prev => prev.map(d => d.id === dormId ? { ...d, rule_ids: newRuleIds } : d));

    } catch (err) {
      console.error('Error toggling rule inheritance:', err);
      // Rollback
      fetchData();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-32 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-neutral-dark mb-2 tracking-tight">House Rules</h1>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.15em] opacity-60">Set house rules for your properties</p>
          </div>
          <button 
             onClick={() => setIsCreating(true)}
             className="w-12 h-12 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/20 hover:scale-110 active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Hero Tip */}
      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex items-start gap-4 mb-8">
        <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-1">How it works</h4>
          <p className="text-xs font-bold text-neutral-dark/60 leading-relaxed">
            Create rules once and toggle which properties inherit them. Updates to global rules automatically reflect on all linked dorms.
          </p>
        </div>
      </div>

      {/* Creation Area */}
      {isCreating && (
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-secondary/20 mb-8 animate-in zoom-in-95 duration-300">
           <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">New Master Rule</span>
              <button onClick={() => setIsCreating(false)} className="text-gray-300 hover:text-red-500 transition-colors">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
           </div>
           
           <textarea
             autoFocus
             value={newRuleContent}
             onChange={(e) => setNewRuleContent(e.target.value)}
             placeholder="e.g. No excessive noise after 10:00 PM..."
             className="w-full bg-gray-50/50 border-none outline-none rounded-2xl p-4 text-sm font-bold text-neutral-dark placeholder:text-gray-300 focus:ring-2 ring-secondary/20 min-h-[120px] resize-none mb-6"
           />

           <div className="flex gap-3">
              <button 
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={createRule}
                disabled={!newRuleContent.trim()}
                className="flex-[2] bg-secondary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-secondary/20 disabled:opacity-50"
              >
                Save Master Rule
              </button>
           </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-6">
        {rules.length === 0 && !isCreating ? (
          <div className="text-center py-20 px-8 bg-white rounded-2xl border border-dashed border-gray-200">
             <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mx-auto mb-4">
                <Heart className="w-8 h-8" />
             </div>
             <p className="text-sm font-bold text-gray-400">No house rules created yet.</p>
             <button onClick={() => setIsCreating(true)} className="text-secondary text-[10px] font-black uppercase tracking-widest mt-2 hover:underline">Start adding rules</button>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden group">
               {/* Rule Header */}
               <div className="p-6 border-b border-gray-50 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                     <div className="p-2.5 bg-secondary/10 rounded-2xl text-secondary group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5" />
                     </div>
                     <p className="text-sm font-bold text-neutral-dark leading-relaxed">{rule.rule_text}</p>
                  </div>
                  <button 
                    onClick={() => deleteRule(rule.id)}
                    className="p-2.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>

               {/* Inheritance Section */}
               <div className="px-6 py-5 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Linked Properties</span>
                     </div>
                     <span className="text-[9px] font-black text-secondary bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                        {rule.linked_dorms?.length || 0} Dorms
                     </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                     {dorms.map((dorm) => {
                       const isLinked = rule.linked_dorms?.includes(dorm.id);
                       return (
                         <button
                           key={dorm.id}
                           onClick={() => toggleDormLink(rule.id, dorm.id)}
                           className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
                             isLinked 
                               ? 'bg-secondary text-white border-secondary shadow-md shadow-secondary/20' 
                               : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                           }`}
                         >
                           {dorm.name}
                           {isLinked && <CheckCircle2 className="w-3 h-3" />}
                         </button>
                       );
                     })}
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      <LoadingModal isOpen={isLoading} message="Updating rules..." />
      
      <StatusModal 
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        onAction={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        actionText="Got it"
      />
    </div>
  );
}
