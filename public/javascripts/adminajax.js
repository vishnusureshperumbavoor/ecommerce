$(document).ready( function () {
    $('#product-table').DataTable();
});
$(document).ready( function () {
    $('#admin-order-table').DataTable();
});
$(document).ready( function () {
    $('#admin-pending-table').DataTable();
});
$(document).ready( function () {
    $('#admin-placed-table').DataTable();
});
$(document).ready( function () {
    $('#admin-shipped-table').DataTable();
});

function viewImage(event){ 
    image = event.target.files[0]
    document.getElementById("imgView").src  = URL.createObjectURL(image) 
}

function deleteProduct(proId){
    $.ajax({
        url:'/admin/delete-product',
        data:{
          product : proId
        },
        method:'POST',
        success:(response)=>{
            if(response.removeProduct){
                location.reload()
            }
            else{
              alert("there is a problem with removing the product from the cart")
              location.reload()
            }
        }
    })
  }
function startShipping(orderId){
    $.ajax({
    url:'/admin/start-shipping/'+orderId,
    method:'POST',
    success:(response)=>{
        if(response.shipStatus){
            location.reload()
        }
    }
  })
}