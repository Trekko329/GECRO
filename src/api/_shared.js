const headers={ 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' };
export function reply(data,status=200){return new Response(JSON.stringify(data),{status,headers});}
export function error(message,status=400){return reply({error:message},status);}
export async function bodyJSON(request,max=14000){
  if(request.headers.get('content-type')?.split(';')[0]?.trim()!=='application/json')throw Error('Expected application/json');
  const length=Number(request.headers.get('content-length')||0);if(length>max)throw Error('Request too large');
  const raw=await request.text();if(raw.length>max)throw Error('Request too large');
  try{return JSON.parse(raw)}catch(_){throw Error('Invalid JSON')}
}
export function validPoint(p){return p&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&p.lat>=-90&&p.lat<=90&&p.lon>=-180&&p.lon<=180}
export function validatePoints(points,max=16,min=1){if(!Array.isArray(points)||points.length<min||points.length>max||!points.every(validPoint))throw Error(`Provide ${min} to ${max} valid coordinate points`);return points}
export function validText(text){if(typeof text!=='string'||text.trim().length<5||text.length>350||/[\r\n<>]/.test(text))throw Error('Provide one valid address (5–350 characters)');return text.trim()}
export function requireKey(env){if(!env.GEOAPIFY_API_KEY)throw Error('Geoapify API key has not been configured on Cloudflare');return env.GEOAPIFY_API_KEY}
export async function geoRequest(url,options={}){
  const ac=new AbortController();const t=setTimeout(()=>ac.abort(),14000);
  try{const res=await fetch(url,{...options,signal:ac.signal,headers:{Accept:'application/json',...(options.headers||{})}});
    if(!res.ok){if(res.status===429)throw Error('Routing provider quota or rate limit reached');throw Error(`Routing provider returned HTTP ${res.status}`)}
    return await res.json();
  }finally{clearTimeout(t)}
}
export function handleError(e){const message=e?.name==='AbortError'?'Routing provider timed out':e?.message||'Request failed';return error(message,/key has not|quota/.test(message)?503:400)}
export function sameOriginRequest(request){const origin=request.headers.get('Origin');return !origin || origin===new URL(request.url).origin;}
export function candidateList(data){let a=Array.isArray(data.results)?data.results:Array.isArray(data.features)?data.features.map(f=>({...f.properties,lon:f.properties?.lon??f.geometry?.coordinates?.[0],lat:f.properties?.lat??f.geometry?.coordinates?.[1]})):[];
return a.filter(p=>Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon))).slice(0,5).map(p=>({lat:Number(p.lat),lon:Number(p.lon),label:String(p.formatted||p.address_line1||p.name||'Unknown location'),confidence:p.rank?.confidence??null,street:p.street||null,housenumber:p.housenumber||null,postcode:p.postcode||null,city:p.city||null}));}
