import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {toast} from 'sonner';
import {DEMO_KEY,makeDemo,offerStatus,type MartState} from './model';
const Context=createContext<{state:MartState;update:(action:string,fn:(s:MartState)=>MartState)=>void;ready:boolean;error:boolean;retry:()=>void}|null>(null);
export function MartProvider({children}:{children:ReactNode}){
 const [state,setState]=useState<MartState>(()=>makeDemo());const [ready,setReady]=useState(false);const [error,setError]=useState(false);
 const load=()=>{try{const saved=localStorage.getItem(DEMO_KEY);if(saved){const parsed=JSON.parse(saved);if(!Array.isArray(parsed.products)||!Array.isArray(parsed.orders))throw new Error('Invalid demo data');setState(parsed);}setError(false);}catch{setError(true);}setReady(true);};
 useEffect(()=>{load();const onStorage=(e:StorageEvent)=>{if(e.key===DEMO_KEY)load();};window.addEventListener('storage',onStorage);return ()=>window.removeEventListener('storage',onStorage);},[]);
 const update=(action:string,fn:(s:MartState)=>MartState)=>{setState(prev=>{const next=fn(prev);if(next===prev)return prev;const date=new Date().toISOString();next.audit=[{id:crypto.randomUUID(),who:localStorage.getItem('scartigo_mart_role')??'Admin',action,date},...next.audit].slice(0,1000);try{localStorage.setItem(DEMO_KEY,JSON.stringify(next));setError(false);return next;}catch{toast.error('Unable to save. Browser storage may be full.');return prev;}});};
 useEffect(()=>{if(!ready||error)return;const due=state.offers.filter(o=>offerStatus(o)==='Active'&&!o.notified);const scheduled=state.notices.filter(n=>n.status==='Scheduled'&&new Date(n.date).getTime()<=Date.now());if(!due.length&&!scheduled.length)return;update('Activated scheduled offers and notifications',s=>({...s,offers:s.offers.map(o=>due.some(x=>x.id===o.id)?{...o,notified:true}:o),notices:[...due.map(o=>({id:crypto.randomUUID(),title:o.name,message:`${o.name} is now active in your Scartigo cart.`,audience:'All customers',date:new Date().toISOString(),status:'Sent' as const,sent:s.customers.length,opened:0})),...s.notices.map(n=>scheduled.some(x=>x.id===n.id)?{...n,status:'Sent' as const,sent:s.customers.filter(c=>n.audience==='All customers'||c.segment===n.audience).length}:n)]}));},[ready,state.offers,state.notices,error]);
 return <Context.Provider value={{state,update,ready,error,retry:load}}>{children}</Context.Provider>;
}
export function useMart(){const c=useContext(Context);if(!c)throw new Error('Mart provider is required');return c;}
