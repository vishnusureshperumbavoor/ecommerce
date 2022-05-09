$(document).ready( function () {
  $('#order-table').DataTable();
});
$(document).ready( function () {
  $('#pending-table').DataTable();
});
$(document).ready( function () {
  $('#placed-table').DataTable();
});
$(document).ready( function () {
  $('#shipped-table').DataTable();
});
function addToCart(proId){
      $.ajax({
      url:'/add-to-cart/'+proId,
      method:'GET',
      success:(response)=>{
          if(response.status){
              let count = $('#cart-count').html()
                count = parseInt(count)+1 
              $("#cart-count").html(count)
          }
      }
    })
}
function changeQuantity(cartId,proId,userId,count){
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    let cnt = parseInt(count)
    $.ajax({
        url:'/change-product-quantity',
        data:{
            user : userId,
            cart : cartId,
            product : proId,
            count : cnt,
            quantity : quantity
        },
        method:'POST',
        success:(response)=>{
            if(response.removeProduct){
                alert("product removed from the cart")
                location.reload()
            }
            else{
                document.getElementById(proId).innerHTML = quantity + count;
                document.getElementById("total").innerHTML = response.total
            }
        }
    })
}
function deleteCart(cartId,proId){
  $.ajax({
      url:'/delete-cart',
      data:{
          cart : cartId,
          product : proId
      },
      method:'POST',
      success:(response)=>{
          if(response.removeProduct){
              location.reload()
          }
          else{
            alert("deletion error")
            location.reload()
          }
      }
  })
} 

$("#checkout-form").submit((e)=>{ 
  e.preventDefault() 
  $.ajax({ 
    url :'/place-order', 
    method:'POST', 
    data:$('#checkout-form').serialize(),
    success:(response)=>{
    if(response.CODsuccess){
      location.href='/order-success' 
    }
    else if(response.onlineFailed){
      alert("Error occured. Try again")
      location.href='/pending' 
    }
    else{
      razorpayPayment(response)
    }
} }) })
$("#pending-checkout").submit((e)=>{ 
  e.preventDefault() 
  $.ajax({ 
    url :'/pending-payment', 
    method:'POST', 
    data:$('#pending-checkout').serialize(),
    success:(response)=>{
    if(response.CODsuccess){
      location.href='/order-success' 
    }
    else if(response.onlineFailed){
      alert("Error occured. Try again")
      location.href='/pending' 
    }
    else{
      razorpayPayment(response)
    }
} }) })

function razorpayPayment(order){
  var options = {
    "key": "rzp_test_wAPQNdTltKIe1F", // Enter the Key ID generated from the Dashboard
    "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "VSP Industries",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "handler": function (response){
        // alert(response.razorpay_payment_id);
        // alert(response.razorpay_order_id);
        // alert(response.razorpay_signature)
        verifyPayment(response,order)
    },
    "prefill": {
        "name": "Vishnu Suresh",
        "email": "vishnusureshperumbavoor@gmail.com",
        "contact": "8714267479"
    },
    "notes": {
        "address": "Razorpay Corporate Office"
    },
    "theme": {
        "color": "#3399cc"
    }
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();
}

function verifyPayment(payment,order){
  $.ajax({
    url:'/verify-payment',
    data:{
      payment,
      order
    },
    method:'POST',
    success:(response)=>{
      if(response.status){
        location.href='/order-success' 
      }else{
        alert("payment failed")
      }
    }
  })
}
