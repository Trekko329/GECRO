import {reply,error,bodyJSON,validatePoints,requireKey,geoRequest,handleError,sameOriginRequest} from '../_shared.js';
export async function onRequestPost({request,env}){
 if(!sameOriginRequest(request))return error('Cross-origin requests not allowed',403);
 try{const data=await bodyJSON(request);const points=validatePoints(data.points,16,2);
 const locations=points.map(p=>({location:[p.lon,p.lat]}));
 const url=`https://api.geoapify.com/v1/routematrix?apiKey=${encodeURIComponent(requireKey(env))}`;
 const upstream=await geoRequest(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'drive',sources:locations,targets:locations})});
 const rows=upstream.sources_to_targets;
 if(!Array.isArray(rows)||rows.length!==points.length||rows.some(row=>!Array.isArray(row)||row.length!==points.length))throw Error('Unexpected routing matrix response');
 const matrix=rows.map((row,i)=>row.map((cell,j)=>{
   if(i===j)return 0;
   return cell&&cell.time!==null&&cell.time!==undefined&&Number.isFinite(Number(cell.time))&&Number(cell.time)>=0?Number(cell.time):null;
 }));
 return reply({durations:matrix});
 }catch(e){return handleError(e)}
}
