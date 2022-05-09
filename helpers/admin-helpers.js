var db = require('../database/connections')
var collection = require('../database/collections')
var objectId = require('mongodb').ObjectId
const fs = require('fs')
var md5 = require('md5')
// exports
module.exports = {
    doLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let response = { }
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})
            if(admin){
                    if(md5(adminData.password)==admin.password){
                        response.admin = admin
                        response.loginStatus = true
                        resolve(response)
                    }else{                        
                        resolve({loginStatus:false})
                    }
            }else{
                resolve({loginStatus:false})    
            }
        })
    },
    addProducts:(product,callback)=>{
        db.get().collection(collection.PRODUCT_COLLLECTION).insertOne(product).then((data)=>{
            callback(data.insertedId)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLLECTION).find().toArray()
            resolve(products)
        })
    },
    // deleteProduct:(proId)=>{   
    //     return new Promise(async(resolve,reject)=>{
    //         let deleteItem = await db.get().collection(collection.PRODUCT_COLLLECTION).removeOne({_id:objectId(proId)})
    //         let path = './public/images/'+proId+'.jpg';
    //         await fs.unlinkSync(path)            
    //         resolve(deleteItem)
    //     })
    // },
    deleteProduct(details){
        return new Promise(async(resolve,reject)=>{
                db.get().collection(collection.PRODUCT_COLLLECTION).deleteOne({_id:objectId(details.product)})
                let path = './public/images/'+details.product+'.jpg';
                await fs.unlinkSync(path)
                db.get().collection(collection.CART_COLLECTION).updateMany({},
                    { 
                        $pull : { products : { item : objectId(details.product.toString())}}
                    }
                )   
                resolve({removeProduct:true})         
        })
    },
    editProducts:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product) 
            })
        })
    },
    updateProducts:(proId,proDetails)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLLECTION).updateOne({_id:objectId(proId)},
            {
                $set:{
                    name:proDetails.name,
                    category:proDetails.category,
                    price:proDetails.price
                }
            }
            )
            .then((response)=>{
                resolve(response)
            })
        })
    },
    getAdminOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({}).toArray()
            resolve(orders)
        })
    },
    startShipping:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
            {
                $set:{
                    status : 'shipped'
                }
            }
            ).then(()=>{
                resolve()
            })
        })
    },
    placedOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({"status":"placed"}).toArray()
            resolve(orders)
        })
    },
    pendingOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({"status":"pending"}).toArray()
            resolve(orders)
        })
    },
    shippedOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({"status":"shipped"}).toArray()
            resolve(orders)
        })
    },

}