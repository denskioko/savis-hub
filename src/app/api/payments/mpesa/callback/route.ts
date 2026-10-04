import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export async function POST(request:Request){
 try{
  const payload=await request.json(); const callback=payload?.Body?.stkCallback;
  if(!callback)return NextResponse.json({ResultCode:0,ResultDesc:"Accepted"});
  const items=Array.isArray(callback.CallbackMetadata?.Item)?callback.CallbackMetadata.Item:[];
  const value=(name:string)=>items.find((item:{Name?:string})=>item.Name===name)?.Value;
  const receipt=value("MpesaReceiptNumber")?String(value("MpesaReceiptNumber")):null;
  const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{autoRefreshToken:false,persistSession:false}});
  const {error}=await supabase.rpc("mark_mpesa_callback",{p_checkout_request_id:String(callback.CheckoutRequestID||""),p_merchant_request_id:String(callback.MerchantRequestID||""),p_result_code:Number(callback.ResultCode),p_result_desc:String(callback.ResultDesc||""),p_receipt:receipt,p_callback_at:new Date().toISOString()});
  if(error)return NextResponse.json({ResultCode:1,ResultDesc:"Callback processing failed"},{status:500});
  return NextResponse.json({ResultCode:0,ResultDesc:"Accepted"});
 }catch{return NextResponse.json({ResultCode:0,ResultDesc:"Accepted"});}
}