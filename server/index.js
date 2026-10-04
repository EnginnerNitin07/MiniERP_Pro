import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'erp.db'));
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

const schema = `
CREATE TABLE IF NOT EXISTS products (
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, sku TEXT UNIQUE NOT NULL,
 category TEXT NOT NULL, price REAL NOT NULL DEFAULT 0, stock INTEGER NOT NULL DEFAULT 0,
 reorder_level INTEGER NOT NULL DEFAULT 5, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS customers (
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT, phone TEXT, city TEXT,
 total_spent REAL NOT NULL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS suppliers (
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT, phone TEXT, city TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS employees (
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, role TEXT NOT NULL, department TEXT NOT NULL,
 salary REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'Active', created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS expenses (
 id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT NOT NULL, amount REAL NOT NULL,
 date TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sales (
 id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_no TEXT UNIQUE NOT NULL, customer_id INTEGER,
 amount REAL NOT NULL, status TEXT NOT NULL DEFAULT 'Paid', date TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS purchases (
 id INTEGER PRIMARY KEY AUTOINCREMENT, reference_no TEXT UNIQUE NOT NULL, supplier_id INTEGER,
 amount REAL NOT NULL, status TEXT NOT NULL DEFAULT 'Received', date TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);`;
db.exec(schema);

const count = db.prepare('SELECT COUNT(*) c FROM products').get().c;
if (!count) {
  const seed = db.transaction(() => {
    const p = db.prepare('INSERT INTO products(name,sku,category,price,stock,reorder_level) VALUES (?,?,?,?,?,?)');
    [
      ['Wireless Keyboard','KB-1001','Accessories',2499,32,10],['Mechanical Mouse','MS-2002','Accessories',1899,18,8],
      ['USB-C Hub','HB-3003','Accessories',3299,7,10],['27-inch Monitor','MN-4004','Displays',21999,14,5],
      ['Laptop Stand','LS-5005','Office',1599,42,12],['Web Camera','WC-6006','Accessories',4499,5,8],
      ['Noise Cancelling Headset','HS-7007','Audio',6999,21,6],['Portable SSD 1TB','SD-8008','Storage',8499,11,5]
    ].forEach(x=>p.run(...x));
    const c = db.prepare('INSERT INTO customers(name,email,phone,city,total_spent) VALUES (?,?,?,?,?)');
    const customers = [
      ['Aarav Mehta','aarav@example.com','9876500011','Mumbai',0],['Priya Shah','priya@example.com','9876500012','Pune',0],
      ['Rahul Verma','rahul@example.com','9876500013','Delhi',0],['Sneha Iyer','sneha@example.com','9876500014','Bengaluru',0],['Kabir Rao','kabir@example.com','9876500015','Hyderabad',0]
    ]; customers.forEach(x=>c.run(...x));
    const s = db.prepare('INSERT INTO suppliers(name,email,phone,city) VALUES (?,?,?,?)');
    [['TechSource India','sales@techsource.test','9000001001','Mumbai'],['Prime Components','hello@prime.test','9000001002','Delhi'],['Nova Distributors','orders@nova.test','9000001003','Bengaluru']].forEach(x=>s.run(...x));
    const e = db.prepare('INSERT INTO employees(name,role,department,salary,status) VALUES (?,?,?,?,?)');
    [['Riya Kapoor','Finance Manager','Finance',78000,'Active'],['Arjun Nair','Sales Executive','Sales',52000,'Active'],['Karan Singh','Operations Lead','Operations',68000,'Active'],['Meera Joshi','HR Executive','HR',48000,'On Leave'],['Dev Patel','Inventory Analyst','Operations',55000,'Active']].forEach(x=>e.run(...x));
    const ex = db.prepare('INSERT INTO expenses(title,category,amount,date) VALUES (?,?,?,?)');
    [['Office Utilities','Utilities',18500,'2026-08-03'],['Cloud Software','Technology',12000,'2026-08-07'],['Warehouse Transport','Operations',22400,'2026-08-12'],['Marketing Campaign','Marketing',31500,'2026-08-18'],['Office Supplies','Facilities',7200,'2026-08-22']].forEach(x=>ex.run(...x));
    const sa = db.prepare('INSERT INTO sales(invoice_no,customer_id,amount,status,date) VALUES (?,?,?,?,?)');
    [['INV-1001',1,48600,'Paid','2026-08-02'],['INV-1002',2,27500,'Paid','2026-08-06'],['INV-1003',3,63200,'Pending','2026-08-11'],['INV-1004',4,34900,'Paid','2026-08-16'],['INV-1005',1,51800,'Paid','2026-08-21'],['INV-1006',5,22700,'Paid','2026-08-24']].forEach(x=>sa.run(...x));
    db.prepare(`UPDATE customers SET total_spent=COALESCE((SELECT SUM(amount) FROM sales WHERE sales.customer_id=customers.id AND status='Paid'),0)`).run();
    const pu = db.prepare('INSERT INTO purchases(reference_no,supplier_id,amount,status,date) VALUES (?,?,?,?,?)');
    [['PO-9001',1,68500,'Received','2026-08-04'],['PO-9002',2,94200,'Received','2026-08-10'],['PO-9003',3,47800,'Pending','2026-08-20']].forEach(x=>pu.run(...x));
  }); seed();
}

const app = express();
app.use(cors()); app.use(express.json());
const ok = (res,data)=>res.json(data);
const fail = (res,e)=>res.status(400).json({error:e.message});

