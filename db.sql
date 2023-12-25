CREATE EXTENSION postgis;

CREATE INDEX location_idx ON activity USING GIST (location);

CREATE TABLE "user" (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  email VARCHAR(30) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) NOT NULL
);

CREATE TABLE "tag" (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(15) UNIQUE NOT NULL
);

CREATE TABLE "activity" (
  id BIGSERIAL PRIMARY KEY,
  host_id INT REFERENCES "user" (id) ON DELETE CASCADE,
  type_id INT REFERENCES "activity_type" (id),
  chatroom_id INT REFERENCES "chatroom" (id),
  title VARCHAR(100),
  location GEOGRAPHY(Point, 4326),
  location_name VARCHAR(255),
  price INT CHECK (price >= 0),
  attendees_limit INT CHECK (attendees_limit >= 2),
  current_attendees_count INT DEFAULT 1 CHECK(current_attendees_count >= 1),
  start_from TIMESTAMP,
  end_at TIMESTAMP,
  dateline TIMESTAMP,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  picture VARCHAR(255)
);

CREATE TABLE "activity_user" (
  activity_id INT REFERENCES "activity" (id) ON DELETE CASCADE,
  user_id INT REFERENCES "user" (id) ON DELETE CASCADE,
  PRIMARY KEY (activity_id, user_id)
);

CREATE TABLE "activity_tag" (
  activity_id INT REFERENCES "activity" (id) ON DELETE CASCADE,
  tag_id INT REFERENCES "tag" (id),
  PRIMARY KEY (activity_id, tag_id)
);

CREATE TABLE "activity_type" (
  id serial PRIMARY KEY,
  name VARCHAR(30) UNIQUE
);

CREATE TABLE "chatroom" (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(30),
  is_private BOOLEAN DEFAULT false
);

CREATE TABLE "chatroom_user" (
  chatroom_id INT REFERENCES "chatroom" (id) ON DELETE CASCADE,
  user_id INT REFERENCES "user" (id) ON DELETE CASCADE,
  PRIMARY KEY (chatroom_id, user_id)
);

CREATE TABLE "message" (
  id BIGSERIAL PRIMARY KEY,
  chatroom_id INT REFERENCES "chatroom" (id) ON DELETE CASCADE,
  sender_id INT REFERENCES "user" (id) ON DELETE CASCADE,
  content TEXT,
  send_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "notification" (
  id BIGSERIAL PRIMARY KEY,
  receiver_id INT REFERENCES "user" (id) ON DELETE CASCADE,
  activity_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "comment" (
  id BIGSERIAL PRIMARY KEY,
  activity_id INT REFERENCES "activity" (id) ON DELETE CASCADE,
  user_id INT REFERENCES "user" (id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  comment_at TIMESTAMP DEFAULT NOW()
);