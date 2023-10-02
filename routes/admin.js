var express = require("express");
var router = express.Router();
var adminHelpers = require("../helpers/admin-helpers");
var userHelpers = require("../helpers/user-helpers");
const adminVerify = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/admin-login");
  }
};

router.get("/", adminVerify, function (req, res, next) {
  let admin = req.session.admin;
  adminHelpers.getAllProducts().then((products) => {
    res.render("admin/adminhome", { admin, products });
  });
});
router.get("/admin-login", (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin");
  } else {
    res.render("admin/admin-login", {
      adminLoginErr: req.session.adminLoginErr,
    });
    req.session.adminLoginErr = false;
  }
});
router.post("/admin-login", (req, res) => {
  console.log(req.body);
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.loginStatus) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      res.redirect("/admin");
    } else {
      req.session.adminLoginErr = "Invalid admin name or password";
      res.redirect("/admin/admin-login");
    }
  });
});
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/admin-login");
});

router.get("/add-products", adminVerify, function (req, res, next) {
  res.render("admin/add-products", { admin: req.session.admin });
});
router.post("/add-products", function (req, res, next) {
  let images = req.files.image;
  adminHelpers.addProducts(req.body, (insertedId) => {
    images.mv("./public/images/" + insertedId + ".jpg", (err) => {
      if (!err) {
        res.redirect("/admin");
      } else {
        console.log(err);
      }
    });
  });
});
router.post("/delete-product", (req, res) => {
  adminHelpers.deleteProduct(req.body).then(async (response) => {
    res.json(response);
  });
});
router.get("/edit-products/:id", adminVerify, async (req, res) => {
  let products = await adminHelpers.editProducts(req.params.id);
  res.render("admin/edit-products", { admin: req.session.admin, products });
});
router.post("/edit-products/:id", (req, res) => {
  let proImages = req.files.image;
  adminHelpers.updateProducts(req.params.id, req.body).then(() => {
    if (req.files.image) {
      proImages.mv("./public/images/" + req.params.id + ".jpg");
    }
    res.redirect("/admin");
  });
});

router.get("/admin-view-order-products/:id", adminVerify, async (req, res) => {
  let orderProducts = await userHelpers.viewProducts(req.params.id);
  res.render("admin/admin-view-order-products", {
    admin: req.session.admin,
    orderProducts,
  });
});
router.post("/start-shipping/:id", adminVerify, (req, res) => {
  adminHelpers.startShipping(req.params.id).then(() => {
    res.json({ shipStatus: true });
  });
});
router.get("/admin-orders", adminVerify, async function (req, res, next) {
  let orders = await adminHelpers.getAdminOrders();
  res.render("admin/admin-orders", { admin: req.session.admin, orders });
});
router.get("/admin-placed", adminVerify, async function (req, res, next) {
  let orders = await adminHelpers.placedOrders();
  res.render("admin/admin-placed", { admin: req.session.admin, orders });
});
router.get("/admin-pending", adminVerify, async function (req, res, next) {
  let orders = await adminHelpers.pendingOrders();
  res.render("admin/admin-pending", { admin: req.session.admin, orders });
});
router.get("/admin-shipped", adminVerify, async function (req, res, next) {
  let orders = await adminHelpers.shippedOrders();
  res.render("admin/admin-shipped", { admin: req.session.admin, orders });
});

module.exports = router;
