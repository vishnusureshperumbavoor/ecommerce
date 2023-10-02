var express = require("express");
var router = express.Router();
var adminHelpers = require("../helpers/admin-helpers");
var userHelpers = require("../helpers/user-helpers");
const userVerify = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", userVerify, async function (req, res, next) {
  let cartCount = null;
  let user = req.session.user;
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  adminHelpers.getAllProducts(req.body).then((products) => {
    res.render("user/userhome", { products, user, cartCount });
  });
});
router.get("/signup", (req, res) => {
  res.render("user/signup");
});
router.post("/signup", (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    req.session.user = response.user;
    req.session.userLoggedIn = true;
    res.redirect("/");
  });
});
router.get("/login", (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { userLoginErr: req.session.userLoginErr });
    req.session.userLoginErr = false;
  }
});
router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.loginStatus) {
      req.session.user = response.user;
      req.session.userLoggedIn = true;
      res.redirect("/");
    } else {
      req.session.userLoginErr = "Invalid username or password";
      res.redirect("/login");
    }
  });
});
router.get("/logout", (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect("/");
});
router.get("/add-to-cart/:id", (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});
router.get("/cart", userVerify, async (req, res) => {
  let user = req.session.user;
  let products = await userHelpers.getCartProducts(req.session.user._id);
  let cartCount = await userHelpers.getCartCount(req.session.user._id);
  let total = await userHelpers.getTotalAmount(req.session.user._id);
  res.render("user/cart", { products, user, cartCount, total });
});
router.post("/change-product-quantity", (req, res) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user);
    res.json(response);
  });
});
router.post("/delete-cart", (req, res) => {
  userHelpers.deleteCart(req.body).then(async (response) => {
    res.json(response);
  });
});
router.get("/place-order", userVerify, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id);
  if (total) {
    res.render("user/placeorder", { total, user: req.session.user });
  } else {
    res.redirect("/");
  }
});
router.get("/order-success", userVerify, async (req, res) => {
  res.render("user/order-success", { user: req.session.user });
});
router.post("/place-order", async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId);
  if (products) {
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
    userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
      if (req.body["payment-method"] == "COD") {
        res.json({ CODsuccess: true });
      } else {
        userHelpers
          .generateRazorpay(orderId, totalPrice)
          .then((response) => {
            res.json(response);
          })
          .catch(() => {
            res.json({ onlineFailed: true });
          });
      }
    });
  } else {
    res.json();
  }
});
router.post("/verify-payment", (req, res) => {
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        res.json({ status: true });
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "" });
    });
});
router.get("/orders", userVerify, async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id);
  res.render("user/orders", { user: req.session.user, orders });
});
router.get("/placed", userVerify, async function (req, res, next) {
  let orders = await userHelpers.placedOrders(req.session.user._id);
  res.render("user/placed", { user: req.session.user, orders });
});
router.get("/pending", userVerify, async function (req, res, next) {
  let orders = await userHelpers.pendingOrders(req.session.user._id);
  res.render("user/pending", { user: req.session.user, orders });
});
router.get("/shipped", userVerify, async function (req, res, next) {
  let orders = await userHelpers.shippedOrders(req.session.user._id);
  res.render("user/shipped", { user: req.session.user, orders });
});
router.get("/view-products/:id", userVerify, async (req, res) => {
  let orderProducts = await userHelpers.viewProducts(req.params.id);
  res.render("user/view-products", { user: req.session.user, orderProducts });
});
router.get("/pending-payment/:id", userVerify, (req, res) => {
  userHelpers.totalPending(req.params.id).then((response) => {
    res.render("user/pending-payment", { user: req.session.user, response });
  });
});
router.post("/pending-payment", (req, res) => {
  console.log(req.body);
  if (req.body["payment-method"] == "COD") {
    userHelpers.pendingCOD(req.body.orderId).then(() => {
      res.json({ CODsuccess: true });
    });
  } else {
    userHelpers
      .generateRazorpay(req.body.orderId, req.body.totalAmount)
      .then((response) => {
        res.json(response);
      })
      .catch(() => {
        res.json({ onlineFailed: true });
      });
  }
});

module.exports = router;
