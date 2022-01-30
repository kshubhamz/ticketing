export const environment = {
  DB_URL: process.env.DB_URL!.replace("-m ", "").replace(/^\s+|\s+$/g, ""),
  SALT_ROUNDS: process.env
    .SALT_ROUNDS!.replace("-m ", "")
    .replace(/^\s+|\s+$/g, ""),
  SECRET_KEY: process.env
    .SECRET_KEY!.replace("-m ", "")
    .replace(/^\s+|\s+$/g, ""),
};
