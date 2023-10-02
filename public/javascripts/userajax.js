
$(document).ready(function () {
  $("#order-table").DataTable();
});
$(document).ready(function () {
  $("#pending-table").DataTable();
});
$(document).ready(function () {
  $("#placed-table").DataTable();
});
$(document).ready(function () {
  $("#shipped-table").DataTable();
});
function addToCart(proId) {
  $.ajax({
    url: "/add-to-cart/" + proId,
    method: "GET",
    success: (response) => {
      if (response.status) {
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
      }
    },
  });
}
function changeQuantity(cartId, proId, userId, count) {
  let quantity = parseInt(document.getElementById(proId).innerHTML);
  let cnt = parseInt(count);
  $.ajax({
    url: "/change-product-quantity",
    data: {
      user: userId,
      cart: cartId,
      product: proId,
      count: cnt,
      quantity: quantity,
    },
    method: "POST",
    success: (response) => {
      if (response.removeProduct) {
        alert("product removed from the cart");
        location.reload();
      } else {
        document.getElementById(proId).innerHTML = quantity + count;
        document.getElementById("total").innerHTML = response.total;
      }
    },
  });
}
function deleteCart(cartId, proId) {
  $.ajax({
    url: "/delete-cart",
    data: {
      cart: cartId,
      product: proId,
    },
    method: "POST",
    success: (response) => {
      if (response.removeProduct) {
        location.reload();
      } else {
        alert("deletion error");
        location.reload();
      }
    },
  });
}

$("#checkout-form").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/place-order",
    method: "POST",
    data: $("#checkout-form").serialize(),
    success: (response) => {
      if (response.CODsuccess) {
        location.href = "/order-success";
      } else if (response.onlineFailed) {
        alert("Error occured. Try again");
        location.href = "/pending";
      } else {
        razorpayPayment(response);
      }
    },
  });
});
$("#pending-checkout").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/pending-payment",
    method: "POST",
    data: $("#pending-checkout").serialize(),
    success: (response) => {
      if (response.CODsuccess) {
        location.href = "/order-success";
      } else if (response.onlineFailed) {
        alert("Error occured. Try again");
        location.href = "/pending";
      } else {
        razorpayPayment(response);
      }
    },
  });
});

function razorpayPayment(order) {
  var options = {
    key: "rzp_test_xONB6ZRVd3ZDkb",
    amount: order.amount, 
    currency: "INR",
    name: "VSP Industries",
    description: "Test Transaction",
    image: "https://example.com/your_logo",
    order_id: order.id,
    handler: function (response) {
      verifyPayment(response, order);
    },
    prefill: {
      name: "Vishnu Suresh",
      email: "vishnusureshperumbavoor@gmail.com",
      contact: "871426000",
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#3399cc",
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();
}

function verifyPayment(payment, order) {
  $.ajax({
    url: "/verify-payment",
    data: {
      payment,
      order,
    },
    method: "POST",
    success: (response) => {
      if (response.status) {
        location.href = "/order-success";
      } else {
        alert("payment failed");
      }
    },
  });
}
