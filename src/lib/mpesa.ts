export function normalizeKenyanPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("07") && digits.length === 10) return "254" + digits.slice(1);
  if (digits.startsWith("01") && digits.length === 10) return "254" + digits.slice(1);
  throw new Error("Enter a valid Kenyan M-Pesa number, e.g. 0712345678.");
}
export function darajaBaseUrl() {
  return process.env.MPESA_ENVIRONMENT === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
}
export async function getDarajaToken() {
  const key=process.env.MPESA_CONSUMER_KEY, secret=process.env.MPESA_CONSUMER_SECRET;
  if(!key||!secret) throw new Error("M-Pesa credentials are not configured on the server.");
  const basic=Buffer.from(key+":"+secret).toString("base64");
  const response=await fetch(darajaBaseUrl()+"/oauth/v1/generate?grant_type=client_credentials",{headers:{Authorization:"Basic "+basic},cache:"no-store"});
  const body=await response.json().catch(()=>({}));
  if(!response.ok||!body.access_token) throw new Error(body.errorMessage||"Could not authenticate with M-Pesa.");
  return String(body.access_token);
}
export async function initiateStkPush(input:{phone:string;amount:number;accountReference:string;transactionDesc:string}) {
  const shortcode=process.env.MPESA_SHORTCODE, passkey=process.env.MPESA_PASSKEY, callbackUrl=process.env.MPESA_CALLBACK_URL;
  if(!shortcode||!passkey||!callbackUrl) throw new Error("M-Pesa shortcode, passkey and callback URL must be configured.");
  const token=await getDarajaToken();
  const timestamp=new Date().toISOString().replace(/[-:TZ.]/g,"").slice(0,14);
  const password=Buffer.from(shortcode+passkey+timestamp).toString("base64");
  const response=await fetch(darajaBaseUrl()+"/mpesa/stkpush/v1/processrequest",{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({
    BusinessShortCode:shortcode,Password:password,Timestamp:timestamp,TransactionType:process.env.MPESA_TRANSACTION_TYPE||"CustomerPayBillOnline",
    Amount:Math.max(1,Math.round(input.amount)),PartyA:input.phone,PartyB:shortcode,PhoneNumber:input.phone,CallBackURL:callbackUrl,
    AccountReference:input.accountReference.slice(0,12),TransactionDesc:input.transactionDesc.slice(0,20)
  }),cache:"no-store"});
  const body=await response.json().catch(()=>({}));
  if(!response.ok||body.ResponseCode!=="0") throw new Error(body.errorMessage||body.ResponseDescription||"M-Pesa STK Push could not be started.");
  return {merchantRequestId:String(body.MerchantRequestID||""),checkoutRequestId:String(body.CheckoutRequestID||""),customerMessage:String(body.CustomerMessage||"Check your phone for the M-Pesa prompt.")};
}