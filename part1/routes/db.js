const mysql = require('mysql2/promise');
let db;

async function initializeDatabase() {
  try {
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });

    const [userCount] = await db.query('SELECT COUNT(*) AS count FROM Users');
    if (userCount[0].count === 0) {
      await db.query(`INSERT INTO Users (username, email, password_hash, role) VALUES
                ('alice123', 'alice@example.com', 'hashed123', 'owner'),
                ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
                ('carol123', 'carol@example.com', 'hashed789', 'owner'),
                ('johnnywalker', 'johnnywalker@example.com', 'hashed000', 'walker'),
                ('harsh123', 'harsh@example.com', 'hashed999', 'owner')
            `);

      await db.query(`INSERT INTO Dogs (owner_id, name, size) VALUES
                ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
                ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
                ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Oreo', 'large'),
                ((SELECT user_id FROM Users WHERE username = 'harsh123'), 'Haley', 'medium'),
                ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Panda', 'small')
            `);

      await db.query(`INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
                ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
                ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
                ((SELECT dog_id FROM Dogs WHERE name = 'Oreo'), '2025-06-11 07:00:00', 60, 'Botanic Garden', 'completed'),
                ((SELECT dog_id FROM Dogs WHERE name = 'Haley'), '2025-06-11 10:15:00', 40, 'Riverside Walk', 'completed'),
                ((SELECT dog_id FROM Dogs WHERE name = 'Panda'), '2025-06-12 08:45:00', 35, 'Central Park', 'cancelled');
            `);

      await db.query(`INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments) VALUES
                (3, (SELECT user_id FROM Users WHERE username = 'bobwalker'), (SELECT user_id FROM Users WHERE username = 'alice123'), 5, 'Great walk!'),
                (4, (SELECT user_id FROM Users WHERE username = 'bobwalker'), (SELECT user_id FROM Users WHERE username = 'harsh123'), 4, 'On time and professional')
            `);
    }

  } catch (error) {
    console.error('Database setup error:', error);
  }
}

function getDb() {
  return db;
}

module.exports = {
  initializeDatabase,
  getDb
};
