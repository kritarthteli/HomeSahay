const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/customers
router.get('/', async (req, res) => {
  try {
    const custRes = await pool.query(`SELECT * FROM customers ORDER BY name ASC;`);
    const addrRes = await pool.query(`SELECT * FROM customer_addresses;`);

    const addressesByCustomer = {};
    for (const a of addrRes.rows) {
      if (!addressesByCustomer[a.customer_id]) {
        addressesByCustomer[a.customer_id] = [];
      }
      addressesByCustomer[a.customer_id].push({
        id: a.id,
        label: a.label,
        address: a.address,
        isDefault: a.is_default,
      });
    }

    const customers = custRes.rows.map((c) => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar_url || 'https://i.pravatar.cc/150?img=48',
      location: {
        latitude: parseFloat(c.latitude) || 12.9416,
        longitude: parseFloat(c.longitude) || 77.5661,
      },
      address: c.primary_address,
      phone: c.phone,
      rating: parseFloat(c.rating) || 5.0,
      totalOrders: parseInt(c.total_orders, 10) || 0,
      email: c.email,
      gender: c.gender,
      sahayCash: parseFloat(c.sahay_cash) || 0,
      savedAddresses: addressesByCustomer[c.id] || [],
    }));

    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const custRes = await pool.query(`SELECT * FROM customers WHERE id = $1;`, [id]);
    if (custRes.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const c = custRes.rows[0];
    const addrRes = await pool.query(`SELECT * FROM customer_addresses WHERE customer_id = $1;`, [id]);

    const customer = {
      id: c.id,
      name: c.name,
      avatar: c.avatar_url,
      location: {
        latitude: parseFloat(c.latitude) || 12.9416,
        longitude: parseFloat(c.longitude) || 77.5661,
      },
      address: c.primary_address,
      phone: c.phone,
      rating: parseFloat(c.rating),
      totalOrders: parseInt(c.total_orders, 10),
      email: c.email,
      gender: c.gender,
      sahayCash: parseFloat(c.sahay_cash),
      savedAddresses: addrRes.rows.map((a) => ({
        id: a.id,
        label: a.label,
        address: a.address,
        isDefault: a.is_default,
      })),
    };

    res.json(customer);
  } catch (err) {
    console.error('Error fetching customer by id:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, sahayCash } = req.body;

    const query = `
      UPDATE customers
      SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        primary_address = COALESCE($4, primary_address),
        sahay_cash = COALESCE($5, sahay_cash)
      WHERE id = $6
      RETURNING *;
    `;
    const result = await pool.query(query, [name, phone, email, address, sahayCash, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customers (Registration)
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { name, phone, email, address, gender = 'Other', latitude = 12.9416, longitude = 77.5661 } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    const id = `c${Date.now()}`;
    const avatarUrl = `https://i.pravatar.cc/150?u=${encodeURIComponent(id)}`;

    const insertCustomerQuery = `
      INSERT INTO customers (
        id, name, phone, email, avatar_url, gender, rating,
        total_orders, sahay_cash, latitude, longitude, primary_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, 5.0, 0, 100.00, $7, $8, $9)
      RETURNING *;
    `;
    const custRes = await client.query(insertCustomerQuery, [
      id,
      name.trim(),
      phone.trim(),
      email ? email.trim() : null,
      avatarUrl,
      gender,
      parseFloat(latitude) || 12.9416,
      parseFloat(longitude) || 77.5661,
      address ? address.trim() : 'JP Nagar, Bengaluru',
    ]);

    const addrId = `a${Date.now()}`;
    await client.query(
      `INSERT INTO customer_addresses (id, customer_id, label, address, is_default)
       VALUES ($1, $2, 'home', $3, true);`,
      [addrId, id, address ? address.trim() : 'JP Nagar, Bengaluru']
    );

    await client.query('COMMIT');

    const created = custRes.rows[0];
    res.status(201).json({
      id: created.id,
      name: created.name,
      phone: created.phone,
      email: created.email,
      avatar: created.avatar_url,
      gender: created.gender,
      rating: 5.0,
      totalOrders: 0,
      sahayCash: 100.0,
      address: created.primary_address,
      location: {
        latitude: parseFloat(created.latitude),
        longitude: parseFloat(created.longitude),
      },
      savedAddresses: [
        { id: addrId, label: 'home', address: created.primary_address, isDefault: true },
      ],
      message: 'Customer registered successfully in PostgreSQL',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error registering customer:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST /api/customers/:id/addresses (Add address)
router.post('/:id/addresses', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { label = 'home', address, isDefault = false } = req.body;

    if (!address || !address.trim()) {
      return res.status(400).json({ error: 'Address text is required.' });
    }

    const addrId = `a${Date.now()}`;

    // Check existing address count for this customer
    const countRes = await client.query(
      `SELECT COUNT(*) FROM customer_addresses WHERE customer_id = $1;`,
      [id]
    );
    const count = parseInt(countRes.rows[0].count, 10);
    const shouldBeDefault = isDefault || count === 0;

    if (shouldBeDefault) {
      await client.query(
        `UPDATE customer_addresses SET is_default = false WHERE customer_id = $1;`,
        [id]
      );
    }

    const insertRes = await client.query(
      `INSERT INTO customer_addresses (id, customer_id, label, address, is_default)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [addrId, id, label.toLowerCase().trim(), address.trim(), shouldBeDefault]
    );

    if (shouldBeDefault) {
      await client.query(
        `UPDATE customers SET primary_address = $1 WHERE id = $2;`,
        [address.trim(), id]
      );
    }

    // Fetch all current addresses
    const all = await client.query(
      `SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY is_default DESC, id ASC;`,
      [id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      address: {
        id: insertRes.rows[0].id,
        label: insertRes.rows[0].label,
        address: insertRes.rows[0].address,
        isDefault: insertRes.rows[0].is_default,
      },
      savedAddresses: all.rows.map((a) => ({
        id: a.id,
        label: a.label,
        address: a.address,
        isDefault: a.is_default,
      })),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding customer address:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/customers/:id/addresses/:addressId (Delete address)
router.delete('/:id/addresses/:addressId', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id, addressId } = req.params;

    // Check if the address exists
    const findRes = await client.query(
      `SELECT * FROM customer_addresses WHERE customer_id = $1 AND id = $2;`,
      [id, addressId]
    );

    if (findRes.rows.length > 0) {
      await client.query(
        `DELETE FROM customer_addresses WHERE customer_id = $1 AND id = $2;`,
        [id, addressId]
      );
    } else {
      // If client sent 'default' or didn't find exact id, check if customer primary_address matched
      if (addressId === 'default' || addressId.startsWith('addr_')) {
        await client.query(`UPDATE customers SET primary_address = '' WHERE id = $1;`, [id]);
      }
    }

    // Fetch remaining addresses
    const all = await client.query(
      `SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY is_default DESC, id ASC;`,
      [id]
    );

    let remaining = all.rows;

    if (remaining.length > 0) {
      const hasDefault = remaining.some((a) => a.is_default);
      if (!hasDefault) {
        await client.query(
          `UPDATE customer_addresses SET is_default = true WHERE id = $1;`,
          [remaining[0].id]
        );
        remaining[0].is_default = true;
      }
      const defaultAddr = remaining.find((a) => a.is_default) || remaining[0];
      await client.query(
        `UPDATE customers SET primary_address = $1 WHERE id = $2;`,
        [defaultAddr.address, id]
      );
    } else {
      await client.query(
        `UPDATE customers SET primary_address = '' WHERE id = $1;`,
        [id]
      );
    }

    await client.query('COMMIT');

    res.json({
      message: 'Address deleted successfully',
      savedAddresses: remaining.map((a) => ({
        id: a.id,
        label: a.label,
        address: a.address,
        isDefault: a.is_default,
      })),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting address:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
