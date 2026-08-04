import type { ReorderEntry } from '../types/reorder-entry'

export const SEED_REORDERS: ReorderEntry[] = [
  { id:"r1", partId:"p6",  partSku:"BRK-ROT-006", partName:"Brake Rotor (Front)",  quantity:20, supplier:"Brembo",  unitCost:72.00,  status:"pending",   type:"manual", createdAt:"2026-07-13" },
  { id:"r2", partId:"p4",  partSku:"ENG-TIM-004", partName:"Timing Belt",          quantity:25, supplier:"Gates",   unitCost:65.00,  status:"ordered",   type:"auto",   createdAt:"2026-07-12" },
  { id:"r3", partId:"p3",  partSku:"ENG-SPK-003", partName:"Spark Plug Set (4)",   quantity:80, supplier:"NGK",     unitCost:22.00,  status:"pending",   type:"manual", createdAt:"2026-07-14" },
  { id:"r4", partId:"p2",  partSku:"ENG-AIR-002", partName:"Air filter",           quantity:60, supplier:"K&N",     unitCost:14.50,  status:"delivered", type:"auto",   createdAt:"2026-07-05", deliveredAt:"2026-07-10" },
  { id:"r5", partId:"p12", partSku:"ELC-STR-012", partName:"Starter Motor",        quantity:8,  supplier:"Bosch",   unitCost:145.00, status:"pending",   type:"manual", createdAt:"2026-07-14" },
  { id:"r6", partId:"p10", partSku:"ELC-ALT-010", partName:"Alternator 90A",       quantity:10, supplier:"Denso",   unitCost:185.00, status:"ordered",   type:"manual", createdAt:"2026-07-11" },
  { id:"r7", partId:"p17", partSku:"BRK-CAL-017", partName:"Brake Caliper (F-L)",  quantity:8,  supplier:"TRW",     unitCost:88.00,  status:"delivered", type:"manual", createdAt:"2026-07-02", deliveredAt:"2026-07-08" },
]
