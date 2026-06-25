const verifyAdmin = (
  usersCollection
) => {
  return async (
    req,
    res,
    next
  ) => {
    const email =
      req.decoded.email;

    const user =
      await usersCollection.findOne({
        email,
      });

    if (
      !user ||
      user.role?.toLowerCase() !==
        "admin"
    ) {
      return res.status(403).send({
        message:
          "Admin Access Only",
      });
    }

    next();
  };
};

module.exports = verifyAdmin;