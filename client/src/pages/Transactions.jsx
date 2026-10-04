import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { SearchBox, Table } from '../components/Table';
import { get, post, del } from '../lib/api';

export default function Transactions({ type, customers, suppliers }) {
  const sales = type === 'sales';
  const endpoint = sales ? '/sales' : '/purchases';
  const title = sales ? 'Sales' : 'Purchases';
  const singular = sales ? 'Sale' : 'Purchase';

  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const data = await get(endpoint);
      setRows(data);
    } catch (error) {
      console.error(`Failed to load ${title.toLowerCase()}:`, error);
    }
  };

  // Important:
  // Do not use useEffect(load, []) because load returns a Promise.
  useEffect(() => {
    load();
  }, [endpoint]);

  const submit = async (e) => {
  e.preventDefault();

  const form = e.currentTarget;
  const d = Object.fromEntries(new FormData(form));

  d.amount = Number(d.amount);

  try {
    await post(endpoint, d);

    // Reset the form BEFORE closing the modal
    form.reset();

    // Now close the modal
    setOpen(false);

    // Reload the transaction list
    await load();
  } catch (error) {
    console.error(
      `Failed to create ${singular.toLowerCase()}:`,
      error
    );
  }
};

  const columns = sales
    ? [
        {
          key: 'invoice_no',
          label: 'Invoice',
        },
        {
          key: 'customer',
          label: 'Customer',
          render: (r) => r.customer || 'Walk-in',
        },
        {
          key: 'amount',
          label: 'Amount',
          render: (r) =>
            '₹' + Number(r.amount).toLocaleString('en-IN'),
        },
        {
          key: 'status',
          label: 'Status',
          render: (r) => (
            <span className={'badge ' + r.status.toLowerCase()}>
              {r.status}
            </span>
          ),
        },
        {
          key: 'date',
          label: 'Date',
        },
      ]
    : [
        {
          key: 'reference_no',
          label: 'Reference',
        },
        {
          key: 'supplier',
          label: 'Supplier',
          render: (r) => r.supplier || '—',
        },
        {
          key: 'amount',
          label: 'Amount',
          render: (r) =>
            '₹' + Number(r.amount).toLocaleString('en-IN'),
        },
        {
          key: 'status',
          label: 'Status',
          render: (r) => (
            <span className={'badge ' + r.status.toLowerCase()}>
              {r.status}
            </span>
          ),
        },
        {
          key: 'date',
          label: 'Date',
        },
      ];

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) {
      return;
    }

    try {
      await del(endpoint + '/' + id);
      await load();
    } catch (error) {
      console.error(
        `Failed to delete ${singular.toLowerCase()}:`,
        error
      );
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">TRANSACTIONS</span>

          <h2>{title}</h2>

          <p>
            Track and manage business {title.toLowerCase()} in one place.
          </p>
        </div>

        <button
          className="primary"
          onClick={() => setOpen(true)}
        >
          <Plus size={17} />
          Add {singular}
        </button>
      </div>

      <div className="panel">
        <div className="panel-toolbar">
          <div>
            <b>{rows.length} records</b>
            <span>Latest first</span>
          </div>

          <SearchBox
            value={search}
            onChange={setSearch}
          />
        </div>

        <Table
          columns={columns}
          rows={rows}
          search={search}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={'Add ' + singular}
      >
        <form
          className="form"
          onSubmit={submit}
        >
          <label>
            {sales ? 'Invoice Number' : 'Reference Number'}

            <input
              name={sales ? 'invoice_no' : 'reference_no'}
              required
              placeholder={sales ? 'INV-1007' : 'PO-9004'}
            />
          </label>

          <label>
            {sales ? 'Customer' : 'Supplier'}

            <select
              name={sales ? 'customer_id' : 'supplier_id'}
            >
              <option value="">
                Select {sales ? 'customer' : 'supplier'}
              </option>

              {(sales ? customers : suppliers).map((x) => (
                <option
                  key={x.id}
                  value={x.id}
                >
                  {x.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Amount

            <input
              name="amount"
              type="number"
              min="1"
              step="0.01"
              required
            />
          </label>

          <label>
            Status

            <select name="status">
              <option>
                {sales ? 'Paid' : 'Received'}
              </option>

              <option>Pending</option>
            </select>
          </label>

          <label>
            Date

            <input
              name="date"
              type="date"
              required
              defaultValue={new Date()
                .toISOString()
                .slice(0, 10)}
            />
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>

            <button
              className="primary"
              type="submit"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}