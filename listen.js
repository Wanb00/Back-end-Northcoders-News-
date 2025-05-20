const app = require("./db/app.js");
const { PORT } = process.env;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));