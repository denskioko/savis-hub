import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initiateStkPush, normalizeKenyanPhone } from "@/lib/mpesa";
export async function POST(request:Request){
 try{
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Authentication required."},{status:401});
  const body=await request.json(); const jobId=String(body.jobId||""); const amount=Math.round(Number(body.amount)); const phone=normalizeKenyanPhone(String(body.phone||""));
  if(!jobId||!Number.isFinite(amount)||amount<1)return NextResponse.json({error:"A valid job and amount are required."},{status:400});
  const {data:job}=await supabase.from("jobs").select("id,consumer_id,provider_id,status,quoted_amount").eq("id",jobId).maybeSingle();
  if(!job||job.consumer_id!==user.id)return NextResponse.json({error:"Job not found."},{status:404});
  if(job.status!=="accepted")return NextResponse.json({error:"Only an accepted job can be paid."},{status:400});
  if(job.quoted_amount&&amount!==Number(job.quoted_amount))return NextResponse.json({error:"Payment amount must match the accepted quote."},{status:400});
  const {data:existing}=await supabase.from("payments").select("id,status,checkout_request_id").eq("job_id",jobId).eq("payer_id",user.id).in("status",["pending","held"]).order("created_at",{ascending:false}).limit(1).maybeSingle();
  if(existing)return NextResponse.json({ok:true,paymentId:existing.id,status:existing.status,message:"A payment is already active for this job."});
  const {data:payment,error}=await supabase.from("payments").insert({job_id:jobId,payer_id:user.id,payee_id:String(job.provider_id),amount,platform_fee:0,method:"mpesa",status:"pending",phone_number:phone}).select("id").single();
  if(error||!payment)return NextResponse.json({error:error?.message||"Could not create payment."},{status:500});
  try{
   const stk=await initiateStkPush({phone,amount,accountReference:"SAVIS-"+jobId.slice(0,6),transactionDesc:"SAVIS protected job"});
   await supabase.from("payments").update({merchant_request_id:stk.merchantRequestId,checkout_request_id:stk.checkoutRequestId,updated_at:new Date().toISOString()}).eq("id",payment.id);
   return NextResponse.json({ok:true,paymentId:payment.id,checkoutRequestId:stk.checkoutRequestId,message:stk.customerMessage});
  }catch(error){
   await supabase.from("payments").update({status:"failed",failure_reason:error instanceof Error?error.message:"STK Push failed",updated_at:new Date().toISOString()}).eq("id",payment.id); throw error;
  }
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not start M-Pesa payment."},{status:500});}
}