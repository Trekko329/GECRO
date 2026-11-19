import assert from 'node:assert/strict';
import * as matrix from '../functions/api/routes/matrix.js';
import * as resolve from '../functions/api/addresses/resolve.js';
import * as suggest from '../functions/api/addresses/suggest.js';
import * as geometry from '../functions/api/routes/geometry.js';
import * as health from '../functions/api/health.js';
const env={GEOAPIFY_API_KEY:'TEST_KEY_ONLY'};
function req(path,body){return new Request('https://staging.example.com'+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://staging.example.com'},body:JSON.stringify(body)});}
const originalFetch=globalThis.fetch;const calls=[];
globalThis.fetch=async (url,opts)=>{const u=String(url);calls.push({url:u,options:opts});
 if(u.includes('/v1/routematrix'))return Response.json({sources_to_targets:[[{'time':0},{time:110}],[{time:121},{time:0}]]});
 if(u.includes('/v1/routing'))return Response.json({type:'FeatureCollection',features:[{geometry:{type:'MultiLineString',coordinates:[[[144.3,-38.1],[144.4,-38.2]]]}}]});
 return Response.json({results:[{lat:-38.15,lon:144.37,formatted:'Test Address, VIC',housenumber:'1',street:'Test Street'}]});
};
try{
 const points=[{lat:-38.1,lon:144.3},{lat:-38.2,lon:144.4}];
 let r=await matrix.onRequestPost({request:req('/api/routes/matrix',{points}),env});assert.equal(r.status,200);assert.deepEqual((await r.json()).durations,[[0,110],[121,0]]);
 assert.equal(JSON.parse(calls[0].options.body).sources[0].location[0],144.3);
 r=await resolve.onRequestPost({request:req('/api/addresses/resolve',{address:'1 Test St, Geelong'}),env});assert.equal(r.status,200);assert.equal((await r.json()).candidates[0].lat,-38.15);
 r=await suggest.onRequestPost({request:req('/api/addresses/suggest',{address:'1 Test Stre, Geelong'}),env});assert.equal(r.status,200);assert.equal((await r.json()).candidates.length,1);
 r=await geometry.onRequestPost({request:req('/api/routes/geometry',{points}),env});assert.equal(r.status,200);assert.equal((await r.json()).geometry.type,'MultiLineString');
 r=await health.onRequestGet({env});assert.equal((await r.json()).status,'configured');
 r=await matrix.onRequestPost({request:req('/api/routes/matrix',{points:Array.from({length:17},()=>points[0])}),env});assert.equal(r.status,400);
 r=await resolve.onRequestPost({request:req('/api/addresses/resolve',{address:'a'}),env});assert.equal(r.status,400);
 r=await geometry.onRequestPost({request:new Request('https://staging.example.com/api/routes/geometry',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://evil.example.com'},body:JSON.stringify({points})}),env});assert.equal(r.status,403);
 console.log('PASS: Geoapify matrix translation, geocoding, suggestions, road geometry, health, invalid input, cross-origin rejection');
}finally{globalThis.fetch=originalFetch}
