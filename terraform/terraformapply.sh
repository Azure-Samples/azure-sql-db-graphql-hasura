echo "Starting terraform initialization."

terraform init

echo "Starting terraform of $DATABASESERVER."

terraform apply \
  -var 'sqlserver='$DATABASESERVER'' \
  -var 'server=terrazuraserver' \
  -var 'username='$PUSERNAME'' \
  -var 'password='$PPASSWORD'' \
  -var 'sqluid='$SQLUID'' \
  -var 'sqlpwd='$SQLPWD'' \
  -var 'pgdatabase=terrazuradb' \
  -var 'sqlserverdb='$DATABASE'' \
  -var 'apiport=8080'

cd ../hasura

hasura migrate apply --database-name sqlserverdb
hasura metadata apply
hasura console