const mysql = require('mysql2/promise');
let db;

async function initializeDatabase() {
  try {
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    await db.query('CREATE DATABASE IF NOT EXISTS Dogs');
    await db.query('USE Dogs');
    await db.execute(`CREATE TABLE IF NOT EXISTS Users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('owner', 'walker') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

    await db.execute(`CREATE TABLE IF NOT EXISTS Dogs (
            dog_id INT AUTO_INCREMENT PRIMARY KEY,
            owner_id INT NOT NULL,
            name VARCHAR(50) NOT NULL,
            size ENUM('small', 'medium', 'large') NOT NULL,
            FOREIGN KEY (owner_id) REFERENCES Users(user_id)
        )`);

    await db.execute(`CREATE TABLE IF NOT EXISTS WalkRequests (
            request_id INT AUTO_INCREMENT PRIMARY KEY,
            dog_id INT NOT NULL,
            requested_time DATETIME NOT NULL,
            duration_minutes INT NOT NULL,
            location VARCHAR(255) NOT NULL,
            status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
        )`);

    await db.execute(`CREATE TABLE IF NOT EXISTS WalkRatings (
            rating_id INT AUTO_INCREMENT PRIMARY KEY,
            request_id INT NOT NULL,
            walker_id INT NOT NULL,
            owner_id INT NOT NULL,
            rating INT CHECK (rating BETWEEN 1 AND 5),
            comments TEXT,
            rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
            FOREIGN KEY (walker_id) REFERENCES Users(user_id),
            FOREIGN KEY (owner_id) REFERENCES Users(user_id),
            UNIQUE (request_id)
        )`);

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
