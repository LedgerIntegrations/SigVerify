-- Check if database exists and create if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'sigverifydb') THEN
        CREATE DATABASE sigverifydb;
    END IF;
END
$$;

DROP TABLE IF EXISTS user_meta CASCADE;
DROP TABLE IF EXISTS user_email CASCADE;
DROP TABLE IF EXISTS user_auth CASCADE;

CREATE TABLE user_auth (
    id serial8 PRIMARY KEY,
    hashed_email character varying(64) NOT NULL UNIQUE,
    hashed_password character varying(64),
    auth_token character varying(64) UNIQUE,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

CREATE TABLE user_meta (
    id serial8 PRIMARY KEY,
    user_auth_id bigint UNIQUE NOT NULL REFERENCES user_auth(id),
    first_name character varying(42),
    last_name character varying(42),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

CREATE TABLE user_email (
    id serial8 PRIMARY KEY,
    user_meta_id bigint REFERENCES user_meta(id),
    email character varying(64) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

CREATE OR REPLACE FUNCTION update_modified_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;	
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER change_updated_at BEFORE UPDATE ON user_meta FOR EACH ROW EXECUTE FUNCTION update_modified_at();
CREATE TRIGGER change_updated_at BEFORE UPDATE ON user_email FOR EACH ROW EXECUTE FUNCTION update_modified_at();
CREATE TRIGGER change_updated_at BEFORE UPDATE ON user_auth FOR EACH ROW EXECUTE FUNCTION update_modified_at();

