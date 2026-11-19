import {reply} from './_shared.js';
export async function onRequestGet({env}){return reply({service:'GECRO Driver API',version:'0.14A',status:env.GEOAPIFY_API_KEY?'configured':'missing_api_key',provider:'Geoapify'});}
