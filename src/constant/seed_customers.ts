import type { Customer } from '../types/customer'

export const SEED_CUSTOMERS: Customer[] = [
  { id:"c1", name:"Marcus Webb",     email:"m.webb@autoshop.com",      phone:"+1 555-0101", company:"Webb Auto Repair",   totalOrders:47, lastOrder:"2026-07-10", totalSpent:12450, status:"active" },
  { id:"c2", name:"Sandra Kowalski", email:"s.kowalski@kservice.net",  phone:"+1 555-0102", company:"K & Sons Service",    totalOrders:23, lastOrder:"2026-07-08", totalSpent:5870,  status:"active" },
  { id:"c3", name:"James Oduya",     email:"james@premierparts.co",    phone:"+1 555-0103", company:"Premier parts Ltd.",  totalOrders:88, lastOrder:"2026-07-13", totalSpent:31200, status:"active" },
  { id:"c4", name:"Priya Natarajan", email:"p.nat@autofix.io",         phone:"+1 555-0104", company:"AutoFix Solutions",   totalOrders:15, lastOrder:"2026-06-22", totalSpent:3400,  status:"active" },
  { id:"c5", name:"Tom Gunderson",   email:"tg@roadready.com",         phone:"+1 555-0105", company:"Road Ready Garage",   totalOrders:62, lastOrder:"2026-07-11", totalSpent:18750, status:"active" },
  { id:"c6", name:"Leila Ahmadi",    email:"lahmadi@quicklube.net",    phone:"+1 555-0106", company:"Quick Lube Express",  totalOrders:9,  lastOrder:"2026-05-15", totalSpent:1200,  status:"inactive" },
  { id:"c7", name:"Cory Whitfield",  email:"c.whitfield@cwmotors.com", phone:"+1 555-0107", company:"CW Motors",           totalOrders:34, lastOrder:"2026-07-01", totalSpent:9800,  status:"active" },
  { id:"c8", name:"Nneka Obi",       email:"n.obi@centralgarage.net",  phone:"+1 555-0108", company:"Central Garage",      totalOrders:51, lastOrder:"2026-07-12", totalSpent:14300, status:"active" },
]
