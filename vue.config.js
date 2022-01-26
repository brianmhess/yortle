module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/yortle/" : "/",
  devServer: {
    host: 'localhost',
    port: 9999
  },
};
