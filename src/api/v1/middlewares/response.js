const ApiError = require("./apiError");
class Response {
  constructor(res, success, err, data, message) {
    var out = {
      success: success,
    };
    if (success) {
      out.message = message;
      if (data) out.data = data;
      res.status(200).send(out);
      return;
    }

    console.log(err);
    if (err instanceof ApiError) {
      out.message = err.message;
      res.status(err.code).send(out);
      return;
    }

    res.status(500).send("Internal Server error");
  }

  static error(res, err) {
    return new Response(res, false, err);
  }
  static success(res, message, data) {
    return new Response(res, true, null, data, message);
  }
}

module.exports = Response;