app.get('/api/health',(req,res)=>ok(res,{status:'ok',time:new Date().toISOString()}));
app.get('/api/dashboard',(req,res)=>{
  const revenue=db.prepare("SELECT COALESCE(SUM(amount),0) v FROM sales WHERE status='Paid'").get().v;
  const expenses=db.prepare('SELECT COALESCE(SUM(amount),0) v FROM expenses').get().v;
  const purchases=db.prepare('SELECT COALESCE(SUM(amount),0) v FROM purchases WHERE status=\'Received\'').get().v;
  const customers=db.prepare('SELECT COUNT(*) v FROM customers').get().v;
  const products=db.prepare('SELECT COUNT(*) v FROM products').get().v;
  const lowStock=db.prepare('SELECT COUNT(*) v FROM products WHERE stock<=reorder_level').get().v;
  const employees=db.prepare("SELECT COUNT(*) v FROM employees WHERE status='Active'").get().v;
  const recent=db.prepare(`SELECT sales.*, customers.name customer FROM sales LEFT JOIN customers ON customers.id=sales.customer_id ORDER BY sales.date DESC, sales.id DESC LIMIT 6`).all();
  const trend=db.prepare(`SELECT substr(date,1,7) month, SUM(CASE WHEN status='Paid' THEN amount ELSE 0 END) revenue FROM sales GROUP BY substr(date,1,7) ORDER BY month`).all();
  const profit=revenue-expenses;
  ok(res,{metrics:{revenue,expenses,profit,purchases,customers,products,lowStock,employees,margin:revenue?profit/revenue*100:0},recent,trend});
});

const resources={
 products:{table:'products',fields:['name','sku','category','price','stock','reorder_level'],order:'id DESC'},
 customers:{table:'customers',fields:['name','email','phone','city'],order:'id DESC'},
 suppliers:{table:'suppliers',fields:['name','email','phone','city'],order:'id DESC'},
 employees:{table:'employees',fields:['name','role','department','salary','status'],order:'id DESC'},
 expenses:{table:'expenses',fields:['title','category','amount','date'],order:'date DESC, id DESC'}
};
for (const [key,cfg] of Object.entries(resources)) {
  app.get(`/api/${key}`,(req,res)=>ok(res,db.prepare(`SELECT * FROM ${cfg.table} ORDER BY ${cfg.order}`).all()));
  app.post(`/api/${key}`,(req,res)=>{try{const vals=cfg.fields.map(f=>req.body[f]); if(cfg.fields.some((f,i)=>['name','sku','title','category','role','department','amount','date'].includes(f)&& (vals[i]===undefined||vals[i]===''))) throw new Error('Please fill all required fields'); const q=`INSERT INTO ${cfg.table}(${cfg.fields.join(',')}) VALUES (${cfg.fields.map(()=>'?').join(',')})`; const r=db.prepare(q).run(...vals); ok(res,{id:r.lastInsertRowid});}catch(e){fail(res,e)}});
  app.delete(`/api/${key}/:id`,(req,res)=>{try{db.prepare(`DELETE FROM ${cfg.table} WHERE id=?`).run(req.params.id); ok(res,{success:true})}catch(e){fail(res,e)}});
}

app.get('/api/sales',(req,res)=>ok(res,db.prepare(`SELECT sales.*, customers.name customer FROM sales LEFT JOIN customers ON customers.id=sales.customer_id ORDER BY date DESC,id DESC`).all()));
app.post('/api/sales',(req,res)=>{try{const {invoice_no,customer_id,amount,status='Paid',date}=req.body;if(!invoice_no||!amount||!date)throw new Error('Invoice, amount and date are required');const tx=db.transaction(()=>{const r=db.prepare('INSERT INTO sales(invoice_no,customer_id,amount,status,date) VALUES (?,?,?,?,?)').run(invoice_no,customer_id||null,Number(amount),status,date); if(customer_id&&status==='Paid')db.prepare('UPDATE customers SET total_spent=total_spent+? WHERE id=?').run(Number(amount),customer_id);return r.lastInsertRowid});ok(res,{id:tx()})}catch(e){fail(res,e)}});
app.delete('/api/sales/:id',(req,res)=>{try{const old=db.prepare('SELECT * FROM sales WHERE id=?').get(req.params.id);db.transaction(()=>{if(old?.customer_id&&old.status==='Paid')db.prepare('UPDATE customers SET total_spent=MAX(total_spent-?,0) WHERE id=?').run(old.amount,old.customer_id);db.prepare('DELETE FROM sales WHERE id=?').run(req.params.id)})();ok(res,{success:true})}catch(e){fail(res,e)}});

app.get('/api/purchases',(req,res)=>ok(res,db.prepare(`SELECT purchases.*, suppliers.name supplier FROM purchases LEFT JOIN suppliers ON suppliers.id=purchases.supplier_id ORDER BY date DESC,id DESC`).all()));
app.post('/api/purchases',(req,res)=>{try{const {reference_no,supplier_id,amount,status='Received',date}=req.body;if(!reference_no||!amount||!date)throw new Error('Reference, amount and date are required');const r=db.prepare('INSERT INTO purchases(reference_no,supplier_id,amount,status,date) VALUES (?,?,?,?,?)').run(reference_no,supplier_id||null,Number(amount),status,date);ok(res,{id:r.lastInsertRowid})}catch(e){fail(res,e)}});
app.delete('/api/purchases/:id',(req,res)=>{try{db.prepare('DELETE FROM purchases WHERE id=?').run(req.params.id);ok(res,{success:true})}catch(e){fail(res,e)}});

app.listen(4000,()=>console.log('MiniERP API running on http://localhost:4000'));
