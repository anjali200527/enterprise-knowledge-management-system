const neo4j = require('neo4j-driver');
try {
  neo4j.driver('"neo4j+s://ac289ec3.databases.neo4j.io"', neo4j.auth.basic('u','p'));
  console.log('SUCCESS: quotes');
} catch(e) {
  console.log('ERROR quotes:', e.message);
}
try {
  neo4j.driver('neo4j+s://ac289ec3.databases.neo4j.io', neo4j.auth.basic('u','p'));
  console.log('SUCCESS: no quotes');
} catch(e) {
  console.log('ERROR no quotes:', e.message);
}
try {
  neo4j.driver('null', neo4j.auth.basic('u','p'));
  console.log('SUCCESS: null string');
} catch(e) {
  console.log('ERROR null string:', e.message);
}
