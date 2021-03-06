'use strict';

const fs = require('fs');
const mysql = require('mysql2/promise');

/**
 * In the `worksheet` folder, make a module called `cardb.js`
 * that implements a simple database of cars, as defined below.
 *
 * The module exports three asynchronous functions:
 *  1. `saveCar` with the following parameters: `reg`, `make`,
 *     `model`, `year`, and `price`. The function stores
 *     the information in a suitable database table
 *     that you create.
 *
 *  2. `getAveragePrice` with one parameter: `year`.
 *     The function should return the average price of all known cars
 *     from the given year. In case of an error (such as that we don't
 *     have any cars from the given year) it should return `null`.
 *
 *  3. `shutdown` with no parameters. The function closes any connection(s)
 *     used by the module. Use `await connection.end()` – substitute the
 *     word `connection` with the name of your own variable initialized
 *     with the call to `mysql.createConnection()`.
 *
 * Put your database initialization SQL code in `worksheet/cardb_init.sql`.
 * Run the database initialization code in your MySQL so your database is ready for testing.
 *
 * Put your database configuration in `worksheet/config.json`.
 * Inside the `mysql` object in `config.json` you should have
 * an extra property called `table` which contains the name
 * of the database table where you store the information about cars,
 * so that our tests can inspect that.
 *
 * PLEASE NOTE THAT OUR TESTS WILL DELETE ALL EXISTING DATA from the table
 * of car information. For your testing, feel free to have an SQL script
 * or a JS script that puts in some testing data.
 */

/* global QUnit */
/* eslint-disable no-restricted-globals */


QUnit.test(
  'Create a file `worksheet/config.json`',
  (assert) => {
    try {
      fs.accessSync('./worksheet/config.json', fs.F_OK);
      assert.ok(true, '`worksheet/config.json` created');
    } catch (e) {
      assert.ok(false, '`worksheet/config.json` is missing - please create it');
    }

    const config = require('./worksheet/config.json'); // eslint-disable-line global-require
    assert.ok(config.mysql.table, '`worksheet/config.json` needs a property `table` within `mysql`');
  },
);


QUnit.test(
  'Create a file `worksheet/cardb_init.sql`',
  (assert) => {
    try {
      fs.accessSync('./worksheet/cardb_init.sql', fs.F_OK);
      assert.ok(true, '`worksheet/cardb_init.sql` created');
    } catch (e) {
      assert.ok(false, '`worksheet/cardb_init.sql` is missing - please create it');
    }
  },
);


QUnit.test(
  'Create a file `worksheet/cardb.js`',
  (assert) => {
    try {
      fs.accessSync('./worksheet/cardb.js', fs.F_OK);
      assert.ok(true, '`worksheet/cardb.js` created');
    } catch (e) {
      assert.ok(false, '`worksheet/cardb.js` is missing - please create it');
    }

    const cardb = require('./worksheet/cardb'); // eslint-disable-line global-require

    assert.ok(typeof cardb.saveCar === 'function', 'cardb.js must export a function called `saveCar`');
    assert.ok(typeof cardb.getAveragePrice === 'function', 'cardb.js must export a function called `getAveragePrice`');
  },
);


QUnit.test(
  'Clear the database',
  async (assert) => {
    const config = require('./worksheet/config.json'); // eslint-disable-line global-require

    assert.expect(2);
    const done = assert.async();
    try {
      const sql = await mysql.createConnection(config.mysql);
      const [rows] = await sql.query(sql.format('select count(*) from ??', [config.mysql.table]));
      assert.ok('count(*)' in rows[0], 'Table ' + config.mysql.table + ' exists');
      await sql.query(sql.format('delete from ??', [config.mysql.table]));
      assert.ok(true, 'Table ' + config.mysql.table + ' cleared');
      await sql.end();
    } catch (e) {
      console.error(e);
      assert.ok(false, 'SQL error clearing table ' + config.mysql.table + ': ' + e);
    }
    done();
  },
);


QUnit.test(
  'saveCar',
  async (assert) => {
    const cardb = require('./worksheet/cardb'); // eslint-disable-line global-require
    const config = require('./worksheet/config.json'); // eslint-disable-line global-require

    assert.expect(3);
    const done = assert.async();
    try {
      const sql = await mysql.createConnection(config.mysql);
      let rows;

      await cardb.saveCar('han 5010', 'Ford', 'Harrison', 1980, 8999.99);
      [rows] = await sql.query(sql.format('select count(*) from ??', [config.mysql.table]));
      assert.equal(rows[0]['count(*)'], 1, 'Expecting one car in the table');

      // beware sql injection with spurious " and '
      await cardb.saveCar('bn18 qqq"', 'Brand', 'New', 2018, 15000);
      [rows] = await sql.query(sql.format('select count(*) from ??', [config.mysql.table]));
      assert.equal(rows[0]['count(*)'], 2, 'Expecting two cars in the table');

      await cardb.saveCar('abcd efg', 'Luxurius', 'Novus\'', 2018, 47000);
      [rows] = await sql.query(sql.format('select count(*) from ??', [config.mysql.table]));
      assert.equal(rows[0]['count(*)'], 3, 'Expecting three cars in the table');
      await sql.end();
    } catch (e) {
      console.error(e);
      assert.ok(false, 'Error saving car: ' + e);
    }

    done();
  },
);


QUnit.test(
  'getAveragePrice',
  async (assert) => {
    // test average for one car
    // test average for two cars
    // test average for nonexistent year
    const cardb = require('./worksheet/cardb'); // eslint-disable-line global-require

    assert.expect(5);
    const done = assert.async();

    try {
      let avg = await cardb.getAveragePrice(1980);
      assert.strictEqual(avg, 8999.99, 'the average price of cars from 1980 is 8999.99');

      avg = await cardb.getAveragePrice(2018);
      assert.strictEqual(avg, 31000, 'the average price of cars from 2018 is 31k');

      avg = await cardb.getAveragePrice(3000);
      assert.strictEqual(avg, null, 'no cars from 3000, the call should return null');

      avg = await cardb.getAveragePrice('\'30');
      assert.strictEqual(avg, null, 'no cars from \'30 - beware sql injection, the call should return null');

      avg = await cardb.getAveragePrice('"30');
      assert.strictEqual(avg, null, 'no cars from "30 - beware sql injection, the call should return null');
    } catch (e) {
      console.error(e);
      assert.ok(false, 'Error getting averages: ' + e);
    }

    done();
  },
);


QUnit.test(
  'close db connection',
  async (assert) => {
    const cardb = require('./worksheet/cardb'); // eslint-disable-line global-require

    assert.expect(1);
    const done = assert.async();

    try {
      await cardb.shutdown();
      assert.ok(true, 'if connection is not shut down correctly, the test will not finish');
    } catch (e) {
      console.error(e);
      assert.ok(false, 'Error getting averages: ' + e);
    }

    done();
  },
);
