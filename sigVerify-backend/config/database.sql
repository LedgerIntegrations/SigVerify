CREATE DATABASE sigverifydb;

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_metas CASCADE;

CREATE TABLE user_metas (
    user_meta_id serial8 PRIMARY KEY,
    first_name character varying(42),
    last_name character varying(42),
    email character varying(42) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

CREATE TABLE users (
    user_id serial8 PRIMARY KEY,
    meta_id bigint REFERENCES user_metas(user_meta_id),
    email_hash character varying(42) NOT NULL,
    password character varying(62) NOT NULL CHECK (LENGTH(password) > 7), --bcrypt hashed pw
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

CREATE TABLE auth (
    auth_id serial8 PRIMARY KEY,
    hashed_email character varying(256) NOT NULL UNIQUE,
    hashed_temp_pass character varying(62) NOT NULL,
    sign_up_token character varying(128) NOT NULL UNIQUE,
    user_id bigint REFERENCES users(user_id), -- link to users table
    created_at timestamp default current_timestamp,
    expires_at timestamp NOT NULL;
);

CREATE OR REPLACE FUNCTION update_modified_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;	
END;
$$ language 'plpgsql';

CREATE TRIGGER change_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_at();
CREATE TRIGGER change_updated_at BEFORE UPDATE ON user_metas FOR EACH ROW EXECUTE PROCEDURE update_modified_at();
