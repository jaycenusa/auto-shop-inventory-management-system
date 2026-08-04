import type { Part } from '../types/part'

export const SEED_PARTS: Part[] = [
  { id:"p1",  sku:"ENG-OIL-001", name:"Oil Filter",          category:"Engine",       stock:45, threshold:20, reorderQty:100, unitPrice:8.99,   markupPct:40, labourCost:20,  supplier:"Bosch",    location:"A1-01", autoReorder:true },
  { id:"p2",  sku:"ENG-AIR-002", name:"Air Filter",          category:"Engine",       stock:12, threshold:15, reorderQty:60,  unitPrice:14.50,  markupPct:40, labourCost:15,  supplier:"K&N",      location:"A1-02", autoReorder:true },
  { id:"p3",  sku:"ENG-SPK-003", name:"Spark Plug Set (4)",  category:"Engine",       stock:8,  threshold:20, reorderQty:80,  unitPrice:22.00,  markupPct:35, labourCost:60,  supplier:"NGK",      location:"A1-03", autoReorder:false },
  { id:"p4",  sku:"ENG-TIM-004", name:"Timing Belt",         category:"Engine",       stock:3,  threshold:10, reorderQty:25,  unitPrice:65.00,  markupPct:30, labourCost:180, supplier:"Gates",    location:"A2-01", autoReorder:true },
  { id:"p5",  sku:"BRK-PAD-005", name:"Brake Pads (Front)",  category:"Brakes",       stock:28, threshold:15, reorderQty:50,  unitPrice:38.00,  markupPct:40, labourCost:80,  supplier:"Brembo",   location:"B1-01", autoReorder:true },
  { id:"p6",  sku:"BRK-ROT-006", name:"Brake Rotor (Front)", category:"Brakes",       stock:0,  threshold:8,  reorderQty:20,  unitPrice:72.00,  markupPct:35, labourCost:100, supplier:"Brembo",   location:"B1-02", autoReorder:false },
  { id:"p7",  sku:"BRK-FLD-007", name:"Brake Fluid DOT4",    category:"Brakes",       stock:6,  threshold:10, reorderQty:30,  unitPrice:9.50,   markupPct:50, labourCost:40,  supplier:"Prestone", location:"B2-01", autoReorder:true },
  { id:"p8",  sku:"SUS-SHK-008", name:"Shock Absorber (F)",  category:"Suspension",   stock:14, threshold:8,  reorderQty:20,  unitPrice:120.00, markupPct:30, labourCost:120, supplier:"Monroe",   location:"C1-01", autoReorder:false },
  { id:"p9",  sku:"SUS-ARM-009", name:"Control Arm (F-L)",   category:"Suspension",   stock:5,  threshold:6,  reorderQty:12,  unitPrice:95.00,  markupPct:25, labourCost:140, supplier:"Moog",     location:"C1-02", autoReorder:false },
  { id:"p10", sku:"ELC-ALT-010", name:"Alternator 90A",      category:"Electrical",   stock:4,  threshold:5,  reorderQty:10,  unitPrice:185.00, markupPct:25, labourCost:100, supplier:"Denso",    location:"D1-01", autoReorder:false },
  { id:"p11", sku:"ELC-BAT-011", name:"Car Battery 60Ah",    category:"Electrical",   stock:18, threshold:10, reorderQty:20,  unitPrice:95.00,  markupPct:30, labourCost:30,  supplier:"Varta",    location:"D1-02", autoReorder:true },
  { id:"p12", sku:"ELC-STR-012", name:"Starter Motor",       category:"Electrical",   stock:2,  threshold:4,  reorderQty:8,   unitPrice:145.00, markupPct:25, labourCost:90,  supplier:"Bosch",    location:"D2-01", autoReorder:false },
  { id:"p13", sku:"TRN-FLD-013", name:"Trans. Fluid ATF",    category:"Transmission", stock:32, threshold:15, reorderQty:60,  unitPrice:12.00,  markupPct:45, labourCost:60,  supplier:"Castrol",  location:"E1-01", autoReorder:true },
  { id:"p14", sku:"TRN-CLT-014", name:"Clutch Kit",          category:"Transmission", stock:7,  threshold:5,  reorderQty:10,  unitPrice:220.00, markupPct:25, labourCost:400, supplier:"LUK",      location:"E1-02", autoReorder:false },
  { id:"p15", sku:"ENG-WTP-015", name:"Water Pump",          category:"Engine",       stock:9,  threshold:6,  reorderQty:15,  unitPrice:68.00,  markupPct:30, labourCost:150, supplier:"Gates",    location:"A3-01", autoReorder:false },
  { id:"p16", sku:"ENG-THS-016", name:"Thermostat",          category:"Engine",       stock:22, threshold:12, reorderQty:30,  unitPrice:18.00,  markupPct:35, labourCost:80,  supplier:"Wahler",   location:"A3-02", autoReorder:true },
  { id:"p17", sku:"BRK-CAL-017", name:"Brake Caliper (F-L)", category:"Brakes",       stock:0,  threshold:4,  reorderQty:8,   unitPrice:88.00,  markupPct:30, labourCost:120, supplier:"TRW",      location:"B3-01", autoReorder:false },
  { id:"p18", sku:"SUS-BLJ-018", name:"Ball Joint (Front)",  category:"Suspension",   stock:11, threshold:8,  reorderQty:16,  unitPrice:42.00,  markupPct:35, labourCost:90,  supplier:"Moog",     location:"C2-01", autoReorder:false },
  { id:"p19", sku:"ELC-FUS-019", name:"Fuse Box Kit",        category:"Electrical",   stock:25, threshold:10, reorderQty:20,  unitPrice:28.00,  markupPct:35, labourCost:60,  supplier:"Hella",    location:"D3-01", autoReorder:true },
  { id:"p20", sku:"ENG-GKT-020", name:"Head Gasket Set",     category:"Engine",       stock:6,  threshold:5,  reorderQty:10,  unitPrice:110.00, markupPct:25, labourCost:600, supplier:"Elring",   location:"A4-01", autoReorder:false },
]
