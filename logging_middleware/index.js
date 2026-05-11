const axios = require("axios");

const {
  VALID_STACKS,
  VALID_LEVELS,
  VALID_PACKAGES
} = require("./constants");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJlMjNjc2V1MDIwNkBiZW5uZXR0LmVkdS5pbiIsImV4cCI6MTc3ODQ4MjQwMCwiaWF0IjoxNzc4NDgxNTAwLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNzk5ZDg0MGYtMzUwZC00MDdjLWI0MmUtNjVmZjQxYjU0MWRkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic2hpdmFuZ2kgcGFsIiwic3ViIjoiNjgxMjRlMGUtNTQ5Mi00ZDI4LWJkNmYtNWEwMWIyMzNhNDFjIn0sImVtYWlsIjoiZTIzY3NldTAyMDZAYmVubmV0dC5lZHUuaW4iLCJuYW1lIjoic2hpdmFuZ2kgcGFsIiwicm9sbE5vIjoiZTIzY3NldTAyMDYiLCJhY2Nlc3NDb2RlIjoiVGZEeGdyIiwiY2xpZW50SUQiOiI2ODEyNGUwZS01NDkyLTRkMjgtYmQ2Zi01YTAxYjIzM2E0MWMiLCJjbGllbnRTZWNyZXQiOiJUallHd3lHalN4QlFLa1p1In0.13Qzg6AYIt_tApFpB5FKQouvMbVAIDJqTdATUIZprkE";

async function Log(stack, level, packageName, message) {
  try {

    // validations

    if (!VALID_STACKS.includes(stack)) {
      throw new Error("Invalid stack value");
    }

    if (!VALID_LEVELS.includes(level)) {
      throw new Error("Invalid level value");
    }

    const allowedPackages = [
      ...VALID_PACKAGES.common,
      ...(VALID_PACKAGES[stack] || [])
    ];

    if (!allowedPackages.includes(packageName)) {
      throw new Error("Invalid package value");
    }

    const response = await axios.post(
      "http://4.224.186.213/evaluation-service/logs",

      {
        stack,
        level,
        package: packageName,
        message
      },

      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (error) {

    console.error(
      "Logging middleware error:",
      error.response?.data || error.message
    );

  }
}

module.exports = Log;