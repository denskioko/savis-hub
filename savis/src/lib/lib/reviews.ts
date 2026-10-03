import { createClient } from "@/lib/supabase/client";

export type Review = {
  id: string;
  jobId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const LOCAL_KEY = "savis_reviews";

function fromLocal(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocal(list: Review[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

export function getReviewForJob(jobId: string): Review | undefined {
  return fromLocal().find((r) => r.jobId === jobId);
}

export async function addReview(
  jobId: string,
  rating: number,
  comment: string
): Promise<Review> {
  const local: Review = {
    id: Date.now().toString(),
    jobId,
    rating,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        job_id: jobId,
        rating,
        comment: comment.trim() || null,
      })
      .select("*")
      .single();

    if (!error && data) {
      const r: Review = {
        id: String(data.id),
        jobId: String(data.job_id),
        rating: Number(data.rating),
        comment: String(data.comment || ""),
        createdAt: String(data.created_at),
      };
      const list = fromLocal().filter((x) => x.jobId !== jobId);
      list.unshift(r);
      saveLocal(list);
      return r;
    }
  } catch {
    /* local fallback */
  }

  const list = fromLocal().filter((x) => x.jobId !== jobId);
  list.unshift(local);
  saveLocal(list);
  return local;
}
