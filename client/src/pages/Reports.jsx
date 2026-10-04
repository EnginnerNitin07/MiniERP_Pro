import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Boxes,
  ShoppingCart,
  Truck,
  Users,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { get } from '../lib/api';

const money = (value) =>
  '₹' + Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadReports() {
      try {
        setLoading(true);
        setError('');

        const [dashboardData, salesData, purchaseData, productData] =
          await Promise.all([
            get('/dashboard'),
            get('/sales'),
            get('/purchases'),
            get('/products'),
          ]);

        if (!mounted) return;
        setDashboard(dashboardData);
        setSales(Array.isArray(salesData) ? salesData : []);
        setPurchases(Array.isArray(purchaseData) ? purchaseData : []);
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (err) {
        if (mounted) setError(err?.message || 'Unable to load reports.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadReports();

    return () => {
      mounted = false;
    };
  }, []);

  const metrics = dashboard?.metrics || {};

  const totalSales = useMemo(
    () => sales.reduce((sum, row) => sum + Number(row.amount || row.total || 0), 0),
    [sales]
  );

  const totalPurchases = useMemo(
    () => purchases.reduce((sum, row) => sum + Number(row.amount || row.total || 0), 0),
    [purchases]
  );

  const revenue = sales.length ? totalSales : Number(metrics.revenue || 0);
  const purchaseCost = purchases.length
    ? totalPurchases
    : Number(metrics.expenses || 0);
  const netCashFlow = revenue - purchaseCost;

  const lowStock = products.length
    ? products.filter((p) => Number(p.stock || 0) <= Number(p.reorder_level || 0)).length
    : Number(metrics.lowStock || 0);

  const cards = [
    { label: 'Total Sales', value: money(revenue), icon: TrendingUp, tone: 'purple' },
    { label: 'Total Purchases', value: money(purchaseCost), icon: ShoppingCart, tone: 'orange' },
    { label: 'Net Cash Flow', value: money(netCashFlow), icon: Wallet, tone: 'green' },
    { label: 'Low Stock Items', value: lowStock, icon: AlertTriangle, tone: 'red' },
  ];

  if (loading) {
    return <div className="loading page">Loading reports...</div>;
  }

  if (error) {
    return (
      <div className="page">
        <div className="alert">{error}</div>
      </div>
    );
  }

  return (
    <div className="page reports-page">
      <div className="page-head reports-head">
        <div>
          <span className="eyebrow">ANALYTICS</span>
          <h2>Reports</h2>
          <p>Monitor sales, purchases, inventory and customer performance.</p>
        </div>
        <button className="secondary" onClick={() => window.print()}>
          <Download size={16} />
          Export / Print
        </button>
      </div>

      <div className="report-summary-grid">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div className="report-summary-card" key={label}>
            <div className={`report-summary-icon ${tone}`}>
              <Icon size={20} />
            </div>
            <div className="report-summary-copy">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="reports-content-grid">
        <section className="report-panel">
          <div className="report-panel-head">
            <div>
              <h3>Business Summary</h3>
              <p>Current database overview</p>
            </div>
            <BarChart3 size={20} />
          </div>

          <div className="business-summary-grid">
            <div className="business-stat">
              <div className="business-stat-icon"><Boxes size={18} /></div>
              <div><span>Products</span><strong>{products.length || metrics.products || 0}</strong></div>
            </div>
            <div className="business-stat">
              <div className="business-stat-icon"><Users size={18} /></div>
              <div><span>Customers</span><strong>{metrics.customers || 0}</strong></div>
            </div>
            <div className="business-stat">
              <div className="business-stat-icon"><ShoppingCart size={18} /></div>
              <div><span>Sales Transactions</span><strong>{sales.length}</strong></div>
            </div>
            <div className="business-stat">
              <div className="business-stat-icon"><Truck size={18} /></div>
              <div><span>Purchase Transactions</span><strong>{purchases.length}</strong></div>
            </div>
          </div>
        </section>

        <section className="report-panel financial-panel">
          <div className="report-panel-head">
            <div>
              <h3>Financial Summary</h3>
              <p>Sales vs purchases</p>
            </div>
            <TrendingUp size={20} />
          </div>

          <div className="financial-list">
            <div className="financial-row">
              <span>Revenue from Sales</span>
              <strong>{money(revenue)}</strong>
            </div>
            <div className="financial-row">
              <span>Purchase Cost</span>
              <strong>{money(purchaseCost)}</strong>
            </div>
            <div className="financial-row highlight">
              <span>Net Cash Flow</span>
              <strong>{money(netCashFlow)}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}