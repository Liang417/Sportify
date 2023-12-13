CREATE EXTENSION postgis;
CREATE INDEX location_idx ON activity USING GIST (location);

CREATE TABLE "user" (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(30),
  email VARCHAR(30) UNIQUE,
  password VARCHAR(255),
  avatar VARCHAR(255),
  CONSTRAINT non_negative_id CHECK (id >= 0)
);

CREATE TABLE "tag" (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE
);

CREATE TABLE "activity" (
  id BIGSERIAL PRIMARY KEY,
  host_id INT REFERENCES "user" (id),
  type_id INT REFERENCES "activity_type" (id),
  chatroom_id INT REFERENCES "chatroom" (id),
  title VARCHAR(100),
  location GEOGRAPHY(Point, 4326),
  location_name VARCHAR(255),
  price INT,
  attendees_limit INT,
  current_attendees_count INT DEFAULT 1,
  start_from TIMESTAMP,
  end_at TIMESTAMP,
  dateline TIMESTAMP,
  description TEXT,
  create_at TIMESTAMP DEFAULT NOW(),
  picture VARCHAR(255)
);

CREATE TABLE "activity_user" (
  activity_id INT REFERENCES "activity" (id),
  user_id INT REFERENCES "user" (id),
  PRIMARY KEY (activity_id, user_id)
);

CREATE TABLE "activity_tag" (
  activity_id INT REFERENCES "activity" (id),
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
  chatroom_id INT REFERENCES "chatroom" (id),
  user_id INT REFERENCES "user" (id),
  PRIMARY KEY (chatroom_id, user_id)
);

CREATE TABLE "message" (
  id BIGSERIAL PRIMARY KEY,
  chatroom_id INT REFERENCES "chatroom" (id),
  sender_id INT REFERENCES "user" (id),
  content TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "notification" (
  id BIGSERIAL PRIMARY KEY,
  receiver_id INT REFERENCES "user" (id),
  activity_id INT,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "comment" (
  id BIGSERIAL PRIMARY KEY,
  activity_id INT REFERENCES "activity" (id),
  user_id INT REFERENCES "user" (id),
  content TEXT,
  comment_at TIMESTAMP DEFAULT NOW()
);