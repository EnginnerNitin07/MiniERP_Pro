import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Package, Users, Truck, UserRound, Receipt } from 'lucide-react';

import './styles.css';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Dashboard from './pages/Dashboard';
import CrudPage from './pages/CrudPage';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';

import { get } from './lib/api';


/* =========================================================
   CRUD CONFIGURATION
   ========================================================= */

const configs = {

    /* =========================
       PRODUCTS
       ========================= */

    products: {
        title: 'Products & inventory',
        subtitle: 'Keep products, pricing and stock levels under control.',
        singular: 'Product',
        endpoint: '/products',

        columns: [
            {
                key: 'name',
                label: 'Product'
            },

            {
                key: 'sku',
                label: 'SKU'
            },

            {
                key: 'category',
                label: 'Category'
            },

            {
                key: 'price',
                label: 'Price',
                render: (r) =>
                    '₹' +
                    Number(r?.price ?? 0).toLocaleString('en-IN')
            },

            {
                key: 'stock',
                label: 'Stock',

                render: (r) => {
                    const stock = Number(r?.stock ?? 0);
                    const reorderLevel = Number(
                        r?.reorder_level ?? 0
                    );

                    return (
                        <span
                            className={
                                stock <= reorderLevel
                                    ? 'stock low'
                                    : 'stock'
                            }
                        >
                            {stock}

                            {stock <= reorderLevel
                                ? ' · Low'
                                : ''}
                        </span>
                    );
                }
            },

            {
                key: 'reorder_level',
                label: 'Reorder at'
            }
        ],

        fields: [
            {
                name: 'name',
                label: 'Product name',
                placeholder: 'e.g. Wireless Keyboard'
            },

            {
                name: 'sku',
                label: 'SKU',
                placeholder: 'KB-1009'
            },

            {
                name: 'category',
                label: 'Category',
                placeholder: 'Accessories'
            },

            {
                name: 'price',
                label: 'Price',
                type: 'number'
            },

            {
                name: 'stock',
                label: 'Stock quantity',
                type: 'number'
            },

            {
                name: 'reorder_level',
                label: 'Reorder level',
                type: 'number'
            }
        ]
    },


    /* =========================
       CUSTOMERS
       ========================= */

    customers: {
        title: 'Customers',
        subtitle: 'Manage customer profiles and lifetime spending.',
        singular: 'Customer',
        endpoint: '/customers',

        columns: [
            {
                key: 'name',
                label: 'Customer'
            },

            {
                key: 'email',
                label: 'Email'
            },

            {
                key: 'phone',
                label: 'Phone'
            },

            {
                key: 'city',
                label: 'City'
            },

            {
                key: 'total_spent',
                label: 'Total spent',

                render: (r) =>
                    '₹' +
                    Number(
                        r?.total_spent ?? 0
                    ).toLocaleString('en-IN')
            }
        ],

        fields: [
            {
                name: 'name',
                label: 'Customer name'
            },

            {
                name: 'email',
                label: 'Email',
                type: 'email'
            },

            {
                name: 'phone',
                label: 'Phone'
            },

            {
                name: 'city',
                label: 'City'
            }
        ]
    },


    /* =========================
       SUPPLIERS
       ========================= */

    suppliers: {
        title: 'Suppliers',
        subtitle: 'Maintain your supplier directory and contacts.',
        singular: 'Supplier',
        endpoint: '/suppliers',

        columns: [
            {
                key: 'name',
                label: 'Supplier'
            },

            {
                key: 'email',
                label: 'Email'
            },

            {
                key: 'phone',
                label: 'Phone'
            },

            {
                key: 'city',
                label: 'City'
            }
        ],

        fields: [
            {
                name: 'name',
                label: 'Supplier name'
            },

            {
                name: 'email',
                label: 'Email',
                type: 'email'
            },

            {
                name: 'phone',
                label: 'Phone'
            },

            {
                name: 'city',
                label: 'City'
            }
        ]
    },


    /* =========================
       EMPLOYEES
       ========================= */

    employees: {
        title: 'Employees',
        subtitle: 'Keep a simple record of your team and payroll.',
        singular: 'Employee',
        endpoint: '/employees',

        columns: [
            {
                key: 'name',
                label: 'Employee'
            },

            {
                key: 'role',
                label: 'Role'
            },

            {
                key: 'department',
                label: 'Department'
            },

            {
                key: 'salary',
                label: 'Salary',

                render: (r) =>
                    '₹' +
                    Number(
                        r?.salary ?? 0
                    ).toLocaleString('en-IN')
            },

            {
                key: 'status',
                label: 'Status',

                render: (r) => (
                    <span
                        className={
                            'badge ' +
                            String(
                                r?.status ?? ''
                            )
                                .toLowerCase()
                                .replace(' ', '-')
                        }
                    >
                        {r?.status ?? '-'}
                    </span>
                )
            }
        ],

        fields: [
            {
                name: 'name',
                label: 'Employee name'
            },

            {
                name: 'role',
                label: 'Role'
            },

            {
                name: 'department',
                label: 'Department'
            },

            {
                name: 'salary',
                label: 'Salary',
                type: 'number'
            },

            {
                name: 'status',
                label: 'Status',
                defaultValue: 'Active'
            }
        ]
    },


    /* =========================
       EXPENSES
       ========================= */

    expenses: {
        title: 'Expenses',
        subtitle: 'Record operating costs and monitor spending.',
        singular: 'Expense',
        endpoint: '/expenses',

        columns: [
            {
                key: 'title',
                label: 'Expense'
            },

            {
                key: 'category',
                label: 'Category'
            },

            {
                key: 'amount',
                label: 'Amount',

                render: (r) =>
                    '₹' +
                    Number(
                        r?.amount ?? 0
                    ).toLocaleString('en-IN')
            },

            {
                key: 'date',
                label: 'Date'
            }
        ],

        fields: [
            {
                name: 'title',
                label: 'Expense title'
            },

            {
                name: 'category',
                label: 'Category'
            },

            {
                name: 'amount',
                label: 'Amount',
                type: 'number'
            },

            {
                name: 'date',
                label: 'Date',
                type: 'date',

                defaultValue:
                    new Date()
                        .toISOString()
                        .slice(0, 10)
            }
        ]
    }
};


