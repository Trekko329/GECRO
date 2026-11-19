import {reply,error,bodyJSON,validatePoints,requireKey,geoRequest,handleError,sameOriginRequest} from '../_shared.js';
export async function onRequestPost({request,env}){
 if(!sameOriginRequest(request))return error('Cross-origin requests not allowed',403);
 try{const {points}=await bodyJSON(request);validatePoints(points,16,2);
 const url=new URL('https://api.geoapify.com/v1/routing');
 url.search=new URLSearchParams({waypoints:points.map(p=>`${p.lat},${p.lon}`).join('|'),mode:'drive',format:'geojson',apiKey:requireKey(env)});
 const data=await geoRequest(url);
 const geometry=data?.features?.[0]?.geometry;
 if(!geometry||!['LineString','MultiLineString'].includes(geometry.type)||!Array.isArray(geometry.coordinates)||!geometry.coordinates.length)throw Error('No road route returned');
 return reply({geometry});
 }catch(e){return handleError(e)}
}
