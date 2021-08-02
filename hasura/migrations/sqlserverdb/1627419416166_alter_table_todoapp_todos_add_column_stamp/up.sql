ALTER TABLE "todoapp"."todos" ADD "stamp" date NOT NULL CONSTRAINT "default_sqlserverdb_todoapp_todos_stamp" DEFAULT 'GETDATE()' WITH VALUES;
