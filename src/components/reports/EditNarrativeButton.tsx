'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Props {
  reportId: string;
  currentNarrative: string;
}

export default function EditNarrativeButton({ reportId, currentNarrative }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [narrative, setNarrative] = useState(currentNarrative);
  const [isSaving, setIsSaving] = useState(false);

  function handleOpen() {
    setNarrative(currentNarrative);
    setOpen(true);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('reports')
        .update({ ai_narrative: narrative })
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Narrative saved.');
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to save narrative:', err);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 rounded-lg px-5 py-2.5 text-base font-medium transition-colors"
      >
        Edit Narrative
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Narrative</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <textarea
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              rows={16}
              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-y"
            />
            <p className="text-xs text-stone-400 mt-1.5">
              Use ## for section headings and - for bullet points.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <button
              onClick={() => setOpen(false)}
              disabled={isSaving}
              className="bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !narrative.trim()}
              className="bg-orange-600 text-white hover:bg-orange-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving…
                </span>
              ) : (
                'Save'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
