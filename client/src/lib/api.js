const BASE='http://localhost:4000/api';
export async function api(path, options={}){const r=await fetch(BASE+path,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options});const data=await r.json();if(!r.ok)throw new Error(data.error||'Request failed');return data}
export const get=(p)=>api(p);
export const post=(p,b)=>api(p,{method:'POST',body:JSON.stringify(b)});
export const del=(p)=>api(p,{method:'DELETE'});