/* =========================================================
   APP
   ========================================================= */

function App() {

    const [page, setPage] =
        useState('dashboard');

    const [side, setSide] =
        useState(false);

    const [customers, setCustomers] =
        useState([]);

    const [suppliers, setSuppliers] =
        useState([]);

    const [dark, setDark] =
        useState(false);


    /* =====================================================
       LOAD CUSTOMERS AND SUPPLIERS
       ===================================================== */

    useEffect(() => {

        const loadCustomers = async () => {

            try {

                const data =
                    await get('/customers');

                setCustomers(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    'Failed to load customers:',
                    error
                );

                setCustomers([]);
            }
        };


        const loadSuppliers = async () => {

            try {

                const data =
                    await get('/suppliers');

                setSuppliers(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    'Failed to load suppliers:',
                    error
                );

                setSuppliers([]);
            }
        };


        loadCustomers();
        loadSuppliers();

    }, []);


    /* =====================================================
       DARK MODE
       ===================================================== */

    useEffect(() => {

        document.body.classList.toggle(
            'dark',
            dark
        );

    }, [dark]);


    /* =====================================================
       PAGE TITLES
       ===================================================== */

    const titles = {

        dashboard: 'Dashboard',

        products: 'Products',

        customers: 'Customers',

        suppliers: 'Suppliers',

        sales: 'Sales',

        purchases: 'Purchases',

        employees: 'Employees',

        expenses: 'Expenses',

        reports: 'Reports'

    };


    /* =====================================================
       PAGE CONTENT
       ===================================================== */

    let content;


    /* -------------------------
       DASHBOARD
       ------------------------- */

    if (page === 'dashboard') {

        content = (
            <Dashboard
                setPage={setPage}
            />
        );


    /* -------------------------
       REPORTS
       ------------------------- */

    } else if (page === 'reports') {

        content = (
            <Reports />
        );


    /* -------------------------
       SALES
       ------------------------- */

    } else if (page === 'sales') {

        content = (
            <Transactions
                type="sales"
                customers={customers}
            />
        );


    /* -------------------------
       PURCHASES
       ------------------------- */

    } else if (page === 'purchases') {

        content = (
            <Transactions
                type="purchases"
                suppliers={suppliers}
            />
        );


    /* -------------------------
       PRODUCTS / CUSTOMERS /
       SUPPLIERS / EMPLOYEES /
       EXPENSES
       ------------------------- */

    } else {

        content = (
            <CrudPage
                key={page}
                config={configs[page]}
            />
        );
    }


    /* =====================================================
       APPLICATION UI
       ===================================================== */

    return (

        <div className="app">

            <Sidebar
                page={page}
                setPage={setPage}
                open={side}
                setOpen={setSide}
            />


            <main>

                <Header
                    title={titles[page]}
                    onMenu={() =>
                        setSide(true)
                    }
                />


                <div className="theme-switch">

                    <button
                        onClick={() =>
                            setDark(
                                value =>
                                    !value
                            )
                        }
                    >
                        {dark
                            ? '☀ Light'
                            : '☾ Dark'}
                    </button>

                </div>


                {content}

            </main>

        </div>
    );
}


/* =========================================================
   START REACT
   ========================================================= */

createRoot(
    document.getElementById('root')
).render(
    <App />
);