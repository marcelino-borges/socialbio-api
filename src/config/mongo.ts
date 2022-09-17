import mongoose from "mongoose";
import { log } from "../utils/utils";

const connect = async () => {
  if (!process.env.MONGO_CONNECTION_STRING) return;

  console.log("Connecting to mongo...");

  log(
    "process.env.MONGO_CONNECTION_STRING:",
    process.env.MONGO_CONNECTION_STRING
  );
  await mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    ignoreUndefined: true,
  });

  const db = mongoose.connection;

  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function () {
    console.log("MongoDB connected!");
  });
};

export default connect;
