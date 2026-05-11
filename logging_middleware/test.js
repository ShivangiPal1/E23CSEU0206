const Log = require("./index");

async function testLog() {

  const response = await Log(
    "backend",
    "info",
    "handler",
    "Testing logging middleware"
  );

  console.log(response);

}

testLog();