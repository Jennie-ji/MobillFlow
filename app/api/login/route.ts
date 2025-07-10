import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

async function connectToDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
  return connection;
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const connection = await connectToDatabase();
    
    // In a real application, you should hash the password before storing and compare the hash.
    // For simplicity, this example uses plaintext comparison.
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    await connection.end();

    const users = rows as any[];
    if (users.length > 0) {
      const user = users[0];
      return NextResponse.json({ success: true, user: { username: user.username } });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'An error occurred.' }, { status: 500 });
  }
}
