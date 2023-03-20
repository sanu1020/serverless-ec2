const { EC2Client } = require("@aws-sdk/client-ec2");
const client = new EC2Client({ region: "us-east-1"});

module.exports = client;