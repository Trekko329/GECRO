import {reply,error,bodyJSON,validText,requireKey,geoRequest,handleError,sameOriginRequest,candidateList} from '../_shared.js';
export async function onRequestPost({request,env}){
 if(!sameOriginRequest(request))return error('Cross-origin requests not allowed',403);
 try{const {address}=await bodyJSON(request);const text=validText(address);
 const q=/\b(australia|vic|victoria|nsw|qld|sa|tas|wa|nt|act)\b/i.test(text)?text:`${text}, Victoria, Australia`;
 const url=new URL('https://api.geoapify.com/v1/geocode/autocomplete');url.search=new URLSearchParams({text:q,filter:'countrycode:au',format:'json',limit:'5',apiKey:requireKey(env)});
 return reply({candidates:candidateList(await geoRequest(url))});
 }catch(e){return handleError(e)}
}
