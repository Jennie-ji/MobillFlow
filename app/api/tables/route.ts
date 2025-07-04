import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "bootkathon",
  port: 3306,
});

// [unchanged import and pool setup]

const allowedTables = [
  "inventory",
  "inbound",
  "outbound",
  "materialmaster",
  "operationcost",
  "forecast",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const table = searchParams.get("table");
    const search = searchParams.get("search");
    const plant = searchParams.get("plant");
    const currency = searchParams.get("currency");
    const transport = searchParams.get("transport");
    const polymer_type = searchParams.get("polymer_type");
    const warehouse = searchParams.get("warehouse");
    const order = searchParams.get("order") || "none";
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!table || !allowedTables.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    const whereClauses: string[] = [];
    const params: any[] = [];

    // ✅ Search conditions
    if (search) {
      if (table === "outbound") {
        whereClauses.push(
          `(LOWER(MATERIAL_NAME) LIKE ? OR LOWER(CUSTOMER_NUMBER) LIKE ?)`
        );
        params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
      } else if (table === "inventory") {
        whereClauses.push(
          `(LOWER(MATERIAL_NAME) LIKE ? OR LOWER(BATCH_NUMBER) LIKE ?)`
        );
        params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
      } else {
        whereClauses.push(`LOWER(MATERIAL_NAME) LIKE ?`);
        params.push(`%${search.toLowerCase()}%`);
      }
    }

    if (plant && plant !== "all") {
      whereClauses.push(`PLANT_NAME = ?`);
      params.push(plant);
    }

    if (currency && currency !== "all") {
      whereClauses.push(`CURRENCY = ?`);
      params.push(currency);
    }

    if (transport && transport !== "all") {
      whereClauses.push(`MODE_OF_TRANSPORT = ?`);
      params.push(transport);
    }

    if (polymer_type && polymer_type !== "all") {
      whereClauses.push(`POLYMER_TYPE = ?`);
      params.push(polymer_type);
    }

    if (warehouse && warehouse !== "all" && table === "forecast") {
      whereClauses.push(`WAREHOUSE = ?`);
      params.push(warehouse);
    }

    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";

    // 🔽 ORDER BY
    let orderSQL = "";
    if (table === "inventory") {
      if (order === "date_asc") orderSQL = "ORDER BY BALANCE_AS_OF_DATE ASC";
      else if (order === "date_desc")
        orderSQL = "ORDER BY BALANCE_AS_OF_DATE DESC";
      else if (order === "value_asc")
        orderSQL = "ORDER BY STOCK_SELL_VALUE ASC";
      else if (order === "value_desc")
        orderSQL = "ORDER BY STOCK_SELL_VALUE DESC";
    }

    if (table === "inbound") {
      if (order === "date_asc") orderSQL = "ORDER BY INBOUND_DATE ASC";
      else if (order === "date_desc") orderSQL = "ORDER BY INBOUND_DATE DESC";
      else if (order === "quantity_asc")
        orderSQL = "ORDER BY NET_QUANTITY_MT ASC";
      else if (order === "quantity_desc")
        orderSQL = "ORDER BY NET_QUANTITY_MT DESC";
    }

    if (table === "outbound") {
      if (order === "date_asc") orderSQL = "ORDER BY OUTBOUND_DATE ASC";
      else if (order === "date_desc") orderSQL = "ORDER BY OUTBOUND_DATE DESC";
      else if (order === "quantity_asc")
        orderSQL = "ORDER BY NET_QUANTITY_MT ASC";
      else if (order === "quantity_desc")
        orderSQL = "ORDER BY NET_QUANTITY_MT DESC";
    }

    if (table === "materialmaster") {
      if (order === "shelf_life_asc")
        orderSQL = "ORDER BY SHELF_LIFE_IN_MONTH ASC";
      else if (order === "shelf_life_desc")
        orderSQL = "ORDER BY SHELF_LIFE_IN_MONTH DESC";
      else if (order === "value_lost_asc")
        orderSQL = "ORDER BY DOWNGRADE_VALUE_LOST_PERCENT ASC";
      else if (order === "value_lost_desc")
        orderSQL = "ORDER BY DOWNGRADE_VALUE_LOST_PERCENT DESC";
    }

    const sql = `SELECT * FROM ${table} ${whereSQL} ${orderSQL} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query<any[]>(sql, params);

    const columns = rows.length ? Object.keys(rows[0]) : [];
    const data = rows.map((r) =>
      columns.map((col) => {
        const val = r[col];
        if (col.toLowerCase().includes("date") && val) {
          const date = new Date(val);
          return isNaN(date.getTime()) ? val : date.toISOString().split("T")[0];
        }
        return val;
      })
    );

    return NextResponse.json({
      table: { name: table, columns, data },
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
