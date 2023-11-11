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
    created_at timestamptz default current_timestamptz,
    updated_at timestamptz default current_timestamptz
);

CREATE TABLE user_meta (
    id serial8 PRIMARY KEY,
    user_auth_id bigint UNIQUE NOT NULL REFERENCES user_auth(id),
    first_name character varying(42),
    last_name character varying(42),
    created_at timestamptz default current_timestamptz,
    updated_at timestamptz default current_timestamptz
);

CREATE TABLE user_email (
    id serial8 PRIMARY KEY,
    user_meta_id bigint REFERENCES user_meta(id),
    email character varying(84) NOT NULL UNIQUE,
    created_at timestamptz default current_timestamptz,
    updated_at timestamptz default current_timestamptz
);

-- TEMPORARY IMPLEMENTATION OF FUTURE DOCUMENT TABLES AND SIGNATURE TAG

-- CREATE TABLE document_bundle (
--     id serial8 PRIMARY KEY,
--     name character varying(255) NOT NULL,
--     description character varying(500),
--     totalPages 
--     created_at timestamptz default current_timestamptz,
--     updated_at timestamptz default current_timestamptz
-- );

-- CREATE TABLE document (
--     id serial8 PRIMARY KEY,
--     bundle_id bigint NOT NULL REFERENCES document_bundle(id),
--     document_type_id bigint NOT NULL REFERENCES document_type(id),
--     document_name character varying(255) NOT NULL,
--     document_hash character varying(255) NOT NULL,
--     created_at timestamptz default current_timestamptz,
--     updated_at timestamptz default current_timestamptz
-- );

-- CREATE TABLE document_type (
--     id serial8 PRIMARY KEY,
--     type_name character varying(255) NOT NULL,
--     description text,
--     created_at timestamptz default current_timestamptz,
--     updated_at timestamptz default current_timestamptz
-- );

-- CREATE TABLE signature_tag (
--     id serial8 PRIMARY KEY,
--     document_id bigint NOT NULL REFERENCES document(id),
--     tagger_id bigint NOT NULL,
--     tag_data jsonb,
--     created_at timestamptz default current_timestamptz,
--     updated_at timestamptz default current_timestamptz
-- );


CREATE OR REPLACE FUNCTION update_modified_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;	
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER change_updated_at_user_meta
BEFORE UPDATE ON user_meta
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER change_updated_at_user_email
BEFORE UPDATE ON user_email
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

CREATE TRIGGER change_updated_at_user_auth
BEFORE UPDATE ON user_auth
FOR EACH ROW EXECUTE FUNCTION update_modified_at();